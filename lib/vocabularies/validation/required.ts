import type {CodeKeywordDefinition, ErrorObject, KeywordErrorDefinition} from "../../types"
import type {KeywordCxt} from "../../compile/validate"
import {checkReportMissingProp, propertyInData, noPropertyInData} from "../code"
import {_, str, nil, not, Name, Code} from "../../compile/codegen"
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

    function generateRuntimeContextCheck(
      skipProp: Name,
      hasReadOnly: boolean,
      hasWriteOnly: boolean
    ): void {
      gen.if(_`self.opts.additionalContext`, () => {
        const ctx = gen.const("ctx", _`self.opts.additionalContext`)

        if (hasReadOnly) {
          gen.if(_`typeof ${ctx} === "string" && ${ctx}.toLowerCase() === "request"`, () =>
            gen.assign(skipProp, true)
          )
        }

        if (hasWriteOnly) {
          gen.if(_`typeof ${ctx} === "string" && ${ctx}.toLowerCase() === "response"`, () =>
            gen.assign(skipProp, true)
          )
        }
      })
    }

    function generateContextCheckForProp(prop: string): void {
      const propSchema = cxt.parentSchema.properties?.[prop]
      if (!propSchema) {
        checkReportMissingProp(cxt, prop)
        return
      }

      const hasReadOnly = propSchema.readOnly === true
      const hasWriteOnly = propSchema.writeOnly === true

      if (!hasReadOnly && !hasWriteOnly) {
        checkReportMissingProp(cxt, prop)
        return
      }

      const contextCheck = gen.let("skipProp", false)
      generateRuntimeContextCheck(contextCheck, hasReadOnly, hasWriteOnly)

      gen.if(not(contextCheck), () => {
        checkReportMissingProp(cxt, prop)
      })
    }

    function allErrorsMode(): void {
      if (useLoop || $data) {
        cxt.block$data(nil, loopAllRequired)
      } else {
        for (const prop of schema) {
          generateContextCheckForProp(prop)
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
        for (const prop of schema) {
          generateContextCheckForProp(prop)
        }
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
