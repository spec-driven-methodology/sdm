#!/usr/bin/env node
/**
 * Bump SDM product identity (root SSOT + workspace sync).
 *
 * Usage:
 *   node scripts/bump-version.mjs show|build|prerelease|major|minor|patch|alpha|beta|rc|stable|auto
 *   npm run version
 *   npm run version:build
 *
 * `auto` — used by `npm run build`: increment build when prerelease; no-op when
 * stable or SDM_NO_BUMP_BUILD=1. Uses --no-lock sync for speed.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  bumpParsedVersion,
  formatProductVersion,
  parseProductVersion,
} from "./lib/product-version.mjs";
import { syncWorkspaceVersions } from "./lib/sync-workspace-version.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const MODES = new Set([
  "show",
  "build",
  "prerelease",
  "major",
  "minor",
  "patch",
  "alpha",
  "beta",
  "rc",
  "stable",
  "auto",
]);

const mode = (process.argv[2] || "show").trim();
if (!MODES.has(mode)) {
  console.error(
    `Usage: bump-version.mjs <${[...MODES].join("|")}>`,
  );
  process.exit(1);
}

function readRootVersion() {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  return parseProductVersion(pkg.version || "");
}

try {
  const current = readRootVersion();
  const currentStr = formatProductVersion(current);

  if (mode === "show") {
    console.log(currentStr);
    process.exit(0);
  }

  if (mode === "auto") {
    if (process.env.SDM_NO_BUMP_BUILD === "1") {
      console.log(`version:auto skip (SDM_NO_BUMP_BUILD=1) — ${currentStr}`);
      process.exit(0);
    }
    if (!current.stage || current.build == null) {
      console.log(`version:auto skip (stable) — ${currentStr}`);
      process.exit(0);
    }
    const next = bumpParsedVersion(current, "build");
    const nextStr = formatProductVersion(next);
    syncWorkspaceVersions(root, nextStr, { refreshLock: false });
    console.log(`version:auto ${currentStr} → ${nextStr}`);
    process.exit(0);
  }

  const next = bumpParsedVersion(current, mode);
  const nextStr = formatProductVersion(next);
  const refreshLock = mode !== "build" && mode !== "prerelease";
  syncWorkspaceVersions(root, nextStr, { refreshLock });
  console.log(`${currentStr} → ${nextStr}`);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
