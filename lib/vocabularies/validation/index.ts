import {Vocabulary} from "../../types"

const validation: Vocabulary = [
  // number
  require("./limit"),
  require("./multipleOf"),
  // string
  require("./limitLength"),
  require("./pattern"),
  // object
  require("./limitProperties"),
  // array
  require("./limitItems"),
  // any
  require("./const"),
  require("./enum"),
]

module.exports = validation
