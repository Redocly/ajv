import {CodeKeywordDefinition} from "../../types"
import KeywordContext from "../../compile/context"
import {dataNotType} from "../util"
import {_, str, operators} from "../../compile/codegen"

const def: CodeKeywordDefinition = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: true,
  code(cxt: KeywordContext) {
    const {keyword, data, $data, schemaCode} = cxt
    const op = keyword === "maxProperties" ? operators.GT : operators.LT
    const dnt = dataNotType(schemaCode, <string>def.schemaType, $data)
    cxt.fail(_`${dnt} Object.keys(${data}).length ${op} ${schemaCode}`)
  },
  error: {
    message({keyword, schemaCode}) {
      const comp = keyword === "maxProperties" ? "more" : "fewer"
      return str`should NOT have ${comp} than ${schemaCode} items`
    },
    params: ({schemaCode}) => _`{limit: ${schemaCode}}`,
  },
}

module.exports = def
