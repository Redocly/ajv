import type {Vocabulary} from "../../types"
import idKeyword from "./id"
import refKeyword from "./ref"

const core: Vocabulary = ["$schema", "$id", "$defs", "definitions", idKeyword, refKeyword]

export default core
