import type {CodeKeywordDefinition} from "../../types"
import type KeywordCxt from "../../compile/context"
import {schemaProperties, usePattern} from "../code"
import {_, not} from "../../compile/codegen"
import {Type} from "../../compile/subschema"
import {checkStrictMode} from "../../compile/validate"
import {evaluatedPropsToName} from "../../compile/util"

const def: CodeKeywordDefinition = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(cxt: KeywordCxt) {
    const {gen, schema, data, parentSchema, it} = cxt
    const {opts} = it
    const patterns = schemaProperties(it, schema)
    if (patterns.length === 0) return
    const checkProperties = opts.strict && !opts.allowMatchingProperties && parentSchema.properties
    const valid = gen.name("valid")
    const props = it.props === true ? it.props : evaluatedPropsToName(gen, it.props)
    validatePatternProperties()

    function validatePatternProperties(): void {
      for (const pat of patterns) {
        if (checkProperties) checkMatchingProperties(pat)
        if (it.allErrors) {
          validateProperties(pat)
        } else {
          gen.var(valid, true) // TODO var
          validateProperties(pat)
          gen.if(valid)
        }
      }
    }

    function checkMatchingProperties(pat: string): void {
      for (const prop in checkProperties) {
        if (new RegExp(pat).test(prop)) {
          checkStrictMode(
            it,
            `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`
          )
        }
      }
    }

    function validateProperties(pat: string): void {
      gen.forIn("key", data, (key) => {
        gen.if(_`${usePattern(gen, pat)}.test(${key})`, () => {
          cxt.subschema(
            {
              keyword: "patternProperties",
              schemaProp: pat,
              dataProp: key,
              dataPropType: Type.Str,
              strictSchema: it.strictSchema,
            },
            valid
          )
          if (it.opts.next && props !== true) {
            gen.assign(_`${props}[${key}]`, true)
          } else if (!it.allErrors) {
            // can short-circuit if `unevaluatedProperties` is not supported (opts.next === false)
            // or if all properties were evaluated (props === true)
            gen.if(not(valid), () => gen.break())
          }
        })
      })
    }
  },
}

export default def
