import {
  KeywordDefinition,
  MacroKeywordDefinition,
  FuncKeywordDefinition,
  CompilationContext,
  KeywordCompilationResult,
} from "../../types"
import KeywordContext from "../context"
import {applySubschema} from "../subschema"
import {extendErrors} from "../errors"
import {callValidate} from "../../vocabularies/util"
import CodeGen, {_, nil, Name, Expression} from "../codegen"
import N from "../names"

export function keywordCode(
  it: CompilationContext,
  keyword: string,
  def: KeywordDefinition,
  ruleType?: string
): void {
  const cxt = new KeywordContext(it, def, keyword)
  if ("code" in def) {
    def.code(cxt, ruleType)
  } else if (cxt.$data && "validate" in def) {
    funcKeywordCode(cxt, def as FuncKeywordDefinition)
  } else if ("macro" in def) {
    macroKeywordCode(cxt, def)
  } else if ("compile" in def || "validate" in def) {
    funcKeywordCode(cxt, def)
  }
}

function macroKeywordCode(cxt: KeywordContext, def: MacroKeywordDefinition) {
  const {gen, keyword, schema, parentSchema, it} = cxt
  const macroSchema = def.macro.call(it.self, schema, parentSchema, it)
  const schemaRef = useKeyword(gen, keyword, macroSchema)
  if (it.opts.validateSchema !== false) it.self.validateSchema(macroSchema, true)

  const valid = gen.name("valid")
  applySubschema(
    it,
    {
      schema: macroSchema,
      schemaPath: nil,
      errSchemaPath: `${it.errSchemaPath}/${keyword}`,
      topSchemaRef: schemaRef,
      compositeRule: true,
    },
    valid
  )
  cxt.pass(valid, () => cxt.error(true))
}

function funcKeywordCode(cxt: KeywordContext, def: FuncKeywordDefinition) {
  const {gen, keyword, schema, schemaCode, parentSchema, $data, it} = cxt
  checkAsync(it, def)
  const validate =
    "compile" in def && !$data ? def.compile.call(it.self, schema, parentSchema, it) : def.validate
  const validateRef = useKeyword(gen, keyword, validate)
  const valid = gen.let("valid")

  if (def.errors === false) {
    validateNoErrorsRule()
  } else {
    validateRuleWithErrors()
  }

  function validateNoErrorsRule(): void {
    gen.block(() => {
      if ($data) check$data()
      assignValid()
      if (def.modifying) modifyData(cxt)
    })
    if (!def.valid) cxt.pass(valid)
  }

  function validateRuleWithErrors(): void {
    gen.block()
    if ($data) check$data()
    // const errsCount = gen.const("_errs", N.errors)
    const ruleErrs = def.async ? validateAsyncRule() : validateSyncRule()
    if (def.modifying) modifyData(cxt)
    gen.endBlock()
    reportKeywordErrors(ruleErrs)
  }

  function check$data(): void {
    gen
      // TODO add support for schemaType in keyword definition
      // .if(`${dataNotType(schemaCode, <string>def.schemaType, $data)} false`) // TODO refactor
      .if(`${schemaCode} === undefined`)
      .code(`${valid} = true;`)
      .else()
    if (def.validateSchema) {
      const validateSchemaRef = useKeyword(gen, keyword, def.validateSchema)
      gen.code(`${valid} = ${validateSchemaRef}(${schemaCode});`)
      // TODO fail if schema fails validation
      // gen.if(`!${valid}`)
      // reportError(cxt, keywordError)
      // gen.else()
      gen.if(valid)
    }
  }

  function validateAsyncRule(): Name {
    const ruleErrs = gen.let("ruleErrs", "null")
    gen.try(
      () => assignValid("await "),
      (e) =>
        gen
          .code(`${valid} = false;`)
          .if(`${e} instanceof ValidationError`, `${ruleErrs} = ${e}.errors;`, `throw ${e};`)
    )
    return ruleErrs
  }

  function validateSyncRule(): Expression {
    const validateErrs = _`${validateRef}.errors`
    gen.assign(validateErrs, null)
    assignValid("")
    return validateErrs
  }

  function assignValid(await: string = def.async ? "await " : ""): void {
    const passCxt = it.opts.passContext ? "this" : "self"
    const passSchema = !(("compile" in def && !$data) || def.schema === false)
    gen.code(`${valid} = ${await}${callValidate(cxt, validateRef, passCxt, passSchema)};`)
  }

  function reportKeywordErrors(ruleErrs: Expression): void {
    switch (def.valid) {
      case true:
        return
      case false:
        addKeywordErrors(cxt, ruleErrs)
        return cxt.ok(false) // TODO maybe add gen.skip() to remove code till the end of the block?
      default:
        cxt.pass(valid, () => addKeywordErrors(cxt, ruleErrs))
    }
  }
}

function modifyData(cxt: KeywordContext) {
  const {gen, data, it} = cxt
  gen.if(it.parentData, () => gen.assign(data, `${it.parentData}[${it.parentDataProperty}];`))
}

function addKeywordErrors(cxt: KeywordContext, errs: Expression): void {
  const {gen} = cxt
  gen.if(
    `Array.isArray(${errs})`,
    () => {
      gen.assign(N.vErrors, `${N.vErrors} === null ? ${errs} : ${N.vErrors}.concat(${errs})`) // TODO tagged
      gen.assign(N.errors, _`${N.vErrors}.length;`)
      extendErrors(cxt)
    },
    () => cxt.error()
  )
}

function checkAsync(it: CompilationContext, def: FuncKeywordDefinition) {
  if (def.async && !it.async) throw new Error("async keyword in sync schema")
}

function useKeyword(gen: CodeGen, keyword: string, result?: KeywordCompilationResult): Name {
  if (result === undefined) throw new Error(`keyword "${keyword}" failed to compile`)
  return gen.value("keyword", {ref: result}) // TODO value.code
}
