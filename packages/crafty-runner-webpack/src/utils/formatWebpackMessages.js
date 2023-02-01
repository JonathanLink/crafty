/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// WARNING: this code is untranspiled and is used in browser too.
// Please make sure any changes are in ES5 or contribute a Babel compile step.

// Some custom utilities to prettify Webpack output.
// This is quite hacky and hopefully won't be needed when Webpack fixes this.
// https://github.com/webpack/webpack/issues/2878

const colors = require("@swissquote/crafty-commons/packages/ansi-colors");

const friendlySyntaxErrorLabel = "Syntax error:";

function isLikelyASyntaxError(message) {
  return message.indexOf(friendlySyntaxErrorLabel) !== -1;
}

// Cleans up webpack error messages.
// eslint-disable-next-line no-unused-vars
function formatMessage(originalMessage, isError) {
  let lines = (originalMessage.message || originalMessage).split("\n");

  // Errors generated by SWC require special treatment
  // As we don't know exactly what it could cause to other messages
  // it's safer to make sure we are working with an SWC error
  let isSWC = false;

  // Strip Webpack-added headers off errors/warnings
  // https://github.com/webpack/webpack/blob/master/lib/ModuleError.js
  lines = lines.filter(line => {
    const isModuleLine = /Module [A-z ]+\(from/.test(line);

    // This line may contain the name of the loader, we want to know if the loader is SWC
    // Module build failed (from ../../../../../node_modules/swc-loader/src/index.js)
    if (isModuleLine && line.indexOf("swc") > -1) {
      isSWC = true;
    }

    return !isModuleLine;
  });

  // Transform parsing error into syntax error
  lines = lines.map(line => {
    const parsingError = /Line (\d+):(?:(\d+):)?\s*Parsing error: (.+)$/.exec(
      line
    );
    if (!parsingError) {
      return line;
    }
    const [, errorLine, errorColumn, errorMessage] = parsingError;
    return `${friendlySyntaxErrorLabel} ${errorMessage} (${errorLine}:${errorColumn})`;
  });

  let message = lines.join("\n");

  if (isSWC) {
    const filenameRegex = /Real\("(.*?)"\)/;
    const filenameInMessage = filenameRegex.exec(message);
    const filename = filenameInMessage
      ? filenameInMessage[1]
      : originalMessage.moduleIdentifier.substring(
          originalMessage.moduleIdentifier.lastIndexOf("!") + 1
        );

    // SWC adds a weird "Caused by" at the end that's very verbose and not very helpful
    message = `${filename}: ${message
      .replace(/\n+Caused by:\n(?: {4}Syntax Error$)+/gm, "")
      .replace(/^(Error: )+/i, "")}`;
  }

  // Smoosh syntax errors (commonly found in CSS)
  message = message.replace(
    /SyntaxError\s+\((\d+):(\d+)\)\s*(.+?)\n/g,
    `${friendlySyntaxErrorLabel} $3 ($1:$2)\n`
  );
  // Remove columns from ESLint formatter output (we added these for more
  // accurate syntax errors)
  message = message.replace(/Line (\d+):\d+:/g, "Line $1:");
  // Clean up export errors
  message = message.replace(
    /^.*export '(.+?)' was not found in '(.+?)'.*$/gm,
    "Attempted import error: '$1' is not exported from '$2'."
  );
  message = message.replace(
    /^.*export 'default' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
    "Attempted import error: '$2' does not contain a default export (imported as '$1')."
  );
  message = message.replace(
    /^.*export '(.+?)' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
    "Attempted import error: '$1' is not exported from '$3' (imported as '$2')."
  );
  lines = message.split("\n");

  // Remove leading newline
  if (lines.length > 2 && lines[1].trim() === "") {
    lines.splice(1, 1);
  }
  // Clean up file name
  lines[0] = lines[0].replace(/^(.*) \d+:\d+-\d+$/, "$1");

  lines = lines.filter(line => {
    // Webpack adds a list of entry points to warning messages:
    //  @ ./src/index.js
    //  @ multi react-scripts/~/react-dev-utils/webpackHotDevClient.js ...
    // It is misleading (and unrelated to the warnings) so we clean it up.
    // It is only useful for syntax errors but we have beautiful frames for them.
    return line.indexOf(" @ ") !== 0;
  });

  // Cleans up verbose "module not found" messages for files and packages.
  if (lines[1] && lines[1].indexOf("Module not found: ") === 0) {
    lines = [
      lines[0],
      lines[1]
        .replace("Error: ", "")
        .replace("Module not found: Cannot find file:", "Cannot find file:")
    ];
  }

  lines[0] = colors.inverse(lines[0]);

  message = lines.join("\n");
  // Internal stacks are generally useless so we strip them... with the
  // exception of stacks containing `webpack:` because they're normally
  // from user code generated by Webpack. For more information see
  // https://github.com/facebook/create-react-app/pull/1050
  message = message.replace(
    /^\s*at\s((?!webpack:).)*:\d+:\d+[\s)]*(\n|$)/gm,
    ""
  ); // at ... ...:x:y
  message = message.replace(/^\s*at\s<anonymous>(\n|$)/gm, ""); // at <anonymous>
  lines = message.split("\n");

  // Remove duplicated newlines
  lines = lines.filter(
    (line, index, arr) =>
      index === 0 || line.trim() !== "" || line.trim() !== arr[index - 1].trim()
  );

  // Reassemble the message
  message = lines.join("\n");
  return message.trim();
}

function formatWebpackMessages(json) {
  const formattedErrors = json.errors.map(message =>
    formatMessage(message, true)
  );
  const formattedWarnings = json.warnings.map(message =>
    formatMessage(message, false)
  );
  const result = {
    errors: formattedErrors,
    warnings: formattedWarnings
  };
  if (result.errors.some(isLikelyASyntaxError)) {
    // If there are any syntax errors, show just them.
    // This prevents a confusing ESLint parsing error
    // preceding a much more useful Babel syntax error.
    result.errors = result.errors.filter(isLikelyASyntaxError);
  }
  return result;
}

module.exports = formatWebpackMessages;
