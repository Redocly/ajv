import type {CodeKeywordDefinition, ErrorObject, KeywordErrorDefinition} from "../../types"
import type {KeywordCxt} from "../../compile/validate"
import {checkReportMissingProp, reportMissingProp, propertyInData, noPropertyInData} from "../code"
import {_, str, nil, not, and, or, Name, Code} from "../../compile/codegen"
import N from "../../compile/names"
import {checkStrictMode} from "../../compile/util"

export type RequiredError = ErrorObject<
  "required",
  {missingProperty: string},
  string[] | {$data: string}
>

const error: KeywordErrorDefinition = {
  message: ({params: {missingProperty}}) => str`must have required property '${missingProperty}'`,
  params: ({params: {missingProperty}}) => _`{missingProperty: ${missingProperty}}`,
}

const def: CodeKeywordDefinition = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: true,
  error,
  code(cxt: KeywordCxt) {
    const {gen, schema, schemaCode, data, $data, it} = cxt
    const {opts} = it
    if (!$data && schema.length === 0) return
    const useLoop = schema.length >= opts.loopRequired
    if (it.allErrors) allErrorsMode()
    else exitOnErrorMode()

    if (opts.strictRequired) {
      const props = cxt.parentSchema.properties
      const {definedProperties} = cxt.it

      for (const requiredKey of schema) {
        if (props?.[requiredKey] === undefined && !definedProperties.has(requiredKey)) {
          const schemaPath = it.schemaEnv.baseId + it.errSchemaPath
          const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`
          checkStrictMode(it, msg, it.opts.strictRequired)
        }
      }
    }

    function getSkipCondition(prop: string): Code | undefined {
      const propSchema = cxt.parentSchema.properties?.[prop]
      if (!propSchema) return undefined

      const hasReadOnly = propSchema.readOnly === true
      const hasWriteOnly = propSchema.writeOnly === true

      if (!hasReadOnly && !hasWriteOnly) return undefined

      const conditions: Code[] = []
      const oasContext = _`typeof ${N.this} == "object" && ${N.this} && ${N.this}.oas`

      if (hasReadOnly) {
        conditions.push(_`${oasContext} && ${N.this}.oas.mode === "request"`)
      }

      if (hasWriteOnly) {
        conditions.push(_`${oasContext} && ${N.this}.oas.mode === "response"`)
      }

      if (conditions.length) {
        return conditions.length === 1 ? conditions[0] : or(...conditions)
      }

      return undefined
    }

    function allErrorsMode(): void {
      if (useLoop || $data) {
        cxt.block$data(nil, loopAllRequired)
      } else {
        for (const prop of schema) {
          const skip = getSkipCondition(prop) ?? _`false`
          /**
           * Generate a runtime check: validate `required` only when this property
           * should NOT be skipped in the current context (readOnly/writeOnly).
           */
          gen.if(not(skip), () => checkReportMissingProp(cxt, prop))
        }
      }
    }

    function exitOnErrorMode(): void {
      const missing = gen.let("missing")
      if (useLoop || $data) {
        const valid = gen.let("valid", true)
        cxt.block$data(valid, () => loopUntilMissing(missing, valid))
        cxt.ok(valid)
      } else {
        const checks: Code[] = []
        for (const prop of schema) {
          const missingCheck = and(
            not(getSkipCondition(prop) ?? _`false`),
            noPropertyInData(gen, data, prop, opts.ownProperties),
            _`${missing} = ${prop}`
          )

          checks.push(missingCheck)
        }

        gen.if(or(...checks))

        reportMissingProp(cxt, missing)
        gen.else()
      }
    }

    function loopAllRequired(): void {
      gen.forOf("prop", schemaCode as Code, (prop) => {
        cxt.setParams({missingProperty: prop})
        gen.if(noPropertyInData(gen, data, prop, opts.ownProperties), () => cxt.error())
      })
    }

    function loopUntilMissing(missing: Name, valid: Name): void {
      cxt.setParams({missingProperty: missing})
      gen.forOf(
        missing,
        schemaCode as Code,
        () => {
          gen.assign(valid, propertyInData(gen, data, missing, opts.ownProperties))
          gen.if(not(valid), () => {
            cxt.error()
            gen.break()
          })
        },
        nil
      )
    }
  },
}

export default def
