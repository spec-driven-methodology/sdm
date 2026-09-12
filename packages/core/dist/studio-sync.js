import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SdmError } from "./errors.js";
import { PROJECT_MANIFEST } from "./project-root.js";
function methodologyTemplatesRoot() {
    const here = dirname(fileURLToPath(import.meta.url));
    return join(here, "..", "templates", "methodology");
}
function copyTreeDeep(src, dest, created, skipped, force) {
    mkdirSync(dest, { recursive: true });
    for (const entry of readdirSync(src, { withFileTypes: true })) {
        const from = join(src, entry.name);
        const to = join(dest, entry.name);
        if (entry.isDirectory()) {
            copyTreeDeep(from, to, created, skipped, force);
        }
        else if (existsSync(to) && !force) {
            skipped.push(to);
        }
        else {
            mkdirSync(dirname(to), { recursive: true });
            cpSync(from, to);
            created.push(to);
        }
    }
}
/**
 * Copy shipped Methodology Studio assets into `<project>/studio/`.
 * Does not modify methodology YAML, player/, or other project roots.
 */
export function syncStudioAssets(options) {
    const projectRoot = options.projectRoot;
    const force = options.force ?? false;
    if (!existsSync(join(projectRoot, PROJECT_MANIFEST))) {
        throw new SdmError("NOT_A_PROJECT", `Not a SDM methodology project (missing ${PROJECT_MANIFEST}): ${projectRoot}`);
    }
    const studioSrc = join(methodologyTemplatesRoot(), "studio");
    if (!existsSync(studioSrc)) {
        throw new SdmError("STUDIO_TEMPLATE_MISSING", `Studio template not found at ${studioSrc}`);
    }
    const studioDir = join(projectRoot, "studio");
    const created = [];
    const skipped = [];
    copyTreeDeep(studioSrc, studioDir, created, skipped, force);
    return { projectRoot, studioDir, created, skipped, force };
}
/** Used by init to seed studio/ without requiring a prior project check. */
export function copyStudioTemplateInto(targetDir, created, skipped, force) {
    const studioSrc = join(methodologyTemplatesRoot(), "studio");
    if (!existsSync(studioSrc)) {
        return;
    }
    copyTreeDeep(studioSrc, join(targetDir, "studio"), created, skipped, force);
}
//# sourceMappingURL=studio-sync.js.map