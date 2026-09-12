#!/usr/bin/env node
/**
 * Fail if workspace package versions drift from root, root identity is invalid,
 * or CLI/MCP src hardcodes a product .version("x.y.z") literal.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseProductVersion } from "./lib/product-version.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const rootPkg = readJson(join(root, "package.json"));
const expected = rootPkg.version;
if (!expected) {
  errors.push("root package.json has no version");
} else {
  try {
    parseProductVersion(expected);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : String(e));
  }
}

const packagesDir = join(root, "packages");
for (const name of readdirSync(packagesDir)) {
  const pkgPath = join(packagesDir, name, "package.json");
  if (!existsSync(pkgPath)) continue;
  const pkg = readJson(pkgPath);
  if (pkg.version !== expected) {
    errors.push(`${pkg.name || name}: version ${pkg.version} !== root ${expected}`);
  }
  for (const [dep, ver] of Object.entries(pkg.dependencies || {})) {
    if (dep.startsWith("@spec-driven-methodology/") && ver !== "*") {
      errors.push(`${pkg.name}: dependency ${dep}@${ver} must be "*" (got ${ver})`);
    }
  }
}

const hardcodedRe = /\.version\s*\(\s*["'`](\d+\.\d+\.\d+(?:-[\w.]+)?)["'`]\s*\)/;
for (const rel of ["packages/cli/src", "packages/mcp/src"]) {
  const dir = join(root, rel);
  if (!existsSync(dir)) continue;
  const walk = (d) => {
    for (const ent of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith(".ts")) {
        const text = readFileSync(p, "utf8");
        const m = text.match(hardcodedRe);
        if (m) {
          errors.push(`${p}: hardcoded .version("${m[1]}") — use getProductVersion()`);
        }
      }
    }
  };
  walk(dir);
}

if (errors.length) {
  console.error("version:check failed:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`version:check ok (${expected})`);
