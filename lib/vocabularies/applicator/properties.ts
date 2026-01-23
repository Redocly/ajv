import type {CodeKeywordDefinition, KeywordErrorDefinition} from "../../types"
import {KeywordCxt} from "../../compile/validate"
import {propertyInData, allSchemaProperties} from "../code"
import {alwaysValidSchema, toHash, mergeEvaluated} from "../../compile/util"
import {_, str, Name} from "../../compile/codegen"
import {reportExtraError} from "../../compile/errors"
import apDef from "./additionalProperties"

const def: CodeKeywordDefinition = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(cxt: KeywordCxt) {
    const {gen, schema, parentSchema, data, it} = cxt
    if (
      (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === undefined) ||
      it.opts.defaultAdditionalProperties === false
    ) {
      apDef.code(new KeywordCxt(it, apDef, "additionalProperties"))
    }
    const allProps = allSchemaProperties(schema)
    for (const prop of allProps) {
      it.definedProperties.add(prop)
    }
    if (it.opts.unevaluated && allProps.length && it.props !== true) {
      it.props = mergeEvaluated.props(gen, toHash(allProps), it.props)
    }
    const properties = allProps.filter((p) => !alwaysValidSchema(it, schema[p]))
    if (properties.length === 0) return
    const valid = gen.name("valid")

    for (const prop of properties) {
      if (hasDefault(prop)) {
        applyPropertySchema(prop)
      } else {
        gen.if(propertyInData(gen, data, prop, it.opts.ownProperties))

        if (shouldCheckContext(prop)) {
          const contextValid = gen.let("contextValid", true)
          checkContextForProperty(prop, contextValid)
          gen.if(contextValid, () => applyPropertySchema(prop))
        } else {
          applyPropertySchema(prop)
        }

        if (!it.allErrors) gen.else().var(valid, true)
        gen.endIf()
      }
      cxt.it.definedProperties.add(prop)
      cxt.ok(valid)
    }

    function shouldCheckContext(prop: string): boolean {
      if (!it.opts.additionalContext) return false
      const propSchema = schema[prop]
      return propSchema.readOnly === true || propSchema.writeOnly === true
    }

    function checkContextForProperty(prop: string, contextValid: Name): void {
      const propSchema = schema[prop]
      const hasReadOnly = propSchema.readOnly === true
      const hasWriteOnly = propSchema.writeOnly === true

      gen.if(_`self.opts.additionalContext`, () => {
        const ctx = gen.const("ctx", _`self.opts.additionalContext`)

        if (hasReadOnly) {
          gen.if(_`typeof ${ctx} === "string" && ${ctx}.toLowerCase() === "request"`, () => {
            gen.assign(contextValid, false)
            const error: KeywordErrorDefinition = {
              message: str`should NOT have readOnly property '${prop}' in request`,
              params: _`{propertyName: ${prop}, context: "request", restriction: "readOnly"}`,
            }
            reportExtraError(cxt, error)
            if (!it.allErrors) gen.break()
          })
        }

        if (hasWriteOnly) {
          gen.if(_`typeof ${ctx} === "string" && ${ctx}.toLowerCase() === "response"`, () => {
            gen.assign(contextValid, false)
            const error: KeywordErrorDefinition = {
              message: str`should NOT have writeOnly property '${prop}' in response`,
              params: _`{propertyName: ${prop}, context: "response", restriction: "writeOnly"}`,
            }
            reportExtraError(cxt, error)
            if (!it.allErrors) gen.break()
          })
        }
      })
    }

    function hasDefault(prop: string): boolean | undefined {
      return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== undefined
    }

    function applyPropertySchema(prop: string): void {
      cxt.subschema(
        {
          keyword: "properties",
          schemaProp: prop,
          dataProp: prop,
        },
        valid
      )
    }
  },
}

export default def
