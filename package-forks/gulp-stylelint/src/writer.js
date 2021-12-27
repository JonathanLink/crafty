const fs = require("fs");
const path = require("path");
const stripAnsi = require("strip-ansi");

/**
 * Creates the output folder and writes formatted text to a file.
 * @param {String} text - Text to write (may be color-coded).
 * @param {String} dest - Destination path relative to destRoot.
 * @param {String} [destRoot] - Destination root folder, defaults to cwd.
 * @return {Promise} Resolved when folder is created and file is written.
 */
module.exports = async function writer(text, dest, destRoot = process.cwd()) {
  const fullpath = path.resolve(destRoot, dest);

  await fs.promises.mkdir(path.dirname(fullpath), { recursive: true });

  return fs.promises.writeFile(fullpath, stripAnsi(text));
};
