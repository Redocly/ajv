import type {KeywordCxt} from "../../compile/validate"
import type {CodeKeywordDefinition, ErrorObject, KeywordErrorDefinition} from "../../types"
import {_, str, operators} from "../../compile/codegen"
import type {LimitKwd, ExclusiveLimitKwd} from "./limitNumber"

const ops = operators

const KWDs: {[K in ExclusiveLimitKwd]: LimitKwd} = {
  exclusiveMaximum: "maximum",
  exclusiveMinimum: "minimum",
}

export type ExclusiveLimitNumberError = ErrorObject<
  ExclusiveLimitKwd,
  {limit: number; comparison: "<" | ">"},
  number | {$data: string}
>

const error: KeywordErrorDefinition = {
  message: (cxt) => {
    const op = cxt.keyword === "exclusiveMaximum" ? "<" : ">"
    return str`must be ${op} ${cxt.schemaCode}`
  },
  params: (cxt) => {
    const comparison = cxt.keyword === "exclusiveMaximum" ? "<" : ">"
    return _`{comparison: ${comparison}, limit: ${cxt.schemaCode}}`
  },
}

const def: CodeKeywordDefinition = {
  keyword: Object.keys(KWDs),
  type: "number",
  schemaType: ["boolean", "number"],
  $data: true,
  error,
  code(cxt: KeywordCxt) {
    const {data, schemaCode, keyword, schema, parentSchema} = cxt

    if (typeof schema === "boolean") {
      // Draft-04 style: boolean exclusiveMaximum/exclusiveMinimum
      const limitKwd = KWDs[keyword as ExclusiveLimitKwd]
      if (parentSchema[limitKwd] === undefined) {
        throw new Error(`${keyword} can only be used with ${limitKwd}`)
      }
      return
    }

    // Draft-06+ style: numeric exclusiveMaximum/exclusiveMinimum
    const failOp = keyword === "exclusiveMaximum" ? ops.GTE : ops.LTE
    cxt.fail$data(_`${data} ${failOp} ${schemaCode} || isNaN(${data})`)
  },
}

export default def
