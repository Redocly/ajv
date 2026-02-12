import type {DataValidationCxt, Context} from "../../lib/types"
import Ajv from "../ajv"
import chai from "../chai"

chai.should()

function buildContext(data: unknown): DataValidationCxt {
  const dynamicAnchors: DataValidationCxt["dynamicAnchors"] = {}
  return {
    instancePath: "",
    parentData: {root: data},
    parentDataProperty: "root",
    rootData: data as Record<string, unknown>,
    dynamicAnchors,
  }
}

function getAjv() {
  return new Ajv({passContext: true})
}

type Validate = ReturnType<InstanceType<typeof Ajv>["compile"]>

function expectValid(validate: Validate, data: unknown, ctx?: Context) {
  const valid = ctx ? validate.call(ctx, data, buildContext(data)) : validate(data)
  valid.should.equal(true)
}

function expectInvalid(
  validate: Validate,
  data: unknown,
  keyword: "readOnly" | "writeOnly" | "required",
  ctx?: Context
) {
  const valid = ctx ? validate.call(ctx, data, buildContext(data)) : validate(data)
  valid.should.equal(false)
  validate.errors?.[0].keyword.should.equal(keyword)
}

describe("readOnly/writeOnly", () => {
  const baseSchema = {
    type: "object",
    properties: {
      id: {type: "string", readOnly: true},
      password: {type: "string", writeOnly: true},
    },
  }

  describe("default behavior without OAS context", () => {
    it("should not validate readOnly/writeOnly", () => {
      const validate = getAjv().compile(baseSchema)
      expectValid(validate, {id: "1", password: "secret"})
      expectValid(validate, {})
    })
  })

  describe("with required", () => {
    const schemaWithRequired = {
      ...baseSchema,
      required: ["id", "password"],
    }

    it("should keep required without context", () => {
      const validate = getAjv().compile(schemaWithRequired)
      expectValid(validate, {id: "1", password: "secret"})
      expectInvalid(validate, {}, "required")
    })

    it("should skip readOnly in request context and still require writeOnly", () => {
      const validate = getAjv().compile(schemaWithRequired)
      const requestCtx: Context = {apiContext: "request"}

      expectValid(validate, {password: "secret"}, requestCtx)
      expectInvalid(validate, {id: "1", password: "secret"}, "readOnly", requestCtx)
      expectInvalid(validate, {}, "required", requestCtx)
    })

    it("should skip writeOnly in response context and still require readOnly", () => {
      const validate = getAjv().compile(schemaWithRequired)
      const responseCtx: Context = {apiContext: "response"}

      expectValid(validate, {id: "1"}, responseCtx)
      expectInvalid(validate, {id: "1", password: "secret"}, "writeOnly", responseCtx)
      expectInvalid(validate, {}, "required", responseCtx)
    })
  })

  describe("presence validation with context", () => {
    it("should reject readOnly in request context", () => {
      const validate = getAjv().compile(baseSchema)
      const requestCtx: Context = {apiContext: "request"}

      expectInvalid(validate, {id: "1"}, "readOnly", requestCtx)
    })

    it("should reject writeOnly in response context", () => {
      const validate = getAjv().compile(baseSchema)
      const responseCtx: Context = {apiContext: "response"}

      expectInvalid(validate, {password: "secret"}, "writeOnly", responseCtx)
    })
  })
})
