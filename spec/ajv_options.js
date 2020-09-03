"use strict"

var isBrowser = typeof window == "object"
var fullTest = isBrowser || !process.env.AJV_FAST_TEST

var options = fullTest
  ? {
      allErrors: true,
      verbose: true,
      extendRefs: "ignore",
      inlineRefs: false,
      codegen: {es5: true, lines: true},
    }
  : {allErrors: true, codegen: {es5: true, lines: true}}

module.exports = options
