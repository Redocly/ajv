import {CodeKeywordDefinition} from "../../types"
import KeywordContext from "../../compile/context"
import {schemaProperties, usePattern} from "../util"
import {applySubschema, Type} from "../../compile/subschema"
import {_} from "../../compile/codegen"

const def: CodeKeywordDefinition = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(cxt: KeywordContext) {
    const {gen, schema, data, it} = cxt
    const patterns = schemaProperties(it, schema)
    if (patterns.length === 0) return
    const valid = gen.name("valid")
    validatePatternProperties()

    function validatePatternProperties() {
      for (const pat of patterns) {
        if (it.allErrors) {
          validateProperties(pat)
        } else {
          gen.var(valid, true) // TODO var
          validateProperties(pat)
          gen.if(valid)
        }
      }
    }

    function validateProperties(pat: string) {
      gen.forIn("key", data, (key) => {
        gen.if(_`${usePattern(gen, pat)}.test(${key})`, () => {
          applySubschema(
            it,
            {
              keyword: "patternProperties",
              schemaProp: pat,
              dataProp: key,
              dataPropType: Type.Str,
            },
            valid
          )
          if (!it.allErrors) gen.ifNot(valid, _`break`)
        })
      })
    }
  },
}

module.exports = def
