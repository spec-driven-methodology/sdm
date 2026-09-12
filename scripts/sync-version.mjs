#!/usr/bin/env node
/**
 * Sync product identity from root package.json (or argv) to all workspace packages.
 * Sets internal @spec-driven-methodology/* dependencies to "*" and optionally refreshes the lockfile.
 *
 * Usage:
 *   node scripts/sync-version.mjs [X.Y.Z[-stage.N]] [--no-lock]
 *   npm run version:sync -- [X.Y.Z[-stage.N]] [--no-lock]
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseProductVersion } from "./lib/product-version.mjs";
import { syncWorkspaceVersions } from "./lib/sync-workspace-version.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2).filter((a) => a !== "--");
const noLock = args.includes("--no-lock");
const versionArg = args.find((a) => !a.startsWith("--"));

const rootPkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const target = (versionArg || rootPkg.version || "").trim();

try {
  parseProductVersion(target);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}

try {
  syncWorkspaceVersions(root, target, { refreshLock: !noLock });
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
