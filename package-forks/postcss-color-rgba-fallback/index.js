/**
 * Module dependencies.
 */
const valueParser = require("postcss-value-parser");
const { colord } = require("colord");

/**
 * Calculate the color of a chanel
 * based upon two 0-255 colors and a 0-1 alpha value
 */
function calcChannel(backgroundColor, foregroundColor, alpha) {
  const value = backgroundColor + (foregroundColor - backgroundColor) * alpha;
  return Math.round(value);
}

/**
 * Given a solid rgb background and a rgba foreground color
 * it calculates the color of the values combined into a single rgb array
 * If there is no background color
 *   strips off the alpha value from the foreground
 */
function calculateRGB(backgroundColor, foregroundColor) {
  if (backgroundColor) {
    return [
      calcChannel(backgroundColor[0], foregroundColor[0], foregroundColor[3]),
      calcChannel(backgroundColor[1], foregroundColor[1], foregroundColor[3]),
      calcChannel(backgroundColor[2], foregroundColor[2], foregroundColor[3])
    ];
  } else {
    return [foregroundColor[0], foregroundColor[1], foregroundColor[2]];
  }
}

function getIEConfig(options) {
  let oldie = options.oldie;
  if (oldie === true) {
    oldie = ["background-color", "background"];
  } else if (!Array.isArray(oldie)) {
    oldie = false;
  }

  return oldie;
}

function isRGBA(declaration, properties) {
  return (
    declaration.value &&
    declaration.value.indexOf("rgba") > -1 &&
    properties.indexOf(declaration.prop) > -1
  );
}

function isPrecededBySameProp(declaration) {
  return declaration.prev() && declaration.prev().prop === declaration.prop;
}

/**
 * PostCSS plugin to transform rgba() to hexadecimal
 */
module.exports = function(options = {}) {
  const properties = options.properties || [
    "background-color",
    "background",
    "color",
    "border",
    "border-color",
    "outline",
    "outline-color"
  ];

  const backgroundColor = options.backgroundColor || null;

  const oldie = getIEConfig(options);

  return {
    postcssPlugin: "postcss-color-rgba-fallback",
    Declaration(declaration, { decl }) {
      if (!isRGBA(declaration, properties)) {
        return;
      }

      // if previous prop equals current prop
      // no need fallback
      if (isPrecededBySameProp(declaration)) {
        return;
      }

      let hex;
      let alpha;
      const value = valueParser(declaration.value)
        .walk(node => {
          const nodes = node.nodes;
          if (node.type === "function" && node.value === "rgba") {
            try {
              alpha = parseFloat(nodes[6].value);
              const [r, g, b] = calculateRGB(backgroundColor, [
                parseInt(nodes[0].value, 10),
                parseInt(nodes[2].value, 10),
                parseInt(nodes[4].value, 10),
                alpha
              ]);
              hex = colord({ r, g, b })
                .toHex()
                .substring(1);

              node.type = "word";
              node.value = `#${hex}`;
            } catch (e) {
              console.error(e);

              return false;
            }
            return false;
          }

          return true;
        })
        .toString();

      if (value !== declaration.value) {
        declaration.cloneBefore({ value });

        if (
          oldie &&
          oldie.indexOf(declaration.prop) !== -1 &&
          alpha > 0 &&
          alpha < 1
        ) {
          hex = `#${Math.round(alpha * 255).toString(16)}${hex}`;
          const ieFilter = [
            "progid:DXImageTransform.Microsoft.gradient(startColorStr=",
            hex,
            ",endColorStr=",
            hex,
            ")"
          ].join("");
          const gteIE8 = decl({
            prop: "-ms-filter",
            value: `"${ieFilter}"`
          });
          const ltIE8 = decl({
            prop: "filter",
            value: ieFilter
          });

          declaration.parent.insertBefore(declaration, gteIE8);
          declaration.parent.insertBefore(declaration, ltIE8);
        }
      }
    }
  };
};

module.exports.postcss = true;
