import type {AnySchemaObject} from "../types"

import {_, or, type Code} from "../compile/codegen"
import N from "../compile/names"

export function getSkipCondition(schema: AnySchemaObject, prop: string): Code | undefined {
  const propSchema = schema.properties?.[prop]
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

  return conditions.length === 1 ? conditions[0] : or(...conditions)
}
