function babelLoader() {
  return require("babel-loader");
}

function gulpBabel() {
  return require("gulp-babel");
}

function gulpTypescript() {
  return require("gulp-typescript");
}

function rollupPluginBabel() {
  return require("@rollup/plugin-babel");
}

function rollupPluginTypescript() {
  return require("rollup-plugin-typescript2");
}

function tsJest() {
  return require("ts-jest");
}

function tsLoader() {
  return require("ts-loader");
}

module.exports = {
  babelLoader,
  gulpBabel,
  gulpTypescript,
  rollupPluginBabel,
  rollupPluginTypescript,
  tsJest,
  tsLoader
};
