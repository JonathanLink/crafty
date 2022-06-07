const crypto = require("crypto");
const fs = require("fs");
const jestPreset = require("@swissquote/babel-preset-swissquote/packages/preset-jest");
const babel = require("@babel/core");
const babelIstanbulPlugin = require("@swissquote/babel-preset-swissquote/packages/plugin-istanbul");

const THIS_FILE = fs.readFileSync(__filename);

module.exports = {
  canInstrument: true,
  getCacheKey(fileData, filename, instance) {
    return crypto
      .createHash("md5")
      .update(THIS_FILE)
      .update("\0", "utf8")
      .update(fileData)
      .update("\0", "utf8")
      .update(instance.configString)
      .update("\0", "utf8")
      .update(filename)
      .digest("hex");
  },
  process(code, filename, { config }, transformOptions) {
    if (babel.util && !babel.util.canCompile(filename)) {
      return { code };
    }

    const options = {
      ...config.globals.BABEL_OPTIONS,
      babelrc: false,
      plugins:
        (config.globals.BABEL_OPTIONS &&
          config.globals.BABEL_OPTIONS.plugins) ||
        [],
      presets: (
        (config.globals.BABEL_OPTIONS &&
          config.globals.BABEL_OPTIONS.presets) ||
        []
      ).concat([jestPreset]),
      retainLines: true,
      sourceMaps: "inline",
      filename
    };

    if (transformOptions && transformOptions.instrument) {
      options.auxiliaryCommentBefore = " istanbul ignore next ";
      // Copied from jest-runtime transform.js
      options.plugins = options.plugins.concat([
        [
          babelIstanbulPlugin.default,
          {
            // files outside `cwd` will not be instrumented
            cwd: config.rootDir,
            exclude: []
          }
        ]
      ]);
    }

    return { code: babel.transform(code, options).code };
  }
};
