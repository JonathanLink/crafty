#!/usr/bin/env node

const log = require("@swissquote/crafty-commons/packages/fancy-log");
const loudRejection = require("../packages/loud-rejection");

const cli = require("./cli");
const configuration = require("./configuration");
const getCommands = require("./commands");
const version = require("../package.json").version;

loudRejection();

process.title = "crafty";

log(`Starting Crafty ${version}...`);

let readConfig = true;

if (process.argv.indexOf("--ignore-crafty-config") > -1) {
  process.argv.splice(process.argv.indexOf("--ignore-crafty-config"), 1);
  readConfig = false;
}

// Initialize the configuration
const crafty = configuration.getCrafty(
  configuration.extractPresets(process.argv),
  readConfig ? configuration.getOverrides() : {}
);

// Get all possible commands
const commands = getCommands(crafty);

// Run the user selected command
cli(crafty, commands).then(
  exitCode => {
    // Wait for the stdout buffer to drain.
    process.on("exit", () => process.exit(exitCode));
  },
  error => {
    // Using crafty.error will make sure that it won't
    // show an error that was already shown
    crafty.error(error);

    process.on("exit", () => process.exit(1));
  }
);
