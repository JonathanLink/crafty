/* global jest, describe, it, expect */

const configuration = require("@swissquote/crafty/src/configuration");
const getCommands = require("@swissquote/crafty/src/commands/index");
const testUtils = require("../utils");

// Add a high timeout because of https://github.com/facebook/jest/issues/8942
// Tests would be unreliable if they timeout >_<
jest.setTimeout(30000);

const getCrafty = configuration.getCrafty;

it("Loads crafty-preset-swc and does not register gulp tasks", () => {
  const crafty = getCrafty(["@swissquote/crafty-preset-swc"], {});

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );

  expect(loadedPresets).toContain("@swissquote/crafty-preset-swc");

  const commands = getCommands(crafty);
  expect(Object.keys(commands)).toContain("jsLint");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([]);
});

it("Loads crafty-preset-swc, crafty-runner-gulp and registers gulp task", () => {
  const config = { js: { myBundle: { source: "css/style.scss" } } };
  const crafty = getCrafty(
    ["@swissquote/crafty-preset-swc", "@swissquote/crafty-runner-gulp"],
    config
  );

  const loadedPresets = crafty.config.loadedPresets.map(
    preset => preset.presetName
  );
  expect(loadedPresets).toContain("@swissquote/crafty-preset-swc");
  expect(loadedPresets).toContain("@swissquote/crafty-runner-gulp");

  const commands = getCommands(crafty);
  expect(Object.keys(commands)).toContain("jsLint");

  crafty.createTasks();
  expect(Object.keys(crafty.undertaker._registry.tasks())).toEqual([
    "js_myBundle",
    "js",
    "default"
  ]);
});

it("Compiles JavaScript", async () => {
  const cwd = await testUtils.getCleanFixtures(
    "crafty-preset-swc-gulp/compiles"
  );

  const result = await testUtils.run(["run", "default"], cwd);

  expect(result.status).toBe(0);
  expect(result).toMatchSnapshot();

  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js.map")).toBeFalsy();

  expect(testUtils.exists(cwd, "dist/js/script.js")).toBeTruthy();
  expect(testUtils.exists(cwd, "dist/js/script.js.map")).toBeTruthy();

  expect(testUtils.exists(cwd, "dist/js/otherfile.js")).toBeTruthy();
  expect(testUtils.exists(cwd, "dist/js/otherfile.js.map")).toBeTruthy();

  expect(testUtils.readForSnapshot(cwd, "dist/js/script.js")).toMatchSnapshot();
  expect(
    testUtils.readForSnapshot(cwd, "dist/js/otherfile.js")
  ).toMatchSnapshot();
});

it("Compiles JavaScript, keeps runtime external", async () => {
  const cwd = await testUtils.getCleanFixtures(
    "crafty-preset-swc-gulp/compiles-import-runtime"
  );

  const result = await testUtils.run(["run", "default"], cwd);

  expect(result.status).toBe(0);
  expect(result).toMatchSnapshot();

  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js.map")).toBeFalsy();

  expect(testUtils.exists(cwd, "dist/js/script.js")).toBeTruthy();
  expect(testUtils.exists(cwd, "dist/js/script.js.map")).toBeTruthy();

  expect(testUtils.exists(cwd, "dist/js/otherfile.js")).toBeTruthy();
  expect(testUtils.exists(cwd, "dist/js/otherfile.js.map")).toBeTruthy();

  expect(testUtils.readForSnapshot(cwd, "dist/js/script.js")).toMatchSnapshot();
  expect(
    testUtils.readForSnapshot(cwd, "dist/js/otherfile.js")
  ).toMatchSnapshot();
});

it("Compiles JavaScript, new features transpiled", async () => {
  const cwd = await testUtils.getCleanFixtures(
    "crafty-preset-swc-gulp/compiles-new-features"
  );

  const result = await testUtils.run(["run", "default"], cwd);

  expect(result.status).toBe(0);
  expect(result).toMatchSnapshot();

  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js.map")).toBeFalsy();

  expect(testUtils.exists(cwd, "dist/js/script.js")).toBeTruthy();
  expect(testUtils.exists(cwd, "dist/js/script.js.map")).toBeTruthy();

  expect(testUtils.exists(cwd, "dist/js/otherfile.js")).toBeTruthy();
  expect(testUtils.exists(cwd, "dist/js/otherfile.js.map")).toBeTruthy();

  expect(testUtils.readForSnapshot(cwd, "dist/js/script.js")).toMatchSnapshot();
  expect(
    testUtils.readForSnapshot(cwd, "dist/js/otherfile.js")
  ).toMatchSnapshot();
});

it("Fails gracefully on broken markup", async () => {
  const cwd = await testUtils.getCleanFixtures("crafty-preset-swc-gulp/fails");

  const result = await testUtils.run(["run", "default"], cwd);

  expect(result.status).toBe(1);
  expect(result).toMatchSnapshot();

  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js.map")).toBeFalsy();
});

it("Compiles JavaScript and concatenates", async () => {
  const cwd = await testUtils.getCleanFixtures(
    "crafty-preset-swc-gulp/concatenates"
  );

  const result = await testUtils.run(["run", "default"], cwd);

  expect(result.status).toBe(0);
  expect(result).toMatchSnapshot();

  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js")).toBeTruthy();
  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js.map")).toBeTruthy();

  expect(testUtils.exists(cwd, "dist/js/script.js")).toBeFalsy();
  expect(testUtils.exists(cwd, "dist/js/script.js.map")).toBeFalsy();

  expect(testUtils.exists(cwd, "dist/js/otherfile.js")).toBeFalsy();
  expect(testUtils.exists(cwd, "dist/js/otherfile.js.map")).toBeFalsy();

  expect(
    testUtils.readForSnapshot(cwd, "dist/js/myBundle.min.js")
  ).toMatchSnapshot();
});

it("Lints JavaScript", async () => {
  const cwd = await testUtils.getCleanFixtures(
    "crafty-preset-swc-gulp/lints-es5"
  );

  const result = await testUtils.run(["run", "default"], cwd);

  expect(result.status).toBe(1);
  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js.map")).toBeFalsy();
});

it("Lints JavaScript, doesn't fail in development", async () => {
  const cwd = await testUtils.getCleanFixtures(
    "crafty-preset-swc-gulp/lints-es5-dev"
  );

  const result = await testUtils.run(["run", "default"], cwd);

  expect(result.status).toBe(0);
  expect(result).toMatchSnapshot();

  // Files aren't generated on failed lint
  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js")).toBeFalsy();
  expect(testUtils.exists(cwd, "dist/js/myBundle.min.js.map")).toBeFalsy();
});
