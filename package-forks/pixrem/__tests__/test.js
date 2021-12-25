"use strict";

const { test } = require("uvu");
const assert = require("uvu/assert");

var pixrem = require("../lib/pixrem");
var postcss = require("postcss");

var css = ".rule { font-size: 2rem }";

function process(plugin, input, options = {}) {
  return postcss([plugin]).process(input, { from: undefined, ...options }).css;
}

test("should generate fallbacks using default settings", function() {
  var expected = ".rule { font-size: 32px; font-size: 2rem }";
  var processed = process(pixrem, css);
  assert.equal(processed, expected);
});

test("should default to 16 when undefined", function() {
  var expected = ".rule { font-size: 32px; font-size: 2rem }";
  var processed = process(pixrem({ rootValue: undefined }), css);
  assert.equal(processed, expected);
});

test("should generate fallbacks with a pixel root em value", function() {
  var expected = ".rule { font-size: 40px; font-size: 2rem }";
  var processed = process(pixrem({ rootValue: "20px" }), css);
  assert.equal(processed, expected);
});

test("should generate fallbacks with a em root em value", function() {
  var expected = ".rule { font-size: 48px; font-size: 2rem }";
  var processed = process(pixrem({ rootValue: "1.5em" }), css);
  assert.equal(processed, expected);
});

test("should generate fallbacks with a rem root em value", function() {
  var expected = ".rule { font-size: 56px; font-size: 2rem }";
  var processed = process(pixrem({ rootValue: "1.75rem" }), css);
  assert.equal(processed, expected);
});

test("should generate fallbacks with a percent root em value", function() {
  var expected = ".rule { font-size: 48px; font-size: 2rem }";
  var processed = process(pixrem({ rootValue: "150%" }), css);
  assert.equal(processed, expected);
});

test("should generate fallbacks with a unitless root em value", function() {
  var expected = ".rule { font-size: 36px; font-size: 2rem }";
  var processed = process(pixrem({ rootValue: "18" }), css);
  assert.equal(processed, expected);
});

test("should generate fallbacks with a vw root em value", function() {
  var expected = ".rule { font-size: 32px; font-size: 2rem }";
  var processed = process(pixrem({ rootValue: ".625vw" }), css);
  assert.equal(processed, expected);
});

test("should warn when using browser-dependent unit", function() {
  var expected = ".rule { font-size: 32px; font-size: 2rem }";
  
  return postcss([pixrem({ rootValue: "1vw" })])
    .process(css, { from: undefined })
    .then(function(result) {
      var warnings = result.warnings();
      assert.equal(JSON.parse(JSON.stringify(warnings)), [
        {
          type: "warning",
          text: "Unit cannot be used for conversion, so 16px is used.",
          plugin: "pixrem",
        },
      ]);
      assert.equal(result.css, expected);
    });
});

test("should generate fallbacks with a value starting with dot", function() {
  var expected = ".rule { font-size: 16px; font-size: 2rem }";
  var processed = process(pixrem({ rootValue: ".5em" }), css);
  assert.equal(processed, expected);
});

test("should replace rules with fallbacks when option.replace is true", function() {
  var expected = ".rule { font-size: 40px }";
  var processed = process(pixrem({ rootValue: "20px", replace: true }), css);
  assert.equal(processed, expected);
});

test("should round values based on default precision", function() {
  var expected = ".rule { font-size: 36.032px; font-size: 2rem }";
  var processed = process(pixrem({ rootValue: "1.126em" }), css);
  assert.equal(processed, expected);
});

test("should return integer when precision is 0", function() {
  var expected = ".rule { font-size: 36px; font-size: 2rem }";
  var processed = process(
    pixrem({ rootValue: "1.126em", unitPrecision: 0 }),
    css
  );
  assert.equal(processed, expected);
});

test("should return integer rounded down", function() {
  var expected = ".rule { font-size: 36px; font-size: 2rem }";
  var processed = process(
    pixrem({ rootValue: "1.156em", unitPrecision: 0 }),
    css
  );
  assert.equal(processed, expected);
});

test("should handle < 1 values and values without a leading 0", function() {
  var css = ".rule { margin: 0.5rem .5rem 0rem -2rem }";
  var expected =
    ".rule { margin: 8px 8px 0px -32px; margin: 0.5rem .5rem 0rem -2rem }";
  var processed = process(pixrem, css);
  assert.equal(processed, expected);
});

