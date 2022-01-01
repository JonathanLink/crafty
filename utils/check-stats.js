#!/usr/bin/env node
const path = require("path");
const file = process.argv[2];

const data = require(path.join(process.cwd(), file));

const errors = [];

function recordError(error) {
  errors.push(error);
}

data.modules
  .filter(m => m.name.indexOf("/ncc/@@notfound") > -1)
  .map(m => `Module "${m.name.split("?")[1]}" requested by "${m.issuerName}" was not found.`)
  .map(recordError);

data.modules
  .filter((m) => m.name.indexOf("/packages/") > -1)
  .filter((m) => m.name.indexOf("external ") !== 0)
  .map((m) => `Module "${m.name}" requested by "${m.issuerName}" should be external.`)
  .map(recordError);

if (errors.length > 0) {
  console.log(file);
  console.log("=".repeat(file.length));
  errors.forEach((m) => {
    console.log(m);
  });

  console.log();
}
