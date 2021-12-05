module.exports = [
  {
    name: "index",
    externals: {
        glob: "@swissquote/crafty-commons/packages/glob",
        "plugin-error" : "@swissquote/crafty-commons-gulp/packages/plugin-error",
        "@swissquote/crafty-commons-gulp/packages/gulp-newer" : "@swissquote/crafty-commons-gulp/packages/gulp-newer",
        "@swissquote/crafty-commons-gulp/packages/plugin-error": "@swissquote/crafty-commons-gulp/packages/plugin-error",
        "@swissquote/crafty/packages/ansi-colors" : "@swissquote/crafty/packages/ansi-colors",
        "fsevents" : "fsevents", // it's an optional dependency that can only be installed on macOS. Leave that to npm and friends,
        "url": "../../src/url",

        // "readable-stream" is a drop-in replacement of "stream"
        // But its current version is big and outdated
        "readable-stream": "stream",
    }
  },
];
