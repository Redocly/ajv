import type {ErrorObject} from "../types"
import {resolveUrl, normalizeId, getFullPath} from "./resolve"

export class ValidationError extends Error {
  readonly errors: Partial<ErrorObject>[]
  readonly ajv: true
  readonly validation: true

  constructor(errors: Partial<ErrorObject>[]) {
    super("validation failed")
    this.errors = errors
    this.ajv = this.validation = true
  }
}

export class MissingRefError extends Error {
  readonly missingRef: string
  readonly missingSchema: string

  static message(baseId: string, ref: string): string {
    return `can't resolve reference ${ref} from id ${baseId}`
  }

  constructor(baseId: string, ref: string, message?: string) {
    super(message || MissingRefError.message(baseId, ref))
    this.missingRef = resolveUrl(baseId, ref)
    this.missingSchema = normalizeId(getFullPath(this.missingRef))
  }
}

module.exports = {
  ValidationError,
  MissingRefError,
}
