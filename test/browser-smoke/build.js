"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

const { build } = require("esbuild");

const blockedBuiltins = new Set(["fs", "path", "child_process", "zlib"]);
const packageRoot = path.resolve(__dirname, "../..");
const packageName = require(path.join(packageRoot, "package.json")).name;
const entries = [
  {
    file: "entry-root.js",
    specifier: packageName
  },
  {
    file: "entry-fetch.js",
    specifier: `${packageName}/record/fetch`
  },
  {
    file: "entry-win.js",
    specifier: `${packageName}/record/win`
  },
  {
    file: "entry-url.js",
    specifier: `${packageName}/url`
  }
];

function nodeBuiltinLeakPlugin() {
  return {
    name: "node-builtin-leak",
    setup(buildContext) {
      buildContext.onResolve({ filter: /.*/ }, args => {
        if (blockedBuiltins.has(args.path)) {
          return {
            errors: [
              {
                text: `Node builtin leaked into browser bundle: ${args.path}`,
                location: {
                  file: args.importer || "<entry>"
                }
              }
            ]
          };
        }

        return null;
      });
    }
  };
}

function packageBrowserMapPlugin() {
  const recordIndexPath = path.join(packageRoot, "lib/record/index.js");
  const fetchBrowserPath = path.join(
    packageRoot,
    "lib/record/fetch-browser.js"
  );

  return {
    name: "package-browser-map",
    setup(buildContext) {
      buildContext.onResolve({ filter: /.*/ }, args => {
        if (args.path === `${packageName}/record/fetch`) {
          return {
            path: fetchBrowserPath
          };
        }

        if (
          args.path === "./fetch" &&
          path.resolve(args.importer) === recordIndexPath
        ) {
          return {
            path: fetchBrowserPath
          };
        }

        return null;
      });
    }
  };
}

function createConsumerEntry(tempDir, entry) {
  const entryPath = path.join(tempDir, entry.file);
  const contents = `"use strict";\n\nmodule.exports = require(${JSON.stringify(
    entry.specifier
  )});\n`;
  fs.writeFileSync(entryPath, contents);
  return entryPath;
}

function linkPackageIntoTempDir(tempDir) {
  const nodeModulesDir = path.join(tempDir, "node_modules");
  const packageLinkPath = path.join(nodeModulesDir, packageName);
  fs.mkdirSync(nodeModulesDir, { recursive: true });
  fs.symlinkSync(packageRoot, packageLinkPath, "dir");
}

async function bundleEntry(tempDir, entryPath) {
  await build({
    absWorkingDir: tempDir,
    entryPoints: [entryPath],
    bundle: true,
    format: "cjs",
    platform: "browser",
    write: false,
    external: Array.from(blockedBuiltins),
    plugins: [packageBrowserMapPlugin(), nodeBuiltinLeakPlugin()]
  });
}

async function main() {
  const tempDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "tziakcha-browser-smoke-")
  );
  linkPackageIntoTempDir(tempDir);

  await Promise.all(
    entries.map(async entry => {
      const entryPath = createConsumerEntry(tempDir, entry);
      await bundleEntry(tempDir, entryPath);
      process.stdout.write(`bundled ${entry.file}\n`);
    })
  );
}

main().catch(error => {
  process.stderr.write(`${error && error.message ? error.message : error}\n`);
  process.exitCode = 1;
});
