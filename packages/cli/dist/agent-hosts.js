import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SdmError } from "@spec-driven-methodology/core";
import { resolveHostsFromCli } from "./mcp-hosts.js";
const AGENT_HOSTS = [
    { id: "cursor", title: "Cursor (.cursor/skills/)" },
    {
        id: "gigacode",
        title: "GigaCode CLI (~/.gigacode/skills/)",
        experimental: true,
    },
    {
        id: "multitool",
        title: "MultiTool (~/.config/gigatool/skills/)",
        experimental: true,
    },
];
export function listAgentHosts() {
    return AGENT_HOSTS.map((h) => ({ ...h }));
}
/** Skills root directory for a host (contains <skillId>/SKILL.md). */
export function agentSkillsRoot(host, options) {
    if (host === "cursor") {
        const root = resolve(options?.cursorRoot ?? process.cwd());
        return join(root, ".cursor", "skills");
    }
    if (host === "gigacode") {
        const home = options?.gigacodeHome
            ? resolve(options.gigacodeHome)
            : join((options?.homedir ?? homedir)(), ".gigacode");
        return join(home, "skills");
    }
    // multitool
    const home = options?.multitoolHome
        ? resolve(options.multitoolHome)
        : join((options?.homedir ?? homedir)(), ".config", "gigatool");
    return join(home, "skills");
}
/**
 * Resolve SDM `agents/` directory (portable skills source of truth).
 * Order: --agents-root → SDM_HOME/agents → walk from this package to monorepo root.
 */
export function resolveAgentsRoot(explicit) {
    if (explicit?.trim()) {
        const root = resolve(explicit.trim());
        if (!hasPortableSkills(root)) {
            throw new SdmError("AGENTS_NOT_FOUND", `No portable skills (*/SKILL.md) under --agents-root: ${root}`);
        }
        return root;
    }
    const fromEnv = process.env.SDM_HOME?.trim();
    if (fromEnv) {
        const candidate = join(resolve(fromEnv), "agents");
        if (hasPortableSkills(candidate)) {
            return candidate;
        }
    }
    const here = dirname(fileURLToPath(import.meta.url));
    const candidates = [
        join(here, "..", "..", "..", "agents"), // packages/cli/dist → repo root
        join(here, "..", "..", "..", "..", "agents"), // safety if layout differs
    ];
    for (const c of candidates) {
        const root = resolve(c);
        if (hasPortableSkills(root)) {
            return root;
        }
    }
    throw new SdmError("AGENTS_NOT_FOUND", "Could not locate SDM agents/ with SKILL.md. Pass --agents-root or set SDM_HOME.");
}
export function listPortableSkillIds(agentsRoot) {
    if (!existsSync(agentsRoot)) {
        return [];
    }
    return readdirSync(agentsRoot, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .filter((name) => existsSync(join(agentsRoot, name, "SKILL.md")))
        .sort();
}
function hasPortableSkills(agentsRoot) {
    return listPortableSkillIds(agentsRoot).length > 0;
}
export function installAgentSkills(options) {
    if (!options.hosts.length) {
        throw new SdmError("HOSTS_REQUIRED", "Pass --hosts <csv>|all (e.g. cursor,gigacode,multitool)");
    }
    const agentsRoot = resolveAgentsRoot(options.agentsRoot);
    const skillIds = listPortableSkillIds(agentsRoot);
    if (skillIds.length === 0) {
        throw new SdmError("AGENTS_NOT_FOUND", `No portable skills under ${agentsRoot}`);
    }
    const pathOpts = {
        cursorRoot: options.cursorRoot,
        gigacodeHome: options.gigacodeHome,
        multitoolHome: options.multitoolHome,
        homedir: options.homedir,
    };
    const installs = [];
    const skillsRoots = [];
    const force = options.force ?? false;
    const link = options.link ?? false;
    for (const host of options.hosts) {
        const root = agentSkillsRoot(host, pathOpts);
        skillsRoots.push({ host, path: root });
        mkdirSync(root, { recursive: true });
        for (const skillId of skillIds) {
            const src = join(agentsRoot, skillId);
            const dest = join(root, skillId);
            if (existsSync(dest) && !force) {
                installs.push({ host, skillId, path: dest, mode: "skipped" });
                continue;
            }
            if (existsSync(dest) && force) {
                rmSync(dest, { recursive: true, force: true });
            }
            mkdirSync(dirname(dest), { recursive: true });
            if (link) {
                symlinkSync(src, dest, "dir");
                installs.push({ host, skillId, path: dest, mode: "linked" });
            }
            else {
                cpSync(src, dest, { recursive: true });
                installs.push({ host, skillId, path: dest, mode: "copied" });
            }
        }
        // Pointer so hosts see SDM entry without opening the framework repo
        const pointerPath = join(root, "sdm-AGENTS.md");
        const frameworkAgentsMd = join(dirname(agentsRoot), "AGENTS.md");
        if (existsSync(frameworkAgentsMd) && (!existsSync(pointerPath) || force)) {
            const body = readFileSync(frameworkAgentsMd, "utf8");
            writeFileSync(pointerPath, [
                "<!-- Mirrored by `sdm agent install`. Source of truth: SDM repo AGENTS.md -->",
                "",
                body,
            ].join("\n"), "utf8");
        }
    }
    return { agentsRoot, skillIds, installs, skillsRoots };
}
/** Re-export host resolution used by MCP (same ids). */
export { resolveHostsFromCli };
/** Type guard helper for tests / symlink detection. */
export function isSymlink(path) {
    try {
        return lstatSync(path).isSymbolicLink();
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=agent-hosts.js.map