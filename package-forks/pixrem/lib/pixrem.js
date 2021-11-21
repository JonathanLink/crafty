/* eslint-disable no-param-reassign */
var calc = require("reduce-css-calc");
var browserslist = require("browserslist");

var REGEX = /(\d*\.?\d+)rem/gi;
var BASE_FONT_SIZE = 16;
var PROPS = /^(background-size|border-image|border-radius|box-shadow|clip-path|column|grid|mask|object|perspective|scroll|shape|size|stroke|transform)/;
var VALUES = /(calc|gradient)\(/;

/**
 * Returns the input string stripped of its vendor prefix.
 *
 * @param {string} prop String with or without vendor prefix.
 *
 * @return {string} String name without vendor prefixes.
 *
 * @example
 * unprefixed('-moz-tab-size') //=> 'tab-size'
 */
function unprefixed(prop) {
  return prop.replace(/^-\w+-/, "");
}

// Detect if one browser from the browserQuery is in browsers
function detectBrowser(browsers, browserQuery) {
  var b = false;
  browserQuery = browserslist(browserQuery);
  for (var i = 0; i < browsers.length; i++) {
    for (var j = 0; j < browserQuery.length; j++) {
      if (browsers[i] === browserQuery[j]) {
        b = true;
        break;
      }
    }
    if (b) {
      break;
    }
  }
  return b;
}

// Return a unitless pixel value from any root font-size value.
function toPx(value, decl, result) {
  value =
    typeof value === "string" && value.indexOf("calc(") !== -1
      ? calc(value)
      : value;
  var parts = /^(\d*\.?\d+)([a-zA-Z%]*)$/.exec(value);
  if (parts !== null) {
    var number = parts[1];
    var unit = parts[2];

    if (unit === "px" || unit === "") {
      return parseFloat(number);
    } else if (unit === "em" || unit === "rem") {
      return parseFloat(number) * BASE_FONT_SIZE;
    } else if (unit === "%") {
      return (parseFloat(number) / 100) * BASE_FONT_SIZE;
    } else {
      // other units: vw, ex, ch, etc...
      result.warn("Unit cannot be used for conversion, so 16px is used.");
      return BASE_FONT_SIZE;
    }
  } else {
    throw decl.error("Root font-size is invalid", { plugin: "pixrem" });
  }
}

// Reduce line breaks
function reduceLineBreaks(value) {
  return value.replace(/(\r*\n|\r)+/g, "$1");
}

// Round values based on precision
// rounded down to match webkit and opera behavior:
// http://tylertate.com/blog/2012/01/05/subpixel-rounding.html
function rounded(value, precision) {
  precision = Math.pow(10, precision);
  return Math.floor(value * precision) / precision;
}

/* eslint-disable-next-line @swissquote/swissquote/sonarjs/cognitive-complexity */
module.exports = (opts = {}) => {
  var options = {
    rootValue: opts.rootValue !== undefined ? opts.rootValue : BASE_FONT_SIZE,
    replace: opts.replace !== undefined ? opts.replace : false,
    atrules: opts.atrules !== undefined ? opts.atrules : false,
    html: opts.html !== undefined ? opts.html : true,
    unitPrecision: opts.unitPrecision !== undefined ? opts.unitPrecision : 3
  };

  options.browsers = opts.browsers !== undefined ? opts.browsers : "ie <= 8";
  options.browsers = browserslist(options.browsers);

  return {
    postcssPlugin: "pixrem",
    Once(css, { result }) {
      var isIElte8, isIEgte9, isIE9Or10;
      if (detectBrowser(options.browsers, "ie <= 8")) {
        isIElte8 = true;
      }
      if (detectBrowser(options.browsers, "ie >= 9")) {
        isIEgte9 = true;
      }
      if (detectBrowser(options.browsers, "ie 9, ie 10")) {
        isIE9Or10 = true;
      }
      // no IE versions needed, skip
      if (!isIElte8 && !isIEgte9 && !isIE9Or10) {
        return;
      }

      if (options.html) {
        // First, check root font-size
        css.walkRules(rule => {
          if (rule.parent && rule.parent.type === "atrule") {
            return;
          }
          if (/^(html|:root)$/.test(rule.selectors)) {
            rule.walkDecls(decl => {
              if (decl.prop === "font-size") {
                options.rootValue = decl.value;
              } else if (decl.prop === "font" && decl.value.match(/\d/)) {
                options.rootValue = decl.value.match(
                  /.*?([\d\.]*(em|px|rem|%|pt|pc))/
                )[1];
              }
            });
          }
        });
      }

      css.walkRules(rule => {
        // if options.at-rules is false AND it's not IE9-10: skip @rules
        if (
          !options.atrules &&
          !isIE9Or10 &&
          (rule.type === "atrule" ||
            (rule.parent && rule.parent.type === "atrule"))
        ) {
          return;
        }

        var isPseudoElement = rule.selector.search(/:(after|before)/gi) !== -1;

        rule.each((decl, i) => {
          if (decl.type !== "decl") {
            return;
          }

          var value = decl.value;

          if (value.indexOf("rem") !== -1) {
            var prop = unprefixed(decl.prop);
            var isFontShorthand = prop === "font";
            var isSpecialCaseIE9Or10 =
              isIE9Or10 && (isPseudoElement || isFontShorthand);
            var isUseless = VALUES.test(value) || PROPS.test(prop);
            var isNotUseless = (isIElte8 || !isIE9Or10) && !isUseless;

            if (isSpecialCaseIE9Or10 || isNotUseless) {
              value = value.replace(REGEX, $1 => {
                return `${rounded(
                  parseFloat($1) * toPx(options.rootValue, decl, result),
                  options.unitPrecision
                )}px`;
              });

              if (options.replace) {
                decl.value = value;
              } else {
                var clone = decl.clone({ value });
                if (decl.raws.before) {
                  clone.raws.before = decl.raws.before;
                  decl.raws.before = reduceLineBreaks(decl.raws.before);
                }
                rule.insertBefore(i, clone);
              }
            }
          }
        });
      });
    }
  };
};

module.exports.postcss = true;
