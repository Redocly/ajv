import {CompilationContext, KeywordErrorDefinition} from "../../types"
import {toHash, checkDataType, checkDataTypes} from "../util"
import {schemaHasRulesForType} from "./applicability"
import {reportError} from "../errors"
import {getKeywordContext} from "./keyword"
import {_, str, Name} from "../codegen"

export function getSchemaTypes({schema, opts}: CompilationContext): string[] {
  const st: undefined | string | string[] = schema.type
  const types: string[] = Array.isArray(st) ? st : st ? [st] : []
  types.forEach(checkType)
  if (opts.nullable) {
    const hasNull = types.includes("null")
    if (hasNull && schema.nullable === false) {
      throw new Error('{"type": "null"} contradicts {"nullable": "false"}')
    } else if (!hasNull && schema.nullable === true) {
      types.push("null")
    }
  }
  return types

  function checkType(t: string): void {
    // TODO check that type is allowed
    if (typeof t != "string") throw new Error('"type" keyword must be string or string[]: ' + t)
  }
}

export function coerceAndCheckDataType(it: CompilationContext, types: string[]): boolean {
  const {gen, data, opts} = it
  const coerceTo = coerceToTypes(types, opts.coerceTypes)
  const checkTypes =
    types.length > 0 &&
    !(coerceTo.length === 0 && types.length === 1 && schemaHasRulesForType(it, types[0]))
  if (checkTypes) {
    const wrongType = checkDataTypes(types, data, opts.strictNumbers, true)
    gen.if(wrongType, () => {
      if (coerceTo.length) coerceData(it, coerceTo)
      else reportTypeError(it)
    })
  }
  return checkTypes
}

const COERCIBLE = toHash(["string", "number", "integer", "boolean", "null"])
function coerceToTypes(types: string[], coerceTypes?: boolean | "array"): string[] {
  return coerceTypes
    ? types.filter((t) => COERCIBLE[t] || (coerceTypes === "array" && t === "array"))
    : []
}

export function coerceData(it: CompilationContext, coerceTo: string[]): void {
  const {gen, schema, data, opts} = it
  const dataType = gen.let("dataType", `typeof ${data}`)
  const coerced = gen.let("coerced")
  if (opts.coerceTypes === "array") {
    gen.if(_`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () =>
      gen
        .code(_`${data} = ${data}[0]; ${dataType} = typeof ${data};`)
        .if(checkDataType(schema.type, data, opts.strictNumbers), _`${coerced} = ${data}`)
    )
  }
  gen.if(_`${coerced} !== undefined`)
  for (const t of coerceTo) {
    if (t in COERCIBLE || (t === "array" && opts.coerceTypes === "array")) {
      coerceSpecificType(t)
    }
  }
  gen.else()
  reportTypeError(it)
  gen.endIf()

  gen.if(_`${coerced} !== undefined`, () => {
    gen.code(_`${data} = ${coerced};`)
    assignParentData(it, coerced)
  })

  function coerceSpecificType(t) {
    switch (t) {
      case "string":
        gen
          .elseIf(_`${dataType} == "number" || ${dataType} == "boolean"`)
          .code(_`${coerced} = "" + ${data}`)
          .elseIf(_`${data} === null`)
          .code(_`${coerced} = ""`)
        return
      case "number":
        gen
          .elseIf(
            _`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`
          )
          .code(_`${coerced} = +${data}`)
        return
      case "integer":
        gen
          .elseIf(
            _`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`
          )
          .code(`${coerced} = +${data}`)
        return
      case "boolean":
        gen
          .elseIf(_`${data} === "false" || ${data} === 0 || ${data} === null`)
          .code(_`${coerced} = false`)
          .elseIf(_`${data} === "true" || ${data} === 1`)
          .code(_`${coerced} = true`)
        return
      case "null":
        gen.elseIf(_`${data} === "" || ${data} === 0 || ${data} === false`)
        gen.code(_`${coerced} = null`)
        return

      case "array":
        gen
          .elseIf(
            _`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`
          )
          .code(`${coerced} = [${data}]`)
    }
  }
}

function assignParentData(
  {gen, parentData, parentDataProperty}: CompilationContext,
  expr: string | Name
): void {
  // TODO use gen.property
  gen.if(_`${parentData} !== undefined`, () =>
    gen.assign(`${parentData}[${parentDataProperty}]`, expr)
  )
}

const typeError: KeywordErrorDefinition = {
  message: ({schema}) =>
    str`should be ${Array.isArray(schema) ? schema.join(",") : <string>schema}`,
  // TODO change: return type as array here
  params: ({schema}) => _`{type: ${Array.isArray(schema) ? schema.join(",") : <string>schema}}`,
}

export function reportTypeError(it: CompilationContext): void {
  const cxt = getKeywordContext(it, "type")
  reportError(cxt, typeError)
}
