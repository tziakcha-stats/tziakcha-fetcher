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
  "types/index.d.ts",
  "types/url.d.ts",
  "types/session.d.ts",
  "types/record/index.d.ts",
  "types/record/fetch.d.ts",
  "types/record/win.d.ts",
  "types/record/actions.d.ts",
  "types/record/simulate.d.ts",
  "types/stats.d.ts",
  "types/core/index.d.ts",
  "types/core/config.d.ts",
  "types/core/tiles.d.ts",
  "types/node/index.d.ts",
  "types/node/analyze.d.ts",
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
