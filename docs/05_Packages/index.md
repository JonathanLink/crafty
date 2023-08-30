Crafty is composed of small packages and can be used separately.

Here is an overview of their features.

[TOC]

## `crafty`

Command runner, this is the package that allows all other packages to run.

```bash
crafty --preset crafty-preset-babel jsLint presets/* --preset recommended --preset node
```

Also automatically reads your `crafty.config.js` (in the current working
directory) and loads those presets as well.

## Runners

### `crafty-runner-webpack`

Use this runner to bundle your code with Webpack.

[Features and options](02_crafty-runner-webpack.md)

### `crafty-runner-gulp`

Use this runner to be able to create Gulp tasks in your projects.

[Features and options](02_crafty-runner-gulp.md)

## Test runners

### `crafty-preset-jest`

This preset will add Jest to the `crafty test` command.

Its usage with the Babel and TypeScript preset allows you to test your
EcmaScript 2015+ and TypeScript code effortlessly.

[Features and options](05_crafty-preset-jest.md)

## Presets

### `crafty-preset-babel`

This preset provides EcmaScript 2015+ support with Babel for Gulp, Webpack, and Jest.

This preset will include `crafty-preset-eslint` and provide ESLint with our linting rules.

[Features and options](05_crafty-preset-babel)

### `crafty-preset-postcss`

Compile your CSS using **PostCSS**, works with **Webpack** and Gulp.

[Features and options](05_crafty-preset-postcss)

### `crafty-preset-typescript`

This preset provides TypeScript support for Gulp, Webpack, and Jest.

This preset will include `crafty-preset-eslint` and provide ESLint with our linting rules.

[Features and options](05_crafty-preset-typescript)

### `crafty-preset-images`

This preset leverages Gulp to compress your SVG/PNG/JPG/GIF files and placing
them in the destination folder.

[Features and options](05_crafty-preset-images.md)

### `crafty-preset-images-simple`

In some cases, you might not have an internet connection on your build machine.
As the tools to compress PNG/JPG/GIF need to be downloaded from GitHub, this
preset will copy the files instead of copying them.

SVG is also compressed with this preset.

It works as a drop-in replacement for `crafty-preset-images`.

[Features and options](05_crafty-preset-images-simple.md)

### `crafty-preset-maven`

If your code is inside a Maven project, this preset overrides the destination to
move your compiled assets to the right directory in `target`

[Features and options](05_crafty-preset-maven.md)

### `crafty-preset-react`

A preset that provides utilities for Jest and Hot Module Replacement in React
projects.

JSX Compilation is handled by the `crafty-preset-babel` already.

[Features and options](05_crafty-preset-react.md)

### `crafty-preset-prettier`

Provides Prettier defaults for other presets

[Features and options](05_crafty-preset-prettier.md)

### `crafty-preset-eslint`

Check your code with ESLint, this preset will provide a standalone `jsLint` command and configure Webpack.

Utilities from this package are leveraged to configure Gulp builds.

[Features and options](05_crafty-preset-eslint)

### `crafty-preset-swc`

This preset provides EcmaScript 2015+ support with [SWC](https://swc.rs/) for Gulp, Webpack, and Jest.

While SWC is able to compile TypeScript, this preset does not offer this feature at the moment.

It also configures ESLint with our linting rules. Both in the runners and as a
separate command.

[Features and options](05_crafty-preset-babel)

## Utility packages

### `babel-preset-swissquote`

A Babel preset that supports EcmaScript 2015+, React and more

[Features and options](10_babel-preset-swissquote.md)

### `eslint-plugin-swissquote`

An ESLint plugin that contains all our recommended options and plugins.

[Features and presets](10_eslint-plugin-swissquote.md)

### `postcss-swissquote-preset`

All PostCSS plugins used in the Crafty styles preset are defined in this
package.

[Features and presets](10_postcss-swissquote-preset.md)

### `stylelint-config-swissquote`

Stylelint linting rules following the Swissquote CSS Guideline. Provides some
custom Stylelint rules.

[Features and presets](10_stylelint-config-swissquote.md)
