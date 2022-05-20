const { existsSync } = require("fs");
const { readdir, writeFile } = require("fs/promises");
const path = require("path");

const rootVersion = require("../package.json").version;

const hasOwnProperty = Object.prototype.hasOwnProperty;

const scripts = {
  lint:
    "node ../../packages/crafty-preset-eslint/src/commands/jsLint.js --preset recommended --preset node '*.js'",
  test: "ava",
  "test:ci": "c8 --clean --reporter=text --reporter=lcov --reporter=html --include=index.js ava"
};

async function main() {
  const dirs = await readdir(__dirname);

  for (const dir of dirs) {
    if (dir === "lint.js") {
      continue;
    }

    const warnings = [];

      const file = path.join(__dirname, dir, "package.json");

      if (existsSync(file)) {
        const pkg = require(file);

        // version check
        if (pkg.version !== rootVersion) {
          warnings.push(`Version must be set to ${rootVersion}`);
          pkg.version = rootVersion;
        }

        // name check
        if (pkg.name.indexOf("@swissquote/") === -1) {
          warnings.push("Name is missing @swissquote/");
          pkg.name = `@swissquote/${pkg.name}`;
        }

        // not private
        if (!hasOwnProperty.call(pkg, "private") || pkg.private !== true) {
          warnings.push("Package is not private");
          pkg.private = true;
        }

        // license
        if (!hasOwnProperty.call(pkg, "license") && !hasOwnProperty.call(pkg, "licenses")) {
          warnings.push("Missing a license");
        }

        // author
        if (!hasOwnProperty.call(pkg, "author")) {
          warnings.push("Missing an author");
        }

        if (!hasOwnProperty.call(pkg, "description")) {
          warnings.push("Missing an description");
        }

        pkg.scripts = scripts;
        /*if (!hasOwnProperty.call(pkg, "scripts")) {
          warnings.push("Missing 'scripts'");
          pkg.scripts = scripts;
        } else {
          if (pkg.scripts.lint != scripts.lint) {
            pkg.scripts.lint = scripts.lint;
          }

          if (pkg.scripts.test != scripts.test) {
            pkg.scripts.test = scripts.test;
          }

          if (pkg.scripts["test:watch"] != scripts["test:watch"]) {
            pkg.scripts["test:watch"] = scripts["test:watch"];
          }

          if (pkg.scripts["test:ci"] != scripts["test:ci"]) {
            pkg.scripts["test:ci"] = scripts["test:ci"];
          }
        }*/

        pkg.engines = {
          node: ">=12",
        };

        /*pkg.devDependencies = {
          ava: "4.0.0",
          c8: "7.11.0",
          postcss: "8.4.5",
        };

        pkg.peerDependencies = {
          postcss: "^8.0.0",
        };*/

        if (warnings.length) {
          await writeFile(file, JSON.stringify(pkg, null, 2));
        }
      } else {
        warnings.push("Missing a package.json");
      }

      if (warnings.length) {
        console.log("=>", dir);
        warnings.forEach((warning) => {
          console.log("-", warning);
        });
        console.log("");
      }
  }
}

main().catch((e) => {
  console.error("Failed", e);
});
