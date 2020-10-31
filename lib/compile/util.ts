import type {AnySchema, EvaluatedProperties, EvaluatedItems} from "../types"
import type {SchemaCxt, SchemaObjCxt} from "."
import {_, getProperty, Code, Name, CodeGen} from "./codegen"
import type {Rule, ValidationRules} from "./rules"
import {checkStrictMode} from "./validate"

// TODO refactor to use Set
export function toHash<T extends string = string>(arr: T[]): {[K in T]?: true} {
  const hash: {[K in T]?: true} = {}
  for (const item of arr) hash[item] = true
  return hash
}

export function alwaysValidSchema(it: SchemaCxt, schema: AnySchema): boolean | void {
  if (typeof schema == "boolean") return schema
  if (Object.keys(schema).length === 0) return true
  checkUnknownRules(it, schema)
  return !schemaHasRules(schema, it.self.RULES.all)
}

export function checkUnknownRules(it: SchemaCxt, schema: AnySchema = it.schema): void {
  const {opts, self} = it
  if (!opts.strict) return
  if (typeof schema === "boolean") return
  const rules = self.RULES.keywords
  for (const key in schema) {
    if (!rules[key]) checkStrictMode(it, `unknown keyword: "${key}"`)
  }
}

export function schemaHasRules(
  schema: AnySchema,
  rules: {[key: string]: boolean | Rule | undefined}
): boolean {
  if (typeof schema == "boolean") return !schema
  for (const key in schema) if (rules[key]) return true
  return false
}

export function schemaHasRulesButRef(schema: AnySchema, RULES: ValidationRules): boolean {
  if (typeof schema == "boolean") return !schema
  for (const key in schema) if (key !== "$ref" && RULES.all[key]) return true
  return false
}

export function schemaRefOrVal(
  {topSchemaRef, schemaPath}: SchemaObjCxt,
  schema: unknown,
  keyword: string,
  $data?: string | false
): Code | number | boolean {
  if (!$data) {
    if (typeof schema == "number" || typeof schema == "boolean") return schema
    if (typeof schema == "string") return _`${schema}`
  }
  return _`${topSchemaRef}${schemaPath}${getProperty(keyword)}`
}

export function unescapeFragment(str: string): string {
  return unescapeJsonPointer(decodeURIComponent(str))
}

export function escapeFragment(str: string | number): string {
  return encodeURIComponent(escapeJsonPointer(str))
}

export function escapeJsonPointer(str: string | number): string {
  if (typeof str == "number") return `${str}`
  return str.replace(/~/g, "~0").replace(/\//g, "~1")
}

export function unescapeJsonPointer(str: string): string {
  return str.replace(/~1/g, "/").replace(/~0/g, "~")
}

export function eachItem<T>(xs: T | T[], f: (x: T) => void): void {
  if (Array.isArray(xs)) {
    for (const x of xs) f(x)
  } else {
    f(xs)
  }
}

// https://mathiasbynens.be/notes/javascript-encoding
// https://github.com/bestiejs/punycode.js - punycode.ucs2.decode
export function ucs2length(str: string): number {
  const len = str.length
  let length = 0
  let pos = 0
  let value: number
  while (pos < len) {
    length++
    value = str.charCodeAt(pos++)
    if (value >= 0xd800 && value <= 0xdbff && pos < len) {
      // high surrogate, and there is a next character
      value = str.charCodeAt(pos)
      if ((value & 0xfc00) === 0xdc00) pos++ // low surrogate
    }
  }
  return length
}

export function mergeEvaluatedProps(
  gen: CodeGen,
  from: Name | EvaluatedProperties,
  to?: Name | {[K in string]?: true}
): Name | EvaluatedProperties {
  if (to === undefined) return from
  if (to instanceof Name) {
    return from instanceof Name ? mergeNames(from, to) : mergeToName(from, to)
  }
  if (from instanceof Name) return mergeToName(to, from)
  return mergeValues(from, to)

  function mergeNames(_from: Name, _to: Name): Name {
    gen.if(_`${_to} !== true && ${_from} !== undefined`, () => {
      gen.if(
        _`${_from} === true`,
        () => gen.assign(_to, true),
        () => gen.code(_`Object.assign(${_to}, ${_from})`)
      )
    })
    return _to
  }

  function mergeToName(_from: EvaluatedProperties, _to: Name): Name {
    gen.if(_`${_to} !== true`, () => {
      if (_from === true) {
        gen.assign(_to, true)
      } else {
        gen.assign(_to, _`${_to} || {}`)
        setEvaluated(gen, _to, _from)
      }
    })
    return _to
  }

  function mergeValues(
    _from: EvaluatedProperties,
    _to: {[K in string]?: true}
  ): EvaluatedProperties {
    return _from === true ? true : {..._from, ..._to}
  }
}

export function mergeEvaluatedPropsToName(
  gen: CodeGen,
  from: Name | EvaluatedProperties,
  to?: Name | {[K in string]?: true}
): Name {
  return evaluatedPropsToName(gen, mergeEvaluatedProps(gen, from, to))
}

export function evaluatedPropsToName(gen: CodeGen, ps?: Name | EvaluatedProperties): Name {
  if (ps instanceof Name) return ps
  if (ps === true) return gen.var("props", true)
  const props = gen.var("props", _`{}`)
  if (ps !== undefined) setEvaluated(gen, props, ps)
  return props
}

export function setEvaluated(gen: CodeGen, props: Name, ps: {[K in string]?: true}): void {
  Object.keys(ps).forEach((p) => gen.assign(_`${props}${getProperty(p)}`, true))
}

export function mergeEvaluatedItems(
  gen: CodeGen,
  from: Name | EvaluatedItems,
  to?: Name | number
): Name | EvaluatedItems {
  if (to === undefined) return from
  if (to instanceof Name) {
    return from instanceof Name ? mergeNames(from, to) : mergeToName(from, to)
  }
  if (from instanceof Name) return mergeToName(to, from)
  return mergeValues(from, to)

  function mergeNames(_from: Name, _to: Name): Name {
    gen.if(_`${_to} !== true && ${_from} !== undefined`, () =>
      gen.assign(_to, _`${_from} === true ? true : ${_to} > ${from} ? ${_to} : ${from}`)
    )
    return _to
  }

  function mergeToName(_from: EvaluatedItems, _to: Name): Name {
    gen.if(_`${_to} !== true`, () =>
      gen.assign(_to, _from === true ? true : _`${_to} > ${from} ? ${_to} : ${from}`)
    )
    return _to
  }

  function mergeValues(_from: EvaluatedItems, _to: number): EvaluatedItems {
    return _from === true ? true : Math.max(_from, _to)
  }
}

export function mergeEvaluatedItemsToName(
  gen: CodeGen,
  from: Name | EvaluatedItems,
  to?: Name | number
): Name {
  const items = mergeEvaluatedItems(gen, from, to)
  return items instanceof Name ? items : gen.var("items", items)
}
