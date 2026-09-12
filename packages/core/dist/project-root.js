import { existsSync, readdirSync, statSync, readFileSync } from "node:fs";
import { basename, dirname, join, parse, resolve } from "node:path";
import { load } from "js-yaml";
import { SdmError } from "./errors.js";
export const PROJECT_MANIFEST = "sdm.yaml";
/**
 * Walk upward from startDir until a directory containing sdm.yaml is found.
 */
export function findProjectRoot(startDir) {
    let current = resolve(startDir);
    const { root } = parse(current);
    while (true) {
        if (existsSync(join(current, PROJECT_MANIFEST))) {
            return current;
        }
        if (current === root) {
            break;
        }
        current = dirname(current);
    }
    throw new SdmError("PROJECT_ROOT_NOT_FOUND", `No SDM methodology project found (missing ${PROJECT_MANIFEST}). Run from a project directory or: sdm init`);
}
/**
 * Resolve (find or locate) a methodology project from a given start path.
 * Returns the project root and a friendly name. Does not throw — returns null
 * when the path is outside a SDM project.
 */
export function locateProject(startDir) {
    try {
        const root = findProjectRoot(startDir);
        const name = readYamlName(root);
        return { root, name };
    }
    catch {
        return null;
    }
}
/**
 * Recursively search for sdm.yaml files under a given workspace directory
 * (one level deep by default). Returns project roots and names.
 */
export function listMethodologyProjects(workspaceDir, maxDepth = 2) {
    const results = [];
    function scan(dir, depth) {
        if (depth > maxDepth)
            return;
        try {
            const entries = readdirSync(dir);
            // If this dir itself is a project, add it
            if (entries.includes(PROJECT_MANIFEST)) {
                const name = readYamlName(dir);
                results.push({ root: dir, name });
                return; // don't descend into a project's subdirs
            }
            if (depth === maxDepth)
                return;
            for (const entry of entries) {
                const full = join(dir, entry);
                try {
                    if (statSync(full).isDirectory() &&
                        !entry.startsWith(".") &&
                        !entry.startsWith("node_modules")) {
                        scan(full, depth + 1);
                    }
                }
                catch {
                    // permission denied, skip
                }
            }
        }
        catch {
            // cannot read, skip
        }
    }
    const resolved = resolve(workspaceDir);
    if (existsSync(resolved)) {
        scan(resolved, 0);
    }
    return results;
}
function readYamlName(dir) {
    try {
        const yamlPath = join(dir, PROJECT_MANIFEST);
        const raw = readFileSync(yamlPath, "utf8");
        const doc = load(raw);
        return doc?.name?.trim() ?? basename(dir);
    }
    catch {
        return basename(dir);
    }
}
//# sourceMappingURL=project-root.js.map