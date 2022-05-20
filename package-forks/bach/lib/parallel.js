var asyncDone = require("async-done");
var nowAndLater = require("now-and-later");

var helpers = require("./helpers");

function iterator(fn, key, cb) {
  return asyncDone(fn, cb);
}

function buildParallel(...allArgs) {
  var args = helpers.verifyArguments(allArgs);

  var extensions = helpers.getExtensions(args[args.length - 1]);

  if (extensions) {
    args = args.slice(0, args.length - 1);
  }

  function parallel(done) {
    nowAndLater.map(args, iterator, extensions, done);
  }

  return parallel;
}

module.exports = buildParallel;
