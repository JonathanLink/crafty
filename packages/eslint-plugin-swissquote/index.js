function resolveModules(...args) {
  return args.map(arg => require.resolve(`./src/${arg}.js`));
}

const parserOptions = {
  requireConfigFile: false,
  babelOptions: {
    presets: [
      [
        require.resolve("@swissquote/babel-preset-swissquote"),
        { environment: "test" }
      ]
    ]
  }
};

module.exports = {
  configs: {
    format: {
      parser: require.resolve("@babel/eslint-parser"),
      parserOptions,
      extends: resolveModules("formatting", "es6-format"),
      overrides: [
        {
          files: ["*.ts", "*.tsx"],
          parser: require.resolve("./packages/typescript-eslint_parser.js"),
          // Extends doesn't work in overrides, so we add rules directly
          rules: require("./src/typescript.js").rules
        }
      ]
    },
    node: {
      parser: require.resolve("@babel/eslint-parser"),
      parserOptions,
      extends: resolveModules("node"),
      overrides: [
        {
          files: ["*.ts", "*.tsx"],
          parser: require.resolve("./packages/typescript-eslint_parser.js")
        }
      ]
    },
    legacy: {
      env: {
        browser: true,
        amd: true
      },
      extends: resolveModules("formatting", "best-practices"),
      rules: {
        "no-dupe-keys": "error"
      }
    },
    recommended: {
      parser: require.resolve("@babel/eslint-parser"),
      parserOptions,
      env: {
        browser: true,
        amd: true
      },
      extends: resolveModules(
        "formatting",
        "best-practices",
        "es6-format",
        "es6-recommended",
        "react"
      ),
      overrides: [
        {
          files: ["*.ts", "*.tsx"],
          parser: require.resolve("./packages/typescript-eslint_parser.js"),

          // Extends doesn't work in overrides, so we add rules directly
          rules: {
            ...require("./src/typescript.js").rules,
            ...require("./src/typescript-best-practices.js").rules
          }
        }
      ]
    }
  },
  rules: require("./rules")
};
