const Ajv = require("ajv")
const ajv = new Ajv({allErrors: true})

const schema = {
  type: "object",
  properties: {
    foo: {type: "string"},
    bar: {type: "number", maximum: 3},
    password: {type: "string", writeOnly: true},
    id: {type: "string", readOnly: true},
  },
  required: ["foo", "bar", "password", "id"],
  additionalProperties: false,
}

const validate = ajv.compile(schema)

// Test with request context (writeOnly required, readOnly not required)
console.log("\n=== Testing REQUEST context ===")
test({foo: "abc", bar: 2, password: "secret"}, "request")

// Test with response context (readOnly required, writeOnly not required)
console.log("\n=== Testing RESPONSE context ===")
test({foo: "abc", bar: 2, id: "123"}, "response")

// Test without context (all required)
console.log("\n=== Testing without context ===")
test({foo: "abc", bar: 2}, undefined)

function test(data, operation) {
  const valid = validate(data, {
    validationContext: operation ? {operation} : undefined,
  })

  if (valid) console.log("✓ Valid!")
  else console.log("✗ Invalid: " + ajv.errorsText(validate.errors))
}
