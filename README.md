<img align="right" alt="Ajv logo" width="160" src="https://ajv.js.org/images/ajv_logo.png">

# Ajv: Another JSON Schema Validator

The fastest JSON Schema validator for Node.js and browser. Supports draft-06/07/2019-09 (draft-04 is supported in [version 6](https://github.com/ajv-validator/ajv/tree/v6)).

[![build](https://github.com/ajv-validator/ajv/workflows/build/badge.svg)](https://github.com/ajv-validator/ajv/actions?query=workflow%3Abuild)
[![npm](https://img.shields.io/npm/v/ajv.svg)](https://www.npmjs.com/package/ajv)
[![npm (beta)](https://img.shields.io/npm/v/ajv/beta)](https://www.npmjs.com/package/ajv/v/7.0.0-rc.3)
[![npm downloads](https://img.shields.io/npm/dm/ajv.svg)](https://www.npmjs.com/package/ajv)
[![Coverage Status](https://coveralls.io/repos/github/ajv-validator/ajv/badge.svg?branch=master)](https://coveralls.io/github/ajv-validator/ajv?branch=master)
[![Gitter](https://img.shields.io/gitter/room/ajv-validator/ajv.svg)](https://gitter.im/ajv-validator/ajv)
[![GitHub Sponsors](https://img.shields.io/badge/$-sponsors-brightgreen)](https://github.com/sponsors/epoberezkin)

## Platinum sponsors

[<img src="https://www.poberezkin.com/images/mozilla.svg" width="45%">](https://www.mozilla.org)[<img src="./.github/img/gap.svg" width="9%">](https://opencollective.com/ajv)[<img src="./.github/img/reserved.svg" width="45%">](https://opencollective.com/ajv)

## Using version 7

Ajv version 7 (beta) is released with these changes:

- support of JSON Schema draft-2019-09 features: [`unevaluatedProperties`](./json-schema.md#unevaluatedproperties) and [`unevaluatedItems`](./json-schema.md#unevaluateditems), [dynamic recursive references](./validation.md#extending-recursive-schemas) and other [additional keywords](./json-schema.md#json-schema-draft-2019-09).
- to reduce the mistakes in JSON schemas and unexpected validation results, [strict mode](./docs/strict-mode.md) is added - it prohibits ignored or ambiguous JSON Schema elements.
- to make code injection from untrusted schemas impossible, [code generation](./docs/codegen.md) is fully re-written to be safe and to allow code optimization (compiled schema code size is reduced by more than 10%).
- to simplify Ajv extensions, the new keyword API that is used by pre-defined keywords is available to user-defined keywords - it is much easier to define any keywords now, especially with subschemas. [ajv-keywords](https://github.com/ajv-validator/ajv-keywords) package was updated to use the new API (in [v4.0.0-beta.0](https://github.com/ajv-validator/ajv-keywords/releases/tag/v4.0.0-beta.0))
- schemas are compiled to ES6 code (ES5 code generation is also supported with an option).
- to improve reliability and maintainability the code is migrated to TypeScript.

**Please note**:

- the support for JSON-Schema draft-04 is removed - if you have schemas using "id" attributes you have to replace them with "\$id" (or continue using [Ajv v6](https://github.com/ajv-validator/ajv/tree/v6) that will be supported until 02/28/2021).
- all formats are separated to ajv-formats package - they have to be explicitly added if you use them.

See [release notes](https://github.com/ajv-validator/ajv/releases/tag/v7.0.0-beta.0) for the details.

To install the new version:

```bash
npm install ajv@beta
```

See [Getting started](#usage) for code example.

## Contributing

100+ people contributed to Ajv. You are very welcome to join by implementing new features that are valuable to many users and by improving documentation.

Please do not be disappointed if your suggestion is not accepted - it is important to maintain the balance between the library size, performance and functionality. If it seems that a feature would benefit only a small number of users, its addition may be delayed until there is more support from the users community - so please submit the issue first to explain why this feature is important.

Please include documentation and test coverage with any new feature implementations.

To run tests:

```bash
npm install
git submodule update --init
npm test
```

`npm run build` - compiles typescript to `dist` folder.

Please review [Contributing guidelines](./CONTRIBUTING.md) and [Code components](./docs/components.md).

## Contents

- [Platinum sponsors](#platinum-sponsors)
- [Using version 7](#using-version-7)
- [Contributing](#contributing)
- [Mozilla MOSS grant and OpenJS Foundation](#mozilla-moss-grant-and-openjs-foundation)
- [Sponsors](#sponsors)
- [Performance](#performance)
- [Features](#features)
- [Getting started](#usage)
- [Frequently Asked Questions](./docs/faq.md)
- [Using in browser](#using-in-browser)
  - [Content Security Policy](./docs/security.md#content-security-policy)
- [Command line interface](#command-line-interface)
- [API reference](./docs/api.md)
  - [Methods](./docs/api.md#ajv-constructor-and-methods)
  - [Options](./docs/api.md#options)
  - [Validation errors](./docs/api.md#validation-errors)
- NEW: [Strict mode](./docs/strict-mode.md#strict-mode)
  - [Prohibit ignored keywords](./docs/strict-mode.md#prohibit-ignored-keywords)
  - [Prevent unexpected validation](./docs/strict-mode.md#prevent-unexpected-validation)
  - [Strict types](./docs/strict-mode.md#strict-types)
  - [Strict number validation](./docs/strict-mode.md#strict-number-validation)
- [Data validation](./docs/validation.md)
  - [Validation basics](./docs/validation.md#validation-basics): [JSON Schema keywords](./docs/validation.md#validation-keywords), [annotations](./docs/validation.md#annotation-keywords), [formats](./docs/validation.md#formats)
  - [Modular schemas](./docs/validation.md#modular-schemas): [combining with \$ref](./docs/validation.md#ref), [\$data reference](./docs/validation.md#data-reference), [$merge and $patch](./docs/validation.md#merge-and-patch-keywords)
  - [Asynchronous schema compilation](./docs/validation.md#asynchronous-schema-compilation)
  - [Standalone validation code](./docs/standalone.md)
  - [Asynchronous validation](./docs/validation.md#asynchronous-validation)
  - [Modifying data](./docs/validation.md#modifying-data-during-validation): [additional properties](./docs/validation.md#removing-additional-properties), [defaults](./docs/validation.md#assigning-defaults), [type coercion](./docs/validation.md#coercing-data-types)
- [Extending Ajv](#extending-ajv)
  - User-defined keywords:
    - [basics](./docs/validation.md#user-defined-keywords)
    - [guide](./docs/keywords.md)
  - [Plugins](#plugins)
  - [Related packages](#related-packages)
- [Security considerations](./docs/security.md)
  - [Security contact](./docs/security.md#security-contact)
  - [Untrusted schemas](./docs/security.md#untrusted-schemas)
  - [Circular references in objects](./docs/security.md#circular-references-in-javascript-objects)
  - [Trusted schemas](./docs/security.md#security-risks-of-trusted-schemas)
  - [ReDoS attack](./docs/security.md#redos-attack)
  - [Content Security Policy](./docs/security.md#content-security-policy)
- [Some packages using Ajv](#some-packages-using-ajv)
- [Changes history](#changes-history)
- [Support, Code of conduct, Contacts, License](#open-source-software-support)

## Mozilla MOSS grant and OpenJS Foundation

[<img src="https://www.poberezkin.com/images/mozilla.png" width="240" height="68">](https://www.mozilla.org/en-US/moss/) &nbsp;&nbsp;&nbsp; [<img src="https://www.poberezkin.com/images/openjs.png" width="220" height="68">](https://openjsf.org/blog/2020/08/14/ajv-joins-openjs-foundation-as-an-incubation-project/)

Ajv has been awarded a grant from Mozilla’s [Open Source Support (MOSS) program](https://www.mozilla.org/en-US/moss/) in the “Foundational Technology” track! It will sponsor the development of Ajv support of [JSON Schema version 2019-09](https://tools.ietf.org/html/draft-handrews-json-schema-02) and of [JSON Type Definition (RFC8927)](https://datatracker.ietf.org/doc/rfc8927/).

Ajv also joined [OpenJS Foundation](https://openjsf.org/) – having this support will help ensure the longevity and stability of Ajv for all its users.

This [blog post](https://www.poberezkin.com/posts/2020-08-14-ajv-json-validator-mozilla-open-source-grant-openjs-foundation.html) has more details.

I am looking for the long term maintainers of Ajv – working with [ReadySet](https://www.thereadyset.co/), also sponsored by Mozilla, to establish clear guidelines for the role of a "maintainer" and the contribution standards, and to encourage a wider, more inclusive, contribution from the community.

## <a name="sponsors"></a>Please [sponsor Ajv development](https://github.com/sponsors/epoberezkin)

Since I asked to support Ajv development 40 people and 6 organizations contributed via GitHub and OpenCollective - this support helped receiving the MOSS grant!

Your continuing support is very important - the funds will be used to develop and maintain Ajv once the next major version is released.

Please sponsor Ajv via:
- [GitHub sponsors page](https://github.com/sponsors/epoberezkin) (GitHub will match it)
- [Ajv Open Collective️](https://opencollective.com/ajv)

Thank you.

#### Open Collective sponsors

<a href="https://opencollective.com/ajv"><img src="https://opencollective.com/ajv/individuals.svg?width=890"></a>

<a href="https://opencollective.com/ajv/organization/0/website"><img src="https://opencollective.com/ajv/organization/0/avatar.svg"></a>
<a href="https://opencollective.com/ajv/organization/1/website"><img src="https://opencollective.com/ajv/organization/1/avatar.svg"></a>
<a href="https://opencollective.com/ajv/organization/2/website"><img src="https://opencollective.com/ajv/organization/2/avatar.svg"></a>
<a href="https://opencollective.com/ajv/organization/3/website"><img src="https://opencollective.com/ajv/organization/3/avatar.svg"></a>
<a href="https://opencollective.com/ajv/organization/4/website"><img src="https://opencollective.com/ajv/organization/4/avatar.svg"></a>
<a href="https://opencollective.com/ajv/organization/5/website"><img src="https://opencollective.com/ajv/organization/5/avatar.svg"></a>
<a href="https://opencollective.com/ajv/organization/6/website"><img src="https://opencollective.com/ajv/organization/6/avatar.svg"></a>
<a href="https://opencollective.com/ajv/organization/7/website"><img src="https://opencollective.com/ajv/organization/7/avatar.svg"></a>
<a href="https://opencollective.com/ajv/organization/8/website"><img src="https://opencollective.com/ajv/organization/8/avatar.svg"></a>
<a href="https://opencollective.com/ajv/organization/9/website"><img src="https://opencollective.com/ajv/organization/9/avatar.svg"></a>

## Performance

Ajv generates code to turn JSON Schemas into super-fast validation functions that are efficient for v8 optimization.

Currently Ajv is the fastest and the most standard compliant validator according to these benchmarks:

- [json-schema-benchmark](https://github.com/ebdrup/json-schema-benchmark) - 50% faster than the second place
- [jsck benchmark](https://github.com/pandastrike/jsck#benchmarks) - 20-190% faster
- [z-schema benchmark](https://rawgit.com/zaggino/z-schema/master/benchmark/results.html)
- [themis benchmark](https://cdn.rawgit.com/playlyfe/themis/master/benchmark/results.html)

Performance of different validators by [json-schema-benchmark](https://github.com/ebdrup/json-schema-benchmark):

[![performance](https://chart.googleapis.com/chart?chxt=x,y&cht=bhs&chco=76A4FB&chls=2.0&chbh=32,4,1&chs=600x416&chxl=-1:|djv|ajv|json-schema-validator-generator|jsen|is-my-json-valid|themis|z-schema|jsck|skeemas|json-schema-library|tv4&chd=t:100,98,72.1,66.8,50.1,15.1,6.1,3.8,1.2,0.7,0.2)](https://github.com/ebdrup/json-schema-benchmark/blob/master/README.md#performance)

## Features

- Ajv implements full JSON Schema [draft-06/07](http://json-schema.org/) standards (draft-04 is supported in v6):
  - all validation keywords (see [JSON Schema validation keywords](./docs/json-schema.md))
  - keyword "nullable" from [Open API 3 specification](https://swagger.io/docs/specification/data-models/data-types/).
  - full support of remote references (remote schemas have to be added with `addSchema` or compiled to be available)
  - support of circular references between schemas
  - correct string lengths for strings with unicode pairs
  - [formats](#formats) defined by JSON Schema draft-07 standard (with [ajv-formats](https://github.com/ajv-validator/ajv-formats) plugin) and additional formats (can be turned off)
  - [validates schemas against meta-schema](./docs/api.md#api-validateschema)
- supports [browsers](#using-in-browser) and Node.js 0.10-14.x
- [asynchronous loading](./docs/validation.md#asynchronous-schema-compilation) of referenced schemas during compilation
- "All errors" validation mode with [option allErrors](./docs/api.md#options)
- [error messages with parameters](./docs/api.md#validation-errors) describing error reasons to allow error message generation
- i18n error messages support with [ajv-i18n](https://github.com/ajv-validator/ajv-i18n) package
- [removing-additional-properties](./docs/validation.md#removing-additional-properties)
- [assigning defaults](./docs/validation.md#assigning-defaults) to missing properties and items
- [coercing data](./docs/validation.md#coercing-data-types) to the types specified in `type` keywords
- [user-defined keywords](#user-defined-keywords)
- draft-06/07 keywords `const`, `contains`, `propertyNames` and `if/then/else`
- draft-06 boolean schemas (`true`/`false` as a schema to always pass/fail).
- additional extension keywords with [ajv-keywords](https://github.com/ajv-validator/ajv-keywords) package
- [\$data reference](./docs/validation.md#data-reference) to use values from the validated data as values for the schema keywords
- [asynchronous validation](./docs/api.md#asynchronous-validation) of user-defined formats and keywords


## Install

To install version 7:

```
npm install ajv@beta
```

To install the previous [version 6](https://github.com/ajv-validator/ajv/tree/v6):

```
npm install ajv
```

## <a name="usage"></a>Getting started

Try it in the Node.js REPL: https://runkit.com/npm/ajv

In JavaScript:

```javascript
// or ESM/TypeScript import
import Ajv from "ajv"
// Node.js require:
const Ajv = require("ajv").default

const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
const validate = ajv.compile(schema)
const valid = validate(data)
if (!valid) console.log(validate.errors)
```

In TypeScript:

```typescript
import Ajv, {JSONSchemaType, DefinedError} from "ajv"

const ajv = new Ajv()

type MyData = {foo: number}

// Optional schema type annotation for schema to match MyData type.
// To use JSONSchemaType set `strictNullChecks: true` in tsconfig `compilerOptions`.
const schema: JSONSchemaType<MyData> = {
  type: "object",
  properties: {
    foo: {type: "number", minimum: 0},
  },
  required: ["foo"],
  additionalProperties: false,
}

// validate is a type guard for MyData - type is inferred from schema type
const validate = ajv.compile(schema)

// or, if you did not use type annotation for the schema,
// type parameter can be used to make it type guard:
// const validate = ajv.compile<MyData>(schema)

const data: any = {foo: 1}

if (validate(data)) {
  // data is MyData here
  console.log(data.foo)
} else {
  // The type cast is needed to allow user-defined keywords and errors
  // You can extend this type to include your error types as needed.
  for (const err of validate.errors as DefinedError[]) {
    switch (err.keyword) {
      case "minimum":
        // err type is narrowed here to have "minimum" error params properties
        console.log(err.params.limit)
        break
      // ...
    }
  }
}
```

See [this test](./spec/types/json-schema.spec.ts) for an advanced example, [API reference](./docs/api.md) and [Options](./docs/api.md#options) for more details.

Ajv compiles schemas to functions and caches them in all cases (using schema itself as a key for Map) or another function passed via options), so that the next time the same schema is used (not necessarily the same object instance) it won't be compiled again.

The best performance is achieved when using compiled functions returned by `compile` or `getSchema` methods (there is no additional function call).

**Please note**: every time a validation function or `ajv.validate` are called `errors` property is overwritten. You need to copy `errors` array reference to another variable if you want to use it later (e.g., in the callback). See [Validation errors](./docs/api.md#validation-errors)

## Using in browser

See [Content Security Policy](./docs/security.md#content-security-policy) to decide the best approach how to use Ajv in the browser.

Whether you use Ajv or compiled schemas, it is recommended that you bundle them together with your code.

If you need to use Ajv in several bundles you can create a separate UMD bundles using `npm run bundle` script.

Then you need to load Ajv with support of JSON Schema draft-07 in the browser:

```html
<script src="bundle/ajv7.min.js"></script>
<script>
  ;(function () {
    const Ajv = window.ajv7.default
    const ajv = new Ajv()
  })()
</script>
```

or to load the bundle that supports JSONSchema draft-2019-09:

```html
<script src="bundle/ajv2019.min.js"></script>
<script>
  ;(function () {
    const Ajv = window.ajv2019.default
    const ajv = new Ajv()
  })()
</script>
```

This bundle can be used with different module systems; it creates global `ajv` (or `ajv2019`) if no module system is found.

The browser bundle is available on [cdnjs](https://cdnjs.com/libraries/ajv).

**Please note**: some frameworks, e.g. Dojo, may redefine global require in a way that is not compatible with CommonJS module format. In this case Ajv bundle has to be loaded before the framework and then you can use global `ajv` (see issue [#234](https://github.com/ajv-validator/ajv/issues/234)).

## Command line interface

CLI is available as a separate npm package [ajv-cli](https://github.com/ajv-validator/ajv-cli). It supports:

- compiling JSON Schemas to test their validity
- generating [standalone validation code](./docs/standalone.md) that exports validation function(s) to be used without Ajv
- migrating schemas to draft-07 and draft-2019-09 (using [json-schema-migrate](https://github.com/epoberezkin/json-schema-migrate))
- validating data file(s) against JSON Schema
- testing expected validity of data against JSON Schema
- referenced schemas
- user-defined meta-schemas, validation keywords and formats
- files in JSON, JSON5, YAML, and JavaScript format
- all Ajv options
- reporting changes in data after validation in [JSON-patch](https://tools.ietf.org/html/rfc6902) format

## Extending Ajv

### User defined keywords

See section in [data validation](./docs/validation.md#user-defined-keywords) and the [detailed guide](./docs/keywords.md).

### Plugins

Ajv can be extended with plugins that add keywords, formats or functions to process generated code. When such plugin is published as npm package it is recommended that it follows these conventions:

- it exports a function that accepts ajv instance as the first parameter - it allows using plugins with [ajv-cli](#command-line-interface).
- this function returns the same instance to allow chaining.
- this function can accept an optional configuration as the second parameter.

You can import `Plugin` interface from ajv if you use Typescript.

If you have published a useful plugin please submit a PR to add it to the next section.

### Related packages

- [ajv-bsontype](https://github.com/BoLaMN/ajv-bsontype) - plugin to validate mongodb's bsonType formats
- [ajv-cli](https://github.com/jessedc/ajv-cli) - command line interface
- [ajv-formats](https://github.com/ajv-validator/ajv-formats) - formats defined in JSON Schema specification
- [ajv-errors](https://github.com/ajv-validator/ajv-errors) - plugin for defining error messages in the schema
- [ajv-i18n](https://github.com/ajv-validator/ajv-i18n) - internationalised error messages
- [ajv-istanbul](https://github.com/ajv-validator/ajv-istanbul) - plugin to instrument generated validation code to measure test coverage of your schemas
- [ajv-keywords](https://github.com/ajv-validator/ajv-keywords) - plugin with additional validation keywords (select, typeof, etc.)
- [ajv-merge-patch](https://github.com/ajv-validator/ajv-merge-patch) - plugin with keywords $merge and $patch
- [ajv-formats-draft2019](https://github.com/luzlab/ajv-formats-draft2019) - format validators for draft2019 that aren't included in [ajv-formats](https://github.com/ajv-validator/ajv-formats) (ie. `idn-hostname`, `idn-email`, `iri`, `iri-reference` and `duration`)

## Some packages using Ajv

- [webpack](https://github.com/webpack/webpack) - a module bundler. Its main purpose is to bundle JavaScript files for usage in a browser
- [jsonscript-js](https://github.com/JSONScript/jsonscript-js) - the interpreter for [JSONScript](http://www.jsonscript.org) - scripted processing of existing endpoints and services
- [osprey-method-handler](https://github.com/mulesoft-labs/osprey-method-handler) - Express middleware for validating requests and responses based on a RAML method object, used in [osprey](https://github.com/mulesoft/osprey) - validating API proxy generated from a RAML definition
- [har-validator](https://github.com/ahmadnassri/har-validator) - HTTP Archive (HAR) validator
- [jsoneditor](https://github.com/josdejong/jsoneditor) - a web-based tool to view, edit, format, and validate JSON http://jsoneditoronline.org
- [JSON Schema Lint](https://github.com/nickcmaynard/jsonschemalint) - a web tool to validate JSON/YAML document against a single JSON Schema http://jsonschemalint.com
- [objection](https://github.com/vincit/objection.js) - SQL-friendly ORM for Node.js
- [table](https://github.com/gajus/table) - formats data into a string table
- [ripple-lib](https://github.com/ripple/ripple-lib) - a JavaScript API for interacting with [Ripple](https://ripple.com) in Node.js and the browser
- [restbase](https://github.com/wikimedia/restbase) - distributed storage with REST API & dispatcher for backend services built to provide a low-latency & high-throughput API for Wikipedia / Wikimedia content
- [hippie-swagger](https://github.com/CacheControl/hippie-swagger) - [Hippie](https://github.com/vesln/hippie) wrapper that provides end to end API testing with swagger validation
- [react-form-controlled](https://github.com/seeden/react-form-controlled) - React controlled form components with validation
- [rabbitmq-schema](https://github.com/tjmehta/rabbitmq-schema) - a schema definition module for RabbitMQ graphs and messages
- [@query/schema](https://www.npmjs.com/package/@query/schema) - stream filtering with a URI-safe query syntax parsing to JSON Schema
- [chai-ajv-json-schema](https://github.com/peon374/chai-ajv-json-schema) - chai plugin to us JSON Schema with expect in mocha tests
- [grunt-jsonschema-ajv](https://github.com/SignpostMarv/grunt-jsonschema-ajv) - Grunt plugin for validating files against JSON Schema
- [extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin) - extract text from bundle into a file
- [electron-builder](https://github.com/electron-userland/electron-builder) - a solution to package and build a ready for distribution Electron app
- [addons-linter](https://github.com/mozilla/addons-linter) - Mozilla Add-ons Linter
- [gh-pages-generator](https://github.com/epoberezkin/gh-pages-generator) - multi-page site generator converting markdown files to GitHub pages
- [ESLint](https://github.com/eslint/eslint) - the pluggable linting utility for JavaScript and JSX

## Changes history

See https://github.com/ajv-validator/ajv/releases

**Please note**: [Changes in version 7.0.0-beta](https://github.com/ajv-validator/ajv/releases/tag/v7.0.0-beta.0)

[Version 6.0.0](https://github.com/ajv-validator/ajv/releases/tag/v6.0.0).

## Code of conduct

Please review and follow the [Code of conduct](./CODE_OF_CONDUCT.md).

Please report any unacceptable behaviour to ajv.validator@gmail.com - it will be reviewed by the project team.

## Security contact

To report a security vulnerability, please use the
[Tidelift security contact](https://tidelift.com/security).
Tidelift will coordinate the fix and disclosure. Please do NOT report security vulnerabilities via GitHub issues.

<<<<<<< HEAD
##### Untrusted schemas

Ajv treats JSON schemas as trusted as your application code. This security model is based on the most common use case, when the schemas are static and bundled together with the application.

If your schemas are received from untrusted sources (or generated from untrusted data) there are several scenarios you need to prevent:

- compiling schemas can cause stack overflow (if they are too deep)
- compiling schemas can be slow (e.g. [#557](https://github.com/ajv-validator/ajv/issues/557))
- validating certain data can be slow

It is difficult to predict all the scenarios, but at the very least it may help to limit the size of untrusted schemas (e.g. limit JSON string length) and also the maximum schema object depth (that can be high for relatively small JSON strings). You also may want to mitigate slow regular expressions in `pattern` and `patternProperties` keywords.

Regardless the measures you take, using untrusted schemas increases security risks.

##### Circular references in JavaScript objects

Ajv does not support schemas and validated data that have circular references in objects. See [issue #802](https://github.com/ajv-validator/ajv/issues/802).

An attempt to compile such schemas or validate such data would cause stack overflow (or will not complete in case of asynchronous validation). Depending on the parser you use, untrusted data can lead to circular references.

##### Security risks of trusted schemas

Some keywords in JSON Schemas can lead to very slow validation for certain data. These keywords include (but may be not limited to):

- `pattern` and `format` for large strings - in some cases using `maxLength` can help mitigate it, but certain regular expressions can lead to exponential validation time even with relatively short strings (see [ReDoS attack](#redos-attack)).
- `patternProperties` for large property names - use `propertyNames` to mitigate, but some regular expressions can have exponential evaluation time as well.
- `uniqueItems` for large non-scalar arrays - use `maxItems` to mitigate

**Please note**: The suggestions above to prevent slow validation would only work if you do NOT use `allErrors: true` in production code (using it would continue validation after validation errors).

You can validate your JSON schemas against [this meta-schema](./lib/refs/json-schema-secure.json) to check that these recommendations are followed:

```javascript
const isSchemaSecure = ajv.compile(
  require("ajv/lib/refs/json-schema-secure.json")
)

const schema1 = {format: "email"}
isSchemaSecure(schema1) // false

const schema2 = {format: "email", maxLength: MAX_LENGTH}
isSchemaSecure(schema2) // true
```

**Please note**: following all these recommendation is not a guarantee that validation of untrusted data is safe - it can still lead to some undesirable results.

##### Content Security Policies (CSP)

See [Ajv and Content Security Policies (CSP)](#ajv-and-content-security-policies-csp)

## ReDoS attack

Certain regular expressions can lead to the exponential evaluation time even with relatively short strings.

Please assess the regular expressions you use in the schemas on their vulnerability to this attack - see [safe-regex](https://github.com/substack/safe-regex), for example.

**Please note**: some formats that [ajv-formats](https://github.com/ajv-validator/ajv-formats) package implements use [regular expressions](https://github.com/ajv-validator/ajv-formats/blob/master/src/formats.ts) that can be vulnerable to ReDoS attack, so if you use Ajv to validate data from untrusted sources **it is strongly recommended** to consider the following:

- making assessment of "format" implementations in [ajv-formats](https://github.com/ajv-validator/ajv-formats).
- passing `"fast"` option to ajv-formats plugin (see its docs) that simplifies some of the regular expressions (although it does not guarantee that they are safe).
- replacing format implementations provided by ajv-formats with your own implementations of "format" keyword that either use different regular expressions or another approach to format validation. Please see [addFormat](#api-addformat) method.
- disabling format validation by ignoring "format" keyword with option `format: false`

Whatever mitigation you choose, please assume all formats provided by ajv-formats as potentially unsafe and make your own assessment of their suitability for your validation scenarios.

## Filtering data

With [option `removeAdditional`](#options) (added by [andyscott](https://github.com/andyscott)) you can filter data during the validation.

This option modifies original data.

Example:

```javascript
const ajv = new Ajv({removeAdditional: true})
const schema = {
  additionalProperties: false,
  properties: {
    foo: {type: "number"},
    bar: {
      additionalProperties: {type: "number"},
      properties: {
        baz: {type: "string"},
      },
    },
  },
}

const data = {
  foo: 0,
  additional1: 1, // will be removed; `additionalProperties` == false
  bar: {
    baz: "abc",
    additional2: 2, // will NOT be removed; `additionalProperties` != false
  },
}

const validate = ajv.compile(schema)

console.log(validate(data)) // true
console.log(data) // { "foo": 0, "bar": { "baz": "abc", "additional2": 2 }
```

If `removeAdditional` option in the example above were `"all"` then both `additional1` and `additional2` properties would have been removed.

If the option were `"failing"` then property `additional1` would have been removed regardless of its value and property `additional2` would have been removed only if its value were failing the schema in the inner `additionalProperties` (so in the example above it would have stayed because it passes the schema, but any non-number would have been removed).

**Please note**: If you use `removeAdditional` option with `additionalProperties` keyword inside `anyOf`/`oneOf` keywords your validation can fail with this schema, for example:

```javascript
{
  type: "object",
  oneOf: [
    {
      properties: {
        foo: {type: "string"}
      },
      required: ["foo"],
      additionalProperties: false
    },
    {
      properties: {
        bar: {type: "integer"}
      },
      required: ["bar"],
      additionalProperties: false
    }
  ]
}
```

The intention of the schema above is to allow objects with either the string property "foo" or the integer property "bar", but not with both and not with any other properties.

With the option `removeAdditional: true` the validation will pass for the object `{ "foo": "abc"}` but will fail for the object `{"bar": 1}`. It happens because while the first subschema in `oneOf` is validated, the property `bar` is removed because it is an additional property according to the standard (because it is not included in `properties` keyword in the same schema).

While this behaviour is unexpected (issues [#129](https://github.com/ajv-validator/ajv/issues/129), [#134](https://github.com/ajv-validator/ajv/issues/134)), it is correct. To have the expected behaviour (both objects are allowed and additional properties are removed) the schema has to be refactored in this way:

```javascript
{
  type: "object",
  properties: {
    foo: {type: "string"},
    bar: {type: "integer"}
  },
  additionalProperties: false,
  oneOf: [{required: ["foo"]}, {required: ["bar"]}]
}
```

The schema above is also more efficient - it will compile into a faster function.

## Assigning defaults

With [option `useDefaults`](#options) Ajv will assign values from `default` keyword in the schemas of `properties` and `items` (when it is the array of schemas) to the missing properties and items.

With the option value `"empty"` properties and items equal to `null` or `""` (empty string) will be considered missing and assigned defaults.

This option modifies original data.

**Please note**: the default value is inserted in the generated validation code as a literal, so the value inserted in the data will be the deep clone of the default in the schema.

Example 1 (`default` in `properties`):

```javascript
const ajv = new Ajv({useDefaults: true})
const schema = {
  type: "object",
  properties: {
    foo: {type: "number"},
    bar: {type: "string", default: "baz"},
  },
  required: ["foo", "bar"],
}

const data = {foo: 1}

const validate = ajv.compile(schema)

console.log(validate(data)) // true
console.log(data) // { "foo": 1, "bar": "baz" }
```

Example 2 (`default` in `items`):

```javascript
const schema = {
  type: "array",
  items: [{type: "number"}, {type: "string", default: "foo"}],
}

const data = [1]

const validate = ajv.compile(schema)

console.log(validate(data)) // true
console.log(data) // [ 1, "foo" ]
```

With `useDefaults` option `default` keywords throws exception during schema compilation when used in:

- not in `properties` or `items` subschemas
- in schemas inside `anyOf`, `oneOf` and `not` (see [#42](https://github.com/ajv-validator/ajv/issues/42))
- in `if` schema
- in schemas generated by user-defined _macro_ keywords

The strict mode option can change the behavior for these unsupported defaults (`strict: false` to ignore them, `"log"` to log a warning).

See [Strict mode](#strict-mode).

## Coercing data types

When you are validating user inputs all your data properties are usually strings. The option `coerceTypes` allows you to have your data types coerced to the types specified in your schema `type` keywords, both to pass the validation and to use the correctly typed data afterwards.

This option modifies original data.

**Please note**: if you pass a scalar value to the validating function its type will be coerced and it will pass the validation, but the value of the variable you pass won't be updated because scalars are passed by value.

Example 1:

```javascript
const ajv = new Ajv({coerceTypes: true})
const schema = {
  type: "object",
  properties: {
    foo: {type: "number"},
    bar: {type: "boolean"},
  },
  required: ["foo", "bar"],
}

const data = {foo: "1", bar: "false"}

const validate = ajv.compile(schema)

console.log(validate(data)) // true
console.log(data) // { "foo": 1, "bar": false }
```

Example 2 (array coercions):

```javascript
const ajv = new Ajv({coerceTypes: "array"})
const schema = {
  properties: {
    foo: {type: "array", items: {type: "number"}},
    bar: {type: "boolean"},
  },
}

const data = {foo: "1", bar: ["false"]}

const validate = ajv.compile(schema)

console.log(validate(data)) // true
console.log(data) // { "foo": [1], "bar": false }
```

The coercion rules, as you can see from the example, are different from JavaScript both to validate user input as expected and to have the coercion reversible (to correctly validate cases where different types are defined in subschemas of "anyOf" and other compound keywords).

See [Coercion rules](./DOCS/COERCION.md) for details.

## API

#### new Ajv(options: object)

Create Ajv instance:

```javascript
const ajv = new Ajv()
```

See [Options](#options)

#### ajv.compile(schema: object): (data: any) =\> boolean | Promise\<any\>

Generate validating function and cache the compiled schema for future use.

Validating function returns a boolean value (or promise for async schemas that must have `$async: true` property - see [Asynchronous validation](#asynchronous-validation)). This function has properties `errors` and `schema`. Errors encountered during the last validation are assigned to `errors` property (it is assigned `null` if there was no errors). `schema` property contains the reference to the original schema.

The schema passed to this method will be validated against meta-schema unless `validateSchema` option is false. If schema is invalid, an error will be thrown. See [options](#options).

In typescript returned validation function can be a type guard if you pass type parameter:

```typescript
interface Foo {
  foo: number
}

const FooSchema: JSONSchemaType<Foo> = {
  type: "object",
  properties: {foo: {type: "number"}},
  required: ["foo"],
  additionalProperties: false,
}

const validate = ajv.compile<Foo>(FooSchema) // type of validate extends `(data: any) => data is Foo`
const data: any = {foo: 1}
if (validate(data)) {
  // data is Foo here
  console.log(data.foo)
} else {
  console.log(validate.errors)
}
```

See more advanced example in [the test](./spec/types/json-schema.spec.ts).

#### <a name="api-compileAsync"></a>ajv.compileAsync(schema: object, meta?: boolean): Promise\<Function\>

Asynchronous version of `compile` method that loads missing remote schemas using asynchronous function in `options.loadSchema`. This function returns a Promise that resolves to a validation function. An optional callback passed to `compileAsync` will be called with 2 parameters: error (or null) and validating function. The returned promise will reject (and the callback will be called with an error) when:

- missing schema can't be loaded (`loadSchema` returns a Promise that rejects).
- a schema containing a missing reference is loaded, but the reference cannot be resolved.
- schema (or some loaded/referenced schema) is invalid.

The function compiles schema and loads the first missing schema (or meta-schema) until all missing schemas are loaded.

You can asynchronously compile meta-schema by passing `true` as the second parameter.

Similarly to `compile`, it can return type guard in typescript.

See example in [Asynchronous compilation](#asynchronous-schema-compilation).

#### ajv.validate(schemaOrRef: object | string, data: any): boolean

Validate data using passed schema (it will be compiled and cached).

Instead of the schema you can use the key that was previously passed to `addSchema`, the schema id if it was present in the schema or any previously resolved reference.

Validation errors will be available in the `errors` property of Ajv instance (`null` if there were no errors).

In typescript this method can act as a type guard (similarly to function retured by `compile` method - see example there).

**Please note**: every time this method is called the errors are overwritten so you need to copy them to another variable if you want to use them later.

If the schema is asynchronous (has `$async` keyword on the top level) this method returns a Promise. See [Asynchronous validation](#asynchronous-validation).

#### ajv.addSchema(schema: object | object[], key?: string): Ajv

Add schema(s) to validator instance. This method does not compile schemas (but it still validates them). Because of that dependencies can be added in any order and circular dependencies are supported. It also prevents unnecessary compilation of schemas that are containers for other schemas but not used as a whole.

Array of schemas can be passed (schemas should have ids), the second parameter will be ignored.

Key can be passed that can be used to reference the schema and will be used as the schema id if there is no id inside the schema. If the key is not passed, the schema id will be used as the key.

Once the schema is added, it (and all the references inside it) can be referenced in other schemas and used to validate data.

Although `addSchema` does not compile schemas, explicit compilation is not required - the schema will be compiled when it is used first time.

By default the schema is validated against meta-schema before it is added, and if the schema does not pass validation the exception is thrown. This behaviour is controlled by `validateSchema` option.

**Please note**: Ajv uses the [method chaining syntax](https://en.wikipedia.org/wiki/Method_chaining) for all methods with the prefix `add*` and `remove*`.
This allows you to do nice things like the following.

```javascript
const validate = new Ajv().addSchema(schema).addFormat(name, regex).getSchema(uri)
```

#### ajv.addMetaSchema(schema: object | object[], key?: string): Ajv

Adds meta schema(s) that can be used to validate other schemas. That function should be used instead of `addSchema` because there may be instance options that would compile a meta schema incorrectly (at the moment it is `removeAdditional` option).

There is no need to explicitly add draft-07 meta schema (http://json-schema.org/draft-07/schema) - it is added by default, unless option `meta` is set to `false`. You only need to use it if you have a changed meta-schema that you want to use to validate your schemas. See `validateSchema`.

#### <a name="api-validateschema"></a>ajv.validateSchema(schema: object): boolean

Validates schema. This method should be used to validate schemas rather than `validate` due to the inconsistency of `uri` format in JSON Schema standard.

By default this method is called automatically when the schema is added, so you rarely need to use it directly.

If schema doesn't have `$schema` property, it is validated against draft 6 meta-schema (option `meta` should not be false).

If schema has `$schema` property, then the schema with this id (that should be previously added) is used to validate passed schema.

Errors will be available at `ajv.errors`.

#### ajv.getSchema(key: string): undefined | ((data: any) =\> boolean | Promise\<any\>)

Retrieve compiled schema previously added with `addSchema` by the key passed to `addSchema` or by its full reference (id). The returned validating function has `schema` property with the reference to the original schema.

#### ajv.removeSchema(schemaOrRef: object | string | RegExp): Ajv

Remove added/cached schema. Even if schema is referenced by other schemas it can be safely removed as dependent schemas have local references.

Schema can be removed using:

- key passed to `addSchema`
- it's full reference (id)
- RegExp that should match schema id or key (meta-schemas won't be removed)
- actual schema object (that will be optionally serialized) to remove schema from cache

If no parameter is passed all schemas but meta-schemas will be removed and the cache will be cleared.

#### <a name="api-addformat"></a>ajv.addFormat(name: string, format: Format): Ajv

```typescript
type Format =
  | true // to ignore this format (and pass validation)
  | string // will be converted to RegExp
  | RegExp
  | (data: string) => boolean
  | Object // format definition (see below and in types)
```

Add format to validate strings or numbers.

If object is passed it should have properties `validate`, `compare` and `async`:

```typescript
interface FormatDefinition { // actual type definition is more precise - see types.ts
  validate: string | RegExp | (data: number | string) => boolean | Promise<boolean>
  compare: (data1: string, data2: string): number // an optional function that accepts two strings
    // and compares them according to the format meaning.
    // This function is used with keywords `formatMaximum`/`formatMinimum`
    // (defined in [ajv-keywords](https://github.com/ajv-validator/ajv-keywords) package).
    // It should return `1` if the first value is bigger than the second value,
    // `-1` if it is smaller and `0` if it is equal.
  async?: true // if `validate` is an asynchronous function
  type?: "string" | "number" // "string" is default. If data type is different, the validation will pass.
}
```

Formats can be also added via `formats` option.

#### <a name="api-addkeyword"></a>ajv.addKeyword(definition: object):s Ajv

Add validation keyword to Ajv instance.

Keyword should be different from all standard JSON Schema keywords and different from previously defined keywords. There is no way to redefine keywords or to remove keyword definition from the instance.

Keyword must start with a letter, `_` or `$`, and may continue with letters, numbers, `_`, `$`, or `-`.
It is recommended to use an application-specific prefix for keywords to avoid current and future name collisions.

Example Keywords:

- `"xyz-example"`: valid, and uses prefix for the xyz project to avoid name collisions.
- `"example"`: valid, but not recommended as it may collide with future versions of JSON Schema etc.
- `"3-example"`: invalid as numbers are not allowed to be the first character in a keyword

Keyword definition is an object with the following properties:

```typescript
interface KeywordDefinition {
  // actual type definition is more precise - see types.ts
  keyword: string // keyword name
  type?: string | string[] // JSON data type(s) the keyword applies to. Default - all types.
  schemaType?: string | string[] // the required schema JSON type
  code?: Function // function to generate code, used for all pre-defined keywords
  validate?: Function // validating function
  compile?: Function // compiling function
  macro?: Function // macro function
  error?: object // error definition object - see types.ts
  schema?: false // used with "validate" keyword to not pass schema to function
  metaSchema?: object // meta-schema for keyword schema
  dependencies?: string[] // properties that must be present in the parent schema -
  // it will be checked during schema compilation
  implements?: string[] // keyword names to reserve that this keyword implements
  modifying?: true // MUST be passed if keyword modifies data
  valid?: boolean // to pre-define validation result, validation function result will be ignored -
  // this option MUST NOT be used with `macro` keywords.
  $data?: true // to support [\$data reference](#data-reference) as the value of keyword.
  // The reference will be resolved at validation time. If the keyword has meta-schema,
  // it would be extended to allow $data and it will be used to validate the resolved value.
  // Supporting $data reference requires that keyword has `code` or `validate` function
  // (the latter can be used in addition to `compile` or `macro`).
  $dataError?: object // error definition object for invalid \$data schema - see types.ts
  async?: true // if the validation function is asynchronous
  // (whether it is returned from `compile` or passed in `validate` property).
  // It should return a promise that resolves with a value `true` or `false`.
  // This option is ignored in case of "macro" and "code" keywords.
  errors?: boolean | "full" // whether keyword returns errors.
  // If this property is not passed Ajv will determine
  // if the errors were set in case of failed validation.
}
```

`compile`, `macro` and `code` are mutually exclusive, only one should be used at a time. `validate` can be used separately or in addition to `compile` or `macro` to support [\$data reference](#data-reference).

**Please note**: If the keyword is validating data type that is different from the type(s) in its definition, the validation function will not be called (and expanded macro will not be used), so there is no need to check for data type inside validation function or inside schema returned by macro function (unless you want to enforce a specific type and for some reason do not want to use a separate `type` keyword for that). In the same way as standard keywords work, if the keyword does not apply to the data type being validated, the validation of this keyword will succeed.

See [User defined keywords](#user-defined-keywords) for more details.

#### ajv.getKeyword(keyword: string): object | boolean

Returns keyword definition, `false` if the keyword is unknown.

#### ajv.removeKeyword(keyword: string): Ajv

Removes added or pre-defined keyword so you can redefine them.

While this method can be used to extend pre-defined keywords, it can also be used to completely change their meaning - it may lead to unexpected results.

**Please note**: schemas compiled before the keyword is removed will continue to work without changes. To recompile schemas use `removeSchema` method and compile them again.

#### ajv.errorsText(errors?: object[], options?: object): string

Returns the text with all errors in a String.

Options can have properties `separator` (string used to separate errors, ", " by default) and `dataVar` (the variable name that dataPaths are prefixed with, "data" by default).

## Options

Option defaults:

```javascript
// see types/index.ts for actual types
const defaultOptions = {
  // strict mode options
  strict: true,
  strictTypes: "log",
  strictTuples: "log",
  allowUnionTypes: false,
  allowMatchingProperties: false,
  validateFormats: true,
  // validation and reporting options:
  $data: false,
  allErrors: false,
  verbose: false,
  $comment: false,
  formats: {},
  keywords: {},
  schemas: {},
  logger: undefined,
  loadSchema: undefined, // function(uri: string): Promise {}
  // options to modify validated data:
  removeAdditional: false,
  useDefaults: false,
  coerceTypes: false,
  // advanced options:
  meta: true,
  validateSchema: true,
  addUsedSchema: true,
  inlineRefs: true,
  passContext: false,
  loopRequired: Infinity,
  loopEnum: Infinity,
  ownProperties: false,
  multipleOfPrecision: false,
  messages: true,
  code: {es5: false, lines: false},
}
```

#### Strict mode options (NEW in v7)

- _strict_: By default Ajv executes in strict mode, that is designed to prevent any unexpected behaviours or silently ignored mistakes in schemas (see [Strict Mode](#strict-mode) for more details). It does not change any validation results, but it makes some schemas invalid that would be otherwise valid according to JSON Schema specification. Option values:
  - `true` (default) - use strict mode and throw an exception when any strict mode restriction is violated.
  - `"log"` - log warning when any strict mode restriction is violated.
  - `false` - ignore all strict mode restrictions. Also ignores `strictTypes` restrictions unless it is explicitely passed.
- _strictTypes_: By default Ajv logs warning when "type" keyword is used in a way that may be incorrect or confusing to other people - see [Strict types](#strict-types) for more details. This option does not change validation results. Option values:
  - `true` - throw exception when any strictTypes restriction is violated.
  - `"log"` (default, unless option strict is `false`) - log warning when any strictTypes restriction is violated.
  - `false` - ignore all strictTypes restrictions violations.
- _strictTuples_: By default Ajv logs warning when "items" is array and "minItems" and "maxItems"/"additionalItems" not present or different from the number of items. See [Strict mode](#strict-mode) for more details. This option does not change validation results. Option values:
  - `true` - throw exception.
  - `"log"` (default, unless option strict is `false`) - log warning.
  - `false` - ignore strictTuples restriction violations.
- _allowUnionTypes_: pass true to allow using multiple non-null types in "type" keyword (one of `strictTypes` restricitons). see [Strict types](#strict-types)
- _allowMatchingProperties_: pass true to allow overlap between "properties" and "patternProperties". Does not affect other strict mode restrictions. See [Strict Mode](#strict-mode).
- _validateFormats_: format validation. Option values:
  - `true` (default) - validate formats (see [Formats](#formats)). In [strict mode](#strict-mode) unknown formats will throw exception during schema compilation (and fail validation in case format keyword value is [\$data reference](#data-reference)).
  - `false` - do not validate any format keywords (TODO they will still collect annotations once supported).

#### Validation and reporting options

- _\$data_: support [\$data references](#data-reference). Draft 6 meta-schema that is added by default will be extended to allow them. If you want to use another meta-schema you need to use $dataMetaSchema method to add support for $data reference. See [API](#api).
- _allErrors_: check all rules collecting all errors. Default is to return after the first error.
- _verbose_: include the reference to the part of the schema (`schema` and `parentSchema`) and validated data in errors (false by default).
- _\$comment_: log or pass the value of `$comment` keyword to a function. Option values:
  - `false` (default): ignore \$comment keyword.
  - `true`: log the keyword value to console.
  - function: pass the keyword value, its schema path and root schema to the specified function
- _formats_: an object with format definitions. Keys and values will be passed to `addFormat` method. Pass `true` as format definition to ignore some formats.
- _keywords_: an array of keyword definitions or strings. Values will be passed to `addKeyword` method.
- _schemas_: an array or object of schemas that will be added to the instance. In case you pass the array the schemas must have IDs in them. When the object is passed the method `addSchema(value, key)` will be called for each schema in this object.
- _logger_: sets the logging method. Default is the global `console` object that should have methods `log`, `warn` and `error`. See [Error logging](#error-logging). Option values:
  - logger instance - it should have methods `log`, `warn` and `error`. If any of these methods is missing an exception will be thrown.
  - `false` - logging is disabled.
- _loadSchema_: asynchronous function that will be used to load remote schemas when `compileAsync` [method](#api-compileAsync) is used and some reference is missing (option `missingRefs` should NOT be 'fail' or 'ignore'). This function should accept remote schema uri as a parameter and return a Promise that resolves to a schema. See example in [Asynchronous compilation](#asynchronous-schema-compilation).

#### Options to modify validated data

- _removeAdditional_: remove additional properties - see example in [Filtering data](#filtering-data). This option is not used if schema is added with `addMetaSchema` method. Option values:
  - `false` (default) - not to remove additional properties
  - `"all"` - all additional properties are removed, regardless of `additionalProperties` keyword in schema (and no validation is made for them).
  - `true` - only additional properties with `additionalProperties` keyword equal to `false` are removed.
  - `"failing"` - additional properties that fail schema validation will be removed (where `additionalProperties` keyword is `false` or schema).
- _useDefaults_: replace missing or undefined properties and items with the values from corresponding `default` keywords. Default behaviour is to ignore `default` keywords. This option is not used if schema is added with `addMetaSchema` method. See examples in [Assigning defaults](#assigning-defaults). Option values:
  - `false` (default) - do not use defaults
  - `true` - insert defaults by value (object literal is used).
  - `"empty"` - in addition to missing or undefined, use defaults for properties and items that are equal to `null` or `""` (an empty string).
- _coerceTypes_: change data type of data to match `type` keyword. See the example in [Coercing data types](#coercing-data-types) and [coercion rules](./DOCS/COERCION.md). Option values:
  - `false` (default) - no type coercion.
  - `true` - coerce scalar data types.
  - `"array"` - in addition to coercions between scalar types, coerce scalar data to an array with one element and vice versa (as required by the schema).

#### Advanced options

- _meta_: add [meta-schema](http://json-schema.org/documentation.html) so it can be used by other schemas (true by default). If an object is passed, it will be used as the default meta-schema for schemas that have no `$schema` keyword. This default meta-schema MUST have `$schema` keyword.
- _validateSchema_: validate added/compiled schemas against meta-schema (true by default). `$schema` property in the schema can be http://json-schema.org/draft-07/schema or absent (draft-07 meta-schema will be used) or can be a reference to the schema previously added with `addMetaSchema` method. Option values:
  - `true` (default) - if the validation fails, throw the exception.
  - `"log"` - if the validation fails, log error.
  - `false` - skip schema validation.
- _addUsedSchema_: by default methods `compile` and `validate` add schemas to the instance if they have `$id` (or `id`) property that doesn't start with "#". If `$id` is present and it is not unique the exception will be thrown. Set this option to `false` to skip adding schemas to the instance and the `$id` uniqueness check when these methods are used. This option does not affect `addSchema` method.
- _inlineRefs_: Affects compilation of referenced schemas. Option values:
  - `true` (default) - the referenced schemas that don't have refs in them are inlined, regardless of their size - it improves performance.
  - `false` - to not inline referenced schemas (they will always be compiled as separate functions).
  - integer number - to limit the maximum number of keywords of the schema that will be inlined (to balance the total size of compiled functions and performance).
- _passContext_: pass validation context to _compile_ and _validate_ keyword functions. If this option is `true` and you pass some context to the compiled validation function with `validate.call(context, data)`, the `context` will be available as `this` in your keywords. By default `this` is Ajv instance.
- _loopRequired_: by default `required` keyword is compiled into a single expression (or a sequence of statements in `allErrors` mode). In case of a very large number of properties in this keyword it may result in a very big validation function. Pass integer to set the number of properties above which `required` keyword will be validated in a loop - smaller validation function size but also worse performance.
- _loopEnum_ (NEW in v7): by default `enum` keyword is compiled into a single expression. In case of a very large number of allowed values it may result in a large validation function. Pass integer to set the number of values above which `enum` keyword will be validated in a loop.
- _ownProperties_: by default Ajv iterates over all enumerable object properties; when this option is `true` only own enumerable object properties (i.e. found directly on the object rather than on its prototype) are iterated. Contributed by @mbroadst.
- _multipleOfPrecision_: by default `multipleOf` keyword is validated by comparing the result of division with parseInt() of that result. It works for dividers that are bigger than 1. For small dividers such as 0.01 the result of the division is usually not integer (even when it should be integer, see issue [#84](https://github.com/ajv-validator/ajv/issues/84)). If you need to use fractional dividers set this option to some positive integer N to have `multipleOf` validated using this formula: `Math.abs(Math.round(division) - division) < 1e-N` (it is slower but allows for float arithmetics deviations).
- _messages_: Include human-readable messages in errors. `true` by default. `false` can be passed when messages are generated outside of Ajv code (e.g. with [ajv-i18n](https://github.com/ajv-validator/ajv-i18n)).
- _code_ (new in v7): code generation options:

```typescript
type CodeOptions = {
  es5?: boolean // to generate es5 code - by default code is es6, with "for-of" loops, "let" and "const"
  lines?: boolean // add line-breaks to code - to simplify debugging of generated functions
  source?: boolean // add `source` property (see Source below) to validating function.
  process?: (code: string, schema?: SchemaEnv) => string // an optional function to process generated code
  // before it is passed to Function constructor.
  // It can be used to either beautify or to transpile code.
}

type Source = {
  code: string // unlike func.toString() it includes assignments exernal to function scope
  scope: Scope // see Code generation (TODO)
}
```

## Validation errors

In case of validation failure, Ajv assigns the array of errors to `errors` property of validation function (or to `errors` property of Ajv instance when `validate` or `validateSchema` methods were called). In case of [asynchronous validation](#asynchronous-validation), the returned promise is rejected with exception `Ajv.ValidationError` that has `errors` property.

### Error objects

Each error is an object with the following properties:

```typescript
interface ErrorObject {
  keyword: string // validation keyword.
  dataPath: string // JSON pointer to the part of the data that was validated (e.g., `"/prop/1/subProp"`).
  schemaPath: string // the path (JSON-pointer as a URI fragment) to the schema of the failing keyword.
  // the object with the additional information about error that can be used to generate error messages
  // (e.g., using [ajv-i18n](https://github.com/ajv-validator/ajv-i18n) package).
  // See below for parameters set by all keywords.
  params: object // type is defined by keyword value, see below
  propertyName?: string // set for errors in `propertyNames` keyword schema.
  // `dataPath` still points to the object in this case.
  message?: string // the standard error message (can be excluded with option `messages` set to false).
  schema?: any // the schema of the keyword (added with `verbose` option).
  parentSchema?: object // the schema containing the keyword (added with `verbose` option)
  data?: any // the data validated by the keyword (added with `verbose` option).
}
```

### Error parameters

Properties of `params` object in errors depend on the keyword that failed validation.

In typescript, the ErrorObject is a discriminated union that allows to determine the type of error parameters based on the value of keyword:

```typescript
const ajv = new Ajv()
const validate = ajv.compile<MyData>(schema)
if (validate(data)) {
  // data is MyData here
  // ...
} else {
  // DefinedError is a type for all pre-defined keywords errors,
  // validate.errors has type ErrorObject[] - to allow user-defined keywords with any error parameters.
  // Users can extend DefinedError to include the keywords errors they defined.
  for (const err of validate.errors as DefinedError[]) {
    switch (err.keyword) {
      case "maximum":
        console.log(err.limit)
        break
      case "pattern":
        console.log(err.pattern)
        break
      // ...
    }
  }
}
```

Also see an example in [this test](./spec/types/error-parameters.spec.ts)

- `maxItems`, `minItems`, `maxLength`, `minLength`, `maxProperties`, `minProperties`:

```typescript
type ErrorParams = {limit: number} // keyword value
```

- `additionalItems`:

```typescript
// when `items` is an array of schemas and `additionalItems` is false:
type ErrorParams = {limit: number} // the maximum number of allowed items
```

- `additionalProperties`:

```typescript
type ErrorParams = {additionalProperty: string}
// the property not defined in `properties` and `patternProperties` keywords
```

- `dependencies`:

```typescript
type ErrorParams = {
  property: string // dependent property,
  missingProperty: string // required missing dependency - only the first one is reported
  deps: string // required dependencies, comma separated list as a string (TODO change to string[])
  depsCount: number // the number of required dependencies
}
```

- `format`:

```typescript
type ErrorParams = {format: string} // keyword value
```

- `maximum`, `minimum`, `exclusiveMaximum`, `exclusiveMinimum`:

```typescript
type ErrorParams = {
  limit: number // keyword value
  comparison: "<=" | ">=" | "<" | ">" // operation to compare the data to the limit,
  // with data on the left and the limit on the right
}
```

- `multipleOf`:

```typescript
type ErrorParams = {multipleOf: number} // keyword value
```

- `pattern`:

```typescript
type ErrorParams = {pattern: string} // keyword value
```

- `required`:

```typescript
type ErrorParams = {missingProperty: string} // required property that is missing
```

- `propertyNames`:

```typescript
type ErrorParams = {propertyName: string} // invalid property name
```

User-defined keywords can define other keyword parameters.

### Error logging

A logger instance can be passed via `logger` option to Ajv constructor. The use of other logging packages is supported as long as the package or its associated wrapper exposes the required methods. If any of the required methods are missing an exception will be thrown.

- **Required Methods**: `log`, `warn`, `error`

```javascript
const otherLogger = new OtherLogger()
const ajv = new Ajv({
  logger: {
    log: console.log.bind(console),
    warn: function warn() {
      otherLogger.logWarn.apply(otherLogger, arguments)
    },
    error: function error() {
      otherLogger.logError.apply(otherLogger, arguments)
      console.error.apply(console, arguments)
    },
  },
})
```

## Plugins

Ajv can be extended with plugins that add keywords, formats or functions to process generated code. When such plugin is published as npm package it is recommended that it follows these conventions:

- it exports a function
- this function accepts ajv instance as the first parameter and returns the same instance to allow chaining
- this function can accept an optional configuration as the second parameter

If you have published a useful plugin please submit a PR to add it to the next section.

## Related packages

- [ajv-async](https://github.com/ajv-validator/ajv-async) - plugin to configure async validation mode (DEPRECATED)
- [ajv-bsontype](https://github.com/BoLaMN/ajv-bsontype) - plugin to validate mongodb's bsonType formats
- [ajv-cli](https://github.com/jessedc/ajv-cli) - command line interface
- [ajv-formats](https://github.com/ajv-validator/ajv-formats) - formats defined in JSON Schema specification.
- [ajv-errors](https://github.com/ajv-validator/ajv-errors) - plugin for defining error messages in the schema
- [ajv-i18n](https://github.com/ajv-validator/ajv-i18n) - internationalised error messages
- [ajv-istanbul](https://github.com/ajv-validator/ajv-istanbul) - plugin to instrument generated validation code to measure test coverage of your schemas
- [ajv-keywords](https://github.com/ajv-validator/ajv-keywords) - plugin with additional validation keywords (select, typeof, etc.)
- [ajv-merge-patch](https://github.com/ajv-validator/ajv-merge-patch) - plugin with keywords $merge and $patch
- [ajv-pack](https://github.com/ajv-validator/ajv-pack) - produces a compact module exporting validation functions
- [ajv-formats-draft2019](https://github.com/luzlab/ajv-formats-draft2019) - format validators for draft2019 that aren't included in [ajv-formats](https://github.com/ajv-validator/ajv-formats) (ie. `idn-hostname`, `idn-email`, `iri`, `iri-reference` and `duration`).

## Some packages using Ajv

- [webpack](https://github.com/webpack/webpack) - a module bundler. Its main purpose is to bundle JavaScript files for usage in a browser
- [jsonscript-js](https://github.com/JSONScript/jsonscript-js) - the interpreter for [JSONScript](http://www.jsonscript.org) - scripted processing of existing endpoints and services
- [osprey-method-handler](https://github.com/mulesoft-labs/osprey-method-handler) - Express middleware for validating requests and responses based on a RAML method object, used in [osprey](https://github.com/mulesoft/osprey) - validating API proxy generated from a RAML definition
- [har-validator](https://github.com/ahmadnassri/har-validator) - HTTP Archive (HAR) validator
- [jsoneditor](https://github.com/josdejong/jsoneditor) - a web-based tool to view, edit, format, and validate JSON http://jsoneditoronline.org
- [JSON Schema Lint](https://github.com/nickcmaynard/jsonschemalint) - a web tool to validate JSON/YAML document against a single JSON Schema http://jsonschemalint.com
- [objection](https://github.com/vincit/objection.js) - SQL-friendly ORM for Node.js
- [table](https://github.com/gajus/table) - formats data into a string table
- [ripple-lib](https://github.com/ripple/ripple-lib) - a JavaScript API for interacting with [Ripple](https://ripple.com) in Node.js and the browser
- [restbase](https://github.com/wikimedia/restbase) - distributed storage with REST API & dispatcher for backend services built to provide a low-latency & high-throughput API for Wikipedia / Wikimedia content
- [hippie-swagger](https://github.com/CacheControl/hippie-swagger) - [Hippie](https://github.com/vesln/hippie) wrapper that provides end to end API testing with swagger validation
- [react-form-controlled](https://github.com/seeden/react-form-controlled) - React controlled form components with validation
- [rabbitmq-schema](https://github.com/tjmehta/rabbitmq-schema) - a schema definition module for RabbitMQ graphs and messages
- [@query/schema](https://www.npmjs.com/package/@query/schema) - stream filtering with a URI-safe query syntax parsing to JSON Schema
- [chai-ajv-json-schema](https://github.com/peon374/chai-ajv-json-schema) - chai plugin to us JSON Schema with expect in mocha tests
- [grunt-jsonschema-ajv](https://github.com/SignpostMarv/grunt-jsonschema-ajv) - Grunt plugin for validating files against JSON Schema
- [extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin) - extract text from bundle into a file
- [electron-builder](https://github.com/electron-userland/electron-builder) - a solution to package and build a ready for distribution Electron app
- [addons-linter](https://github.com/mozilla/addons-linter) - Mozilla Add-ons Linter
- [gh-pages-generator](https://github.com/epoberezkin/gh-pages-generator) - multi-page site generator converting markdown files to GitHub pages
- [ESLint](https://github.com/eslint/eslint) - the pluggable linting utility for JavaScript and JSX
- [Spectral](https://github.com/stoplightio/spectral) - the customizable linting utility for JSON/YAML, OpenAPI, AsyncAPI, and JSON Schema

## Tests

```
npm install
git submodule update --init
npm test
```

## Contributing

`npm run build` - compiles typescript to dist folder.

`npm run watch` - automatically compiles typescript when files in lib folder change

Please see [Contributing guidelines](./DOCS/CONTRIBUTING.md)

## Changes history

See https://github.com/ajv-validator/ajv/releases

<<<<<<< HEAD
**Please note**: [Changes in version 6.0.0](https://github.com/ajv-validator/ajv/releases/tag/v6.0.0).

[Version 5.0.0](https://github.com/ajv-validator/ajv/releases/tag/5.0.0).

[Version 4.0.0](https://github.com/ajv-validator/ajv/releases/tag/4.0.0).

[Version 3.0.0](https://github.com/ajv-validator/ajv/releases/tag/3.0.0).

[Version 2.0.0](https://github.com/ajv-validator/ajv/releases/tag/2.0.0).

=======
__Please note__: [Changes in version 7.0.0-beta](https://github.com/ajv-validator/ajv/releases/tag/v7.0.0-beta.0)

[Version 6.0.0](https://github.com/ajv-validator/ajv/releases/tag/v6.0.0).

>>>>>>> docs: note about v7 in readme
## Code of conduct

Please review and follow the [Code of conduct](./CODE_OF_CONDUCT.md).

Please report any unacceptable behaviour to ajv.validator@gmail.com - it will be reviewed by the project team.

=======
>>>>>>> split readme to files, fix links
## Open-source software support

Ajv is a part of [Tidelift subscription](https://tidelift.com/subscription/pkg/npm-ajv?utm_source=npm-ajv&utm_medium=referral&utm_campaign=readme) - it provides a centralised support to open-source software users, in addition to the support provided by software maintainers.

## License

[MIT](./LICENSE)
