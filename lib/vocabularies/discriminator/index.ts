import type {CodeKeywordDefinition, AnySchemaObject, KeywordErrorDefinition} from "../../types"
import type {KeywordCxt} from "../../compile/validate"
import {_, getProperty, Name} from "../../compile/codegen"
import {DiscrError, DiscrErrorObj} from "../discriminator/types"

export type DiscriminatorError = DiscrErrorObj<DiscrError.Tag> | DiscrErrorObj<DiscrError.Mapping>

const error: KeywordErrorDefinition = {
  message: ({params: {discrError, tagName}}) =>
    discrError === DiscrError.Tag
      ? `tag "${tagName}" must be string`
      : `value of tag "${tagName}" must be in oneOf or anyOf`,
  params: ({params: {discrError, tag, tagName}}) =>
    _`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`,
}

const def: CodeKeywordDefinition = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error,
  code(cxt: KeywordCxt) {
    const {gen, data, schema, parentSchema, it} = cxt

    const keyword = parentSchema.hasOwnProperty("oneOf")
      ? "oneOf"
      : parentSchema.hasOwnProperty("anyOf")
      ? "anyOf"
      : undefined

    if (!it.opts.discriminator) {
      throw new Error("discriminator: requires discriminator option")
    }
    const tagName = schema.propertyName
    if (typeof tagName != "string") throw new Error("discriminator: requires propertyName")
    if (!keyword)
      throw new Error(
        "discriminator: requires the oneOf or anyOf composite keyword"
      )
    const parentSchemaVariants = parentSchema[keyword]
    const valid = gen.let("valid", false)
    const tag = gen.const("tag", _`${data}${getProperty(tagName)}`)
    gen.if(
      _`typeof ${tag} == "string"`,
      () => validateMapping(),
      () => cxt.error(false, {discrError: DiscrError.Tag, tag, tagName})
    )
    cxt.ok(valid)

    function validateMapping(): void {
      const mapping = getMapping()
      gen.if(false)
      for (const tagValue in mapping) {
        gen.elseIf(_`${tag} === ${tagValue}`)
        gen.assign(valid, applyTagSchema(mapping[tagValue]))
      }
      gen.else()
      cxt.error(false, {discrError: DiscrError.Mapping, tag, tagName})
      gen.endIf()
    }

    function applyTagSchema(schemaProp?: number): Name {
      const _valid = gen.name("valid")
      const schCxt = cxt.subschema({keyword, schemaProp}, _valid)
      cxt.mergeEvaluated(schCxt, Name)
      return _valid
    }

    function isRef(schema: AnySchemaObject) {
      return schema.hasOwnProperty("$ref")
    }

    function getMapping(): {[T in string]?: number} {
      const discriminatorMapping: {[T in string]?: number} = {}
      const topRequired = hasRequired(parentSchema)
      let tagRequired = true
      for (let i = 0; i < parentSchemaVariants.length; i++) {
        const sch = parentSchemaVariants[i]
        let propSch
        if (isRef(sch)) {
          // compare the ref pointer to the one in mapping
          if (schema.mapping) {
            const {mapping} = schema
            let matchedKey
            Object.keys(mapping).forEach(function (key) {
              if (mapping[key] === sch["$ref"]) {
                matchedKey = key
              }
            })

            if (matchedKey) {
              addMapping(matchedKey, i)
            } else {
              throw new Error(`${sch["$ref"]} should have corresponding entry in mapping`)
            }
          }
          continue
        } else {
          // find if raw schema contains tagName
          propSch = sch.properties?.[tagName]
        }
        if (typeof propSch != "object") {
          throw new Error(`discriminator: ${keyword} schemas must have "properties/${tagName}"`)
        }
        tagRequired = tagRequired && (topRequired || hasRequired(sch))
        addMappings(propSch, i)
      }
      if (!tagRequired) throw new Error(`discriminator: "${tagName}" must be required`)
      return discriminatorMapping

      function hasRequired({required}: AnySchemaObject): boolean {
        return Array.isArray(required) && required.includes(tagName)
      }

      function addMappings(sch: AnySchemaObject, i: number): void {
        if (sch.const) {
          addMapping(sch.const, i)
        } else if (sch.enum) {
          for (const tagValue of sch.enum) {
            addMapping(tagValue, i)
          }
        } else {
          throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`)
        }
      }

      function addMapping(tagValue: unknown, i: number): void {
        if (typeof tagValue != "string" || tagValue in discriminatorMapping) {
          throw new Error(`discriminator: "${tagName}" values must be unique strings`)
        }
        discriminatorMapping[tagValue] = i
      }
    }
  },
}

export default def