test("should generate default fallback with an inline sourcemap", function() {
  var expected =
    ".rule { font-size: 32px; font-size: 2rem }\n/*# sourceMappingURL=whatever.css.map */";
  var processed = process(pixrem, css, {
    map: { inline: false },
    to: "whatever.css",
  });
  assert.equal(processed, expected);
});

test("should not convert rem in at-rules", function() {
  var css =
    "@media screen { .rule { font-size: 2rem } } @keyframes name { from { font-size: 2rem } }";
  var processed = process(pixrem, css);
  assert.equal(processed, css);
});

test("should convert rem in at-rules if options is true", function() {
  var css = "@media screen { .rule { font-size: 2rem } }";
  var expected = "@media screen { .rule { font-size: 32px; font-size: 2rem } }";
  var processed = process(pixrem({ atrules: true }), css);
  assert.equal(processed, expected);
});

test("should convert rem in at-rules for IE9 hacks", function() {
  var css =
    "@media screen { .rule { font-size: 2rem } .rule::after { font-size: 2rem } }";
  var expected =
    "@media screen { .rule { font-size: 2rem } .rule::after { font-size: 32px; font-size: 2rem } }";
  var processed = process(pixrem({ browsers: "ie 9" }), css);
  assert.equal(processed, expected);
});

test("should not convert rem in nested at-rules", function() {
  var css =
    "@media screen { .rule { font-size: 2rem } @media screen { .rule { font-size: 2rem } @media screen { .rule { font-size: 2rem } } } }";
  var processed = process(pixrem, css);
  assert.equal(processed, css);
});

test("should not convert rem in unsupported feature (value)", function() {
  var css =
    ".rule { width: calc(100% - 2rem); background: linear-gradient(red 2rem, blue) }";
  var processed = process(pixrem, css);
  assert.equal(processed, css);
});

test("should not convert rem in unsupported feature (property)", function() {
  var css = ".rule { transform: translate(2rem) }";
  var processed = process(pixrem, css);
  assert.equal(processed, css);
});

test("should not convert rem in unsupported feature (with prefixes)", function() {
  var css =
    ".rule { width: -webkit-calc(100% - 2rem); width: calc(100% - 2rem); -ms-transform: translate(2rem) }";
  var processed = process(pixrem, css);
  assert.equal(processed, css);
});

test("should use default root font-size as defined in CSS", function() {
  var css = "html { font-size: 62.5% } .rule { font-size: 2rem; }";
  var expected =
    "html { font-size: 62.5% } .rule { font-size: 20px; font-size: 2rem; }";
  var processed = process(pixrem, css);
  assert.equal(processed, expected);
});

test("should use default root font-size from font declaration", function() {
  var css =
    ".rule { font-size: 2rem; } :root { font: italic 100 20px/24px sans-serif }";
  var expected =
    ".rule { font-size: 40px; font-size: 2rem; } :root { font: italic 100 20px/24px sans-serif }";
  var processed = process(pixrem, css);
  assert.equal(processed, expected);
});

test("should detect root font-size only if targeted", function() {
  var css = ":root a { font-size: 10px } .rule { font-size: 2rem; }";
  var expected =
    ":root a { font-size: 10px } .rule { font-size: 32px; font-size: 2rem; }";
  var processed = process(pixrem, css);
  assert.equal(processed, expected);
});

test("should use root font-size defined with calc", function() {
  var css = "html { font-size: calc(.625em * 1) } .rule { font-size: 2rem; }";
  var expected =
    "html { font-size: calc(.625em * 1) } .rule { font-size: 20px; font-size: 2rem; }";
  var processed = process(pixrem, css);
  assert.equal(processed, expected);
});

test("should not use root font-size in MQ", function() {
  var css =
    "html { font-size: 10px } @media screen { html { font-size: 20px } } .rule { font-size: 2rem; }";
  var expected =
    "html { font-size: 10px } @media screen { html { font-size: 20px } } .rule { font-size: 20px; font-size: 2rem; }";
  var processed = process(pixrem, css);
  assert.equal(processed, expected);
});

