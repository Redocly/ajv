import type {CodeKeywordDefinition, ErrorObject, KeywordErrorDefinition} from "../../types"
import type {KeywordCxt} from "../../compile/validate"
import {checkReportMissingProp, reportMissingProp, propertyInData, noPropertyInData} from "../code"
import {_, str, nil, not, and, or, Name, Code} from "../../compile/codegen"
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

    // Checks if a property should be skipped based on readOnly/writeOnly and validationContext
    function shouldSkipProperty(prop: string): Code | undefined {
      const propSchema = cxt.parentSchema.properties?.[prop]
      if (!propSchema) return undefined

      const hasReadOnly = propSchema.readOnly === true
      const hasWriteOnly = propSchema.writeOnly === true

      if (!hasReadOnly && !hasWriteOnly) return undefined

      // Generate runtime check for validationContext
      if (it.validationContext) {
        const conditions: Code[] = []

        if (hasReadOnly) {
          // Skip readOnly properties when operation is "request"
          conditions.push(
            _`${it.validationContext} && ${it.validationContext}.operation === "request"`
          )
        }

        if (hasWriteOnly) {
          // Skip writeOnly properties when operation is "response"
          conditions.push(
            _`${it.validationContext} && ${it.validationContext}.operation === "response"`
          )
        }

        return conditions.length === 1 ? conditions[0] : or(...conditions)
      }

      return undefined
    }

    function allErrorsMode(): void {
      if (useLoop || $data) {
        cxt.block$data(nil, loopAllRequired)
      } else {
        for (const prop of schema) {
          const skipCondition = shouldSkipProperty(prop)
          if (skipCondition) {
            gen.if(not(skipCondition), () => checkReportMissingProp(cxt, prop))
          } else {
            checkReportMissingProp(cxt, prop)
          }
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
        // Check if any required properties are missing (with context awareness)
        const checks: Code[] = []
        for (const prop of schema) {
          const skipCondition = shouldSkipProperty(prop)
          const missingCheck = and(
            noPropertyInData(gen, data, prop, opts.ownProperties),
            _`${missing} = ${prop}`
          )

          if (skipCondition) {
            // Only check if we shouldn't skip this property
            checks.push(and(not(skipCondition), missingCheck))
          } else {
            checks.push(missingCheck)
          }
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
