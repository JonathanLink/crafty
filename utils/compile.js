const ncc = require("@vercel/ncc");
const fs = require("fs");
const { existsSync } = require("fs");
const path = require("path");

module.exports = async function compile(input, output, options = {}) {
  await ncc(path.join(process.cwd(), input), {
    ...options,
  }).then(async ({ code, map }) => {
    const dirname = path.dirname(output);

    if (!existsSync(dirname)) {
      await fs.promises.mkdir(dirname, { recursive: true });
    }

    await fs.promises.writeFile(output, code);

    if (map) {
      await fs.promises.writeFile(`${output}.map`, map);
    }
  });
};
