import type {CodeKeywordDefinition, KeywordErrorDefinition} from "../../types"
import type {KeywordCxt} from "../../compile/validate"
import {_, str} from "../../compile/codegen"
import N from "../../compile/names"

const error: KeywordErrorDefinition = {
  message: ({params}) =>
    str`must NOT be present in ${params.mode || "this context"}${
      params.location ? str` (${params.location})` : ""
    }`,
  params: ({params}) => _`{mode: ${params.mode}, location: ${params.location}}`,
}

const def: CodeKeywordDefinition = {
  keyword: "writeOnly",
  schemaType: "boolean",
  error,
  code(cxt: KeywordCxt) {
    if (cxt.schema !== true) return
    const mode = _`(${N.this} && ${N.this}.oas ? ${N.this}.oas.mode : undefined)`
    const location = _`(${N.this} && ${N.this}.oas ? ${N.this}.oas.location : undefined)`
    cxt.setParams({mode, location})
    cxt.fail(
      _`typeof ${N.this} == "object" && ${N.this} && ${N.this}.oas && ${N.this}.oas.mode === "response"`
    )
  },
}

export default def