test("should run through font shorthand without root size", function() {
  var css = "html { font: inherit } .rule { font-size: 2rem; }";
  var expected =
    "html { font: inherit } .rule { font-size: 32px; font-size: 2rem; }";
  var processed = process(pixrem, css);
  assert.equal(processed, expected);
});

test("should not use root font-size when option is set", function() {
  var css = "html { font-size: 10px } .rule { font-size: 2rem; }";
  var expected =
    "html { font-size: 10px } .rule { font-size: 32px; font-size: 2rem; }";
  var processed = process(pixrem({ html: false }), css);
  assert.equal(processed, expected);
});

test("should throw error when root font-size is invalid", function() {
  var css = "html { font-size: calc(1em + 2px) } .rule { font-size: 2rem; }";
  return postcss([pixrem])
    .process(css, { from: undefined })
    .then(function() {
      assert.unreachable("should not run");
    })
    .catch(function(err) {
      assert.equal(err.name, "CssSyntaxError");
      assert.equal(err.reason, "Root font-size is invalid");
    });
});

test("should reduce line-breaks when inserting new node", function() {
  var css = ".rule{\n\tcolor:red;\n\n\tfont-size:2rem;\n}";
  var expected =
    ".rule{\n\tcolor:red;\n\n\tfont-size:32px;\n\tfont-size:2rem;\n}";
  var processed = process(pixrem, css);
  assert.equal(processed, expected);
});

test("should reduce and keep windows line-breaks", function() {
  var css = ".rule{\r\n\tcolor:red;\r\n\r\n\tfont-size:2rem;\r\n}";
  var expected =
    ".rule{\r\n\tcolor:red;\r\n\r\n\tfont-size:32px;\r\n\tfont-size:2rem;\r\n}";
  var processed = process(pixrem, css);
  assert.equal(processed, expected);
});

test("should reduce and keep linux line-breaks", function() {
  var css = ".rule{\r\tcolor:red;\r\r\tfont-size:2rem;\r}";
  var expected =
    ".rule{\r\tcolor:red;\r\r\tfont-size:32px;\r\tfont-size:2rem;\r}";
  var processed = process(pixrem, css);
  assert.equal(processed, expected);
});

test("should not reduce line-breaks when replacing node", function() {
  var css = ".rule{\n\tcolor:red;\n\n\tfont-size:2rem;\n}";
  var expected = ".rule{\n\tcolor:red;\n\n\tfont-size:32px;\n}";
  var processed = process(pixrem({ replace: true }), css);
  assert.equal(processed, expected);
});

test("should not add fallback when IE8- are not in scope", function() {
  var css = ".rule{width: 2rem}";
  var expected = ".rule{width: 2rem}";
  var processed = process(pixrem({ browsers: "firefox 28" }), css);
  assert.equal(processed, expected);
});

test("should add fallback when only IE8 is in scope", function() {
  var css = ".rule{width: 2rem}";
  var expected = ".rule{width: 32px;width: 2rem}";
  var processed = process(pixrem({ browsers: "ie 8" }), css);
  assert.equal(processed, expected);
});

test("should add fallback when IE8 is in scope", function() {
  var css = ".rule{width: 2rem}";
  var expected = ".rule{width: 32px;width: 2rem}";
  var processed1 = process(pixrem({ browsers: "ie 8" }), css);
  var processed2 = process(pixrem({ browsers: "ie >= 8" }), css);
  var processed3 = process(pixrem({ browsers: "ie <= 8" }), css);
  assert.equal(processed1, expected);
  assert.equal(processed2, expected);
  assert.equal(processed3, expected);
});

test("should add fallback when only IE6 is in scope", function() {
  var css = ".rule{width: 2rem}";
  var expected = ".rule{width: 32px;width: 2rem}";
  var processed = process(pixrem({ browsers: "ie 6" }), css);
  assert.equal(processed, expected);
});

test("should add fallback only for font and pseudo-element when IE9 is in scope", function() {
  var css =
    ".rule{width: 2rem;font: bold 2rem sans-serif}.rule::after{width: 2rem}";
  var expected =
    ".rule{width: 2rem;font: bold 32px sans-serif;font: bold 2rem sans-serif}.rule::after{width: 32px;width: 2rem}";
  var processed = process(pixrem({ browsers: "ie 9" }), css);
  assert.equal(processed, expected);
});

test.run();
