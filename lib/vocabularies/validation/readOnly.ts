import type {CodeKeywordDefinition, KeywordErrorDefinition} from "../../types"
import type {KeywordCxt} from "../../compile/validate"
import {_, str} from "../../compile/codegen"
import N from "../../compile/names"

const error: KeywordErrorDefinition = {
  message: ({params}) => str`must NOT be present in ${params.context || "this"} context`,
  params: ({params}) => _`{context: ${params.context}}`,
}

const def: CodeKeywordDefinition = {
  keyword: "readOnly",
  schemaType: "boolean",
  error,
  code(cxt: KeywordCxt) {
    if (cxt.schema !== true) return

    const apiContext = _`(${N.this} && ${N.this}.apiContext)`

    cxt.setParams({context: _`${apiContext}`})
    cxt.fail(_`${apiContext} === "request"`)
  },
}

export default def
