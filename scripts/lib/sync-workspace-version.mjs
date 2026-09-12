/**
 * Write product identity to root + packages package.json files; optionally refresh lockfile.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { parseProductVersion, formatProductVersion } from "./product-version.mjs";

/**
 * @param {string} path
 */
function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/**
 * @param {string} path
 * @param {unknown} data
 */
function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/**
 * @param {Record<string, string> | undefined} deps
 */
function pinWorkspaceDeps(deps) {
  if (!deps || typeof deps !== "object") return deps;
  const next = { ...deps };
  for (const name of Object.keys(next)) {
    if (name.startsWith("@spec-driven-methodology/")) {
      next[name] = "*";
    }
  }
  return next;
}

/**
 * @param {string} root SDM repo root
 * @param {string} targetVersion
 * @param {{ refreshLock?: boolean, quiet?: boolean }} [options]
 * @returns {string} normalized identity written
 */
export function syncWorkspaceVersions(root, targetVersion, options = {}) {
  const { refreshLock = true, quiet = false } = options;
  const parsed = parseProductVersion(targetVersion);
  const target = formatProductVersion(parsed);

  const rootPkgPath = join(root, "package.json");
  const rootPkg = readJson(rootPkgPath);
  rootPkg.version = target;
  writeJson(rootPkgPath, rootPkg);

  const packagesDir = join(root, "packages");
  for (const name of readdirSync(packagesDir)) {
    const pkgPath = join(packagesDir, name, "package.json");
    if (!existsSync(pkgPath)) continue;
    const pkg = readJson(pkgPath);
    pkg.version = target;
    if (pkg.dependencies) pkg.dependencies = pinWorkspaceDeps(pkg.dependencies);
    if (pkg.devDependencies) {
      pkg.devDependencies = pinWorkspaceDeps(pkg.devDependencies);
    }
    writeJson(pkgPath, pkg);
    if (!quiet) console.log(`synced ${pkg.name || name} → ${target}`);
  }

  if (!quiet) console.log(`root → ${target}`);

  if (refreshLock) {
    const install = spawnSync("npm", ["install", "--package-lock-only"], {
      cwd: root,
      stdio: quiet ? "ignore" : "inherit",
      shell: process.platform === "win32",
    });
    if (install.status !== 0) {
      throw new Error("npm install --package-lock-only failed");
    }
    if (!quiet) console.log("lockfile refreshed");
  }

  return target;
}
