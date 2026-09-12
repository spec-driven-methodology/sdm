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
 * Copy shipped export-test player assets into `<project>/player/`.
 * Does not modify methodology YAML or other project roots.
 */
export function syncPlayerAssets(options) {
    const projectRoot = options.projectRoot;
    const force = options.force ?? false;
    if (!existsSync(join(projectRoot, PROJECT_MANIFEST))) {
        throw new SdmError("NOT_A_PROJECT", `Not a SDM methodology project (missing ${PROJECT_MANIFEST}): ${projectRoot}`);
    }
    const playerSrc = join(methodologyTemplatesRoot(), "player");
    if (!existsSync(playerSrc)) {
        throw new SdmError("PLAYER_TEMPLATE_MISSING", `Player template not found at ${playerSrc}`);
    }
    const playerDir = join(projectRoot, "player");
    const created = [];
    const skipped = [];
    copyTreeDeep(playerSrc, playerDir, created, skipped, force);
    return { projectRoot, playerDir, created, skipped, force };
}
/** Used by init to seed player/ without requiring a prior project check. */
export function copyPlayerTemplateInto(targetDir, created, skipped, force) {
    const playerSrc = join(methodologyTemplatesRoot(), "player");
    if (!existsSync(playerSrc)) {
        return;
    }
    copyTreeDeep(playerSrc, join(targetDir, "player"), created, skipped, force);
}
//# sourceMappingURL=player-sync.js.map