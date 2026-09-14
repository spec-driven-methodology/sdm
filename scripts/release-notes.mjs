#!/usr/bin/env node
/**
 * Extract the CHANGELOG section for a given version. Usage:
 *   node scripts/release-notes.mjs <version>
 *
 * Outputs the section body (lines between ## headers) to stdout.
 * Exits with code 1 if the section is not found or empty.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = process.argv[2];
if (!version) {
  console.error("Usage: release-notes.mjs <version>");
  process.exit(1);
}

const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");

// Match ## [<version>] ... up to the next ## or end-of-file
const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const rx = new RegExp(
  `##\\s*\\[${escaped}\\].*?(?=\\n##\\s*\\[|\\n?\\Z)`,
  "s",
);
const m = changelog.match(rx);
if (!m) {
  console.error(`Section for version "${version}" not found in CHANGELOG.md`);
  process.exit(1);
}

const body = m[0].trim();
if (!body) {
  console.error(`Section for version "${version}" is empty`);
  process.exit(1);
}

console.log(body);