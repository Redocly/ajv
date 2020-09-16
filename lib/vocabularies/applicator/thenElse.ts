import type {CodeKeywordDefinition} from "../../types"
import type KeywordCxt from "../../compile/context"
import {checkStrictMode} from "../util"

const def: CodeKeywordDefinition = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({keyword, parentSchema, it}: KeywordCxt) {
    if (parentSchema.if === undefined) checkStrictMode(it, `"${keyword}" without "if" is ignored`)
  },
}

module.exports = def
