"use strict";

const fs = require("fs");
const path = require("path");
const packageJson = require("../../package.json");

const expectedExports = {
  ".": "./lib/index.js",
  "./url": "./lib/url/index.js",
  "./session": "./lib/session/index.js",
  "./record": "./lib/record/index.js",
  "./record/fetch": "./lib/record/fetch.js",
  "./record/win": "./lib/record/win.js",
  "./record/actions": "./lib/record/actions.js",
  "./record/simulate": "./lib/record/simulate.js",
  "./stats": "./lib/stats/index.js",
  "./core": "./lib/core/index.js",
  "./core/config": "./lib/core/config/index.js",
  "./core/tiles": "./lib/core/tiles/index.js",
  "./node": "./lib/node/index.js",
  "./node/analyze": "./lib/node/analyze.js"
};

const expectedDeclarationFiles = [
  "index.d.ts",
  "url.d.ts",
  "session.d.ts",
  "record.d.ts",
  "record/fetch.d.ts",
  "record/win.d.ts",
  "record/actions.d.ts",
  "record/simulate.d.ts",
  "stats.d.ts",
  "core.d.ts",
  "core/config.d.ts",
  "core/tiles.d.ts",
  "node.d.ts",
  "node/analyze.d.ts",
  "types/shared.d.ts"
];

describe("package metadata", () => {
  it("declares stable public subpath exports", () => {
    expect(packageJson.exports).toBeDefined();

    for (const [subpath, expectedRequire] of Object.entries(expectedExports)) {
      expect(packageJson.exports[subpath]).toEqual(
        expect.objectContaining({
          require: expectedRequire
        })
      );
    }
  });

  it("ships declaration files for stable public entries", () => {
    for (const relativeFile of expectedDeclarationFiles) {
      const declarationPath = path.resolve(__dirname, "..", "..", relativeFile);
      expect(fs.existsSync(declarationPath)).toBe(true);
    }
  });
});
