#!/usr/bin/env node
/**
 * Copy publish assets (ABOUT.md, AGENTS.md, agents/) from the repo root into
 * packages/core/ so the npm tarball ships them. SSOT stays at the repo root;
 * the copies are gitignored and regenerated on every `npm pack` / `npm publish`.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const coreDir = join(root, "packages", "core");

const assets = ["ABOUT.md", "AGENTS.md", "agents"];

for (const name of assets) {
  const src = join(root, name);
  const dest = join(coreDir, name);
  if (!existsSync(src)) {
    console.error(`copy-publish-assets: missing ${src}`);
    process.exit(1);
  }
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`copy-publish-assets: ${src} -> ${dest}`);
}

console.log("copy-publish-assets: done");