const fs = require("fs");
const path = require("path");
const resolveFrom = require("../packages/resolve-from");
const tmp = require("@swissquote/crafty-commons/packages/tmp");

function mergeConfiguration(configuration, args, newConfiguration) {
  if (
    newConfiguration.useEslintrc === false &&
    args.indexOf("--no-eslintrc") === -1
  ) {
    args.push("--no-eslintrc");
  }

  if (newConfiguration.extends) {
    if (typeof newConfiguration.extends === "string") {
      configuration.extends.push(newConfiguration.extends);
    } else {
      newConfiguration.extends.forEach(item =>
        configuration.extends.push(item)
      );
    }
  }

  Object.assign(configuration.rules, newConfiguration.rules || {});

  if (newConfiguration.baseConfig && newConfiguration.baseConfig.settings) {
    Object.assign(configuration.settings, newConfiguration.baseConfig.settings);
  }

  if (newConfiguration.settings) {
    Object.assign(configuration.settings, newConfiguration.settings);
  }

  if (newConfiguration.configFile) {
    mergeConfiguration(
      configuration,
      args,
      require(newConfiguration.configFile)
    );
  }
}

function configurationBuilder(args) {
  const configuration = {
    plugins: ["@swissquote/swissquote"],
    extends: ["plugin:@swissquote/swissquote/format"],
    rules: {},
    settings: {}
  };

  // Override from default config if it exists
  if (global.craftyConfig) {
    mergeConfiguration(configuration, args, global.craftyConfig.eslint);
  }

  // Merge configuration that can be passed in cli arguments
  let idx;
  if ((idx = args.indexOf("--config")) > -1) {
    const configFile = args[idx + 1];
    args.splice(idx, 2);

    mergeConfiguration(
      configuration,
      args,
      require(resolveFrom.silent(process.cwd(), configFile) ||
        path.join(process.cwd(), configFile))
    );
  }

  if (args.indexOf("--preset") > -1) {
    configuration.extends = [];

    while ((idx = args.indexOf("--preset")) > -1) {
      configuration.extends.push(
        `plugin:@swissquote/swissquote/${args[idx + 1]}`
      );
      args.splice(idx, 2);
    }
  }

  // Disable `no-var` as this linter can also be run
  // on es5 code, if used with --fix, the result
  // would be broken code or false positives.
  configuration.rules["no-var"] = 0;

  return {
    configuration,
    args
  };
}

function stringifyConfiguration(configuration) {
  return `// This configuration was generated by Crafty
// This file is generated to improve IDE Integration
// You don't need to commit this file, nor need it to run \`crafty build\`

// Fix module resolution
require(${JSON.stringify(require.resolve("./patchModuleResolver"))});

module.exports = ${JSON.stringify(configuration, null, 4)};
`;
}

function toTempFile(configuration) {
  const tmpfile = tmp.fileSync({ postfix: ".js" }).name;

  fs.writeFileSync(tmpfile, stringifyConfiguration(configuration));

  return tmpfile;
}

module.exports = {
  configurationBuilder,
  stringifyConfiguration,
  toTempFile
};
