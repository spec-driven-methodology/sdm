import { existsSync, mkdirSync, writeFileSync, cpSync, readdirSync, } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { copyPlayerTemplateInto } from "./player-sync.js";
import { writeYamlFile } from "./yaml.js";
function templatesRoot() {
    const here = dirname(fileURLToPath(import.meta.url));
    return join(here, "..", "templates", "methodology");
}
function ensureDir(path, created) {
    if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
        created.push(`${path}/`);
    }
}
function writeIfAbsent(path, content, created, skipped, force) {
    if (existsSync(path) && !force) {
        skipped.push(path);
        return;
    }
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, "utf8");
    created.push(path);
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
 * Scaffold a SDM methodology project (user-facing knowledge base).
 * Mirrors: install CLI → `sdm init` in an empty directory.
 */
export function initMethodologyProject(options) {
    const baseDir = options.targetDir;
    const subdir = options.subdir?.trim();
    const targetDir = subdir ? join(baseDir, subdir) : baseDir;
    const name = options.name ?? "my-methodology";
    const force = options.force ?? false;
    const created = [];
    const skipped = [];
    const dirs = [
        "ontology",
        "ontology/categories",
        "library/questions",
        "library/terms",
        "certifications/profiles",
        "certifications/levels",
        "certifications/teams",
        ".sdm/cache",
        ".sdm/index",
        ".sdm/logs",
        ".sdm/reports/quality",
    ];
    for (const rel of dirs) {
        ensureDir(join(targetDir, rel), created);
    }
    writeIfAbsent(join(targetDir, "sdm.yaml"), [
        `version: "0.1"`,
        `name: ${name}`,
        `search:`,
        `  # Semantic search over skills/questions (optional).`,
        `  # none — disabled (default for PoC)`,
        `  # lancedb — local vector index under .sdm/index`,
        `  provider: none`,
        `  embedding_model: Xenova/all-MiniLM-L6-v2`,
        `# logging:`,
        `#   enabled: true`,
        `#   maxBytes: 2097152`,
        `#   maxFiles: 5`,
        `# quality:  # opt-in agent quality loop (defaults keep PoC soft)`,
        `#   coverageMode: legacy   # or blueprint (topics/bands/types)`,
        `#   writeGate: off         # off | soft | strict`,
        `#   skillGate: off`,
        `#   distractorQuality: off`,
        `#   nearDupThreshold: 0.85`,
        `#   requireExplanation: false`,
        ``,
    ].join("\n"), created, skipped, force);
    writeYamlFile(join(targetDir, ".sdm", "config.yaml"), {
        initialized_at: new Date().toISOString(),
        schema_version: "0.1",
    });
    created.push(join(targetDir, ".sdm", "config.yaml"));
    writeIfAbsent(join(targetDir, ".gitignore"), [
        ".sdm/cache/",
        ".sdm/index/",
        ".sdm/logs/",
        ".DS_Store",
        "*.log",
        "",
    ].join("\n"), created, skipped, force);
    writeIfAbsent(join(targetDir, "README.md"), [
        `# ${name}`,
        ``,
        `SDM methodology project (knowledge base).`,
        ``,
        `## Layout`,
        ``,
        `- \`ontology/\` — node graph (skills, concepts, topics; each node has \`kind\`)`,
        `- \`library/\` — questions bound to skills`,
        `- \`certifications/\` — profiles, levels, thresholds`,
        `- \`player/\` — author preview for \`export test\` / learning JSON (not a secure exam)`,
        `- \`.sdm/\` — local config, cache, optional vector index`,
        ``,
        `## Host setup (once per IDE workspace)`,
        ``,
        `Creating this methodology folder does **not** install SDM into Cursor/GigaCode.`,
        `From the SDM install, wire the host (MCP + portable skills by default):`,
        ``,
        "```bash",
        `sdm mcp install --hosts gigacode --json`,
        `# Cursor: --hosts cursor --cursor-root <ide-workspace-root>`,
        `# Opt out of skills only: add --no-skills`,
        "```",
        ``,
        `Do **not** pass \`--project\` unless you want a single default methodology.`,
        `Prefer per-call tool arg \`project\` = this directory. Guide: SDM \`GETTING_STARTED.md\`, skill \`connect-mcp\`.`,
        ``,
        `## Next steps`,
        ``,
        `After host wire + reload, open your AI agent and describe an intent, for example:`,
        ``,
        `> Хочу основу профиля Java-разработчик, уровень Middle, направление backend.`,
        ``,
        `The agent should load SDM skill **intent-loop** (clarify → plan → confirm → execute).`,
        `You do not need to type CLI flags — CLI is for the agent.`,
        ``,
        `For agents: see \`AGENTS.md\` and portable skills (\`intent-loop\`, …) after \`mcp install\`.`,
        ``,
    ].join("\n"), created, skipped, force);
    writeIfAbsent(join(targetDir, "AGENTS.md"), [
        `# AI agents — ${name}`,
        ``,
        `This is a **SDM methodology project** (\`sdm.yaml\`).`,
        ``,
        `## Human UX (methodologists)`,
        ``,
        `Humans describe **intent** in natural language. Example:`,
        ``,
        `> Хочу основу профиля Java-разработчик, уровень Middle, направление backend.`,
        ``,
        `Load skill **intent-loop** (clarify → plan → confirm → execute → result).`,
        `Domain entity: **Profile** (профиль), not Role.`,
        ``,
        `## Data model (vault ↔ SDM)`,
        ``,
        `| Vault path | SDM domain |`,
        `|---|---|`,
        `| \`ontology/*.yaml\` | Ontology nodes (skills/concepts/topics, \`kind\`) |`,
        `| \`library/questions/*.yaml\` | Questions (вопросы) |`,
        `| \`library/terms/*.yaml\` | Terms (термины) |`,
        `| \`certifications/profiles/*.yaml\` | Profiles (профили) |`,
        `| \`certifications/levels/*.yaml\` | Levels (уровни) |`,
        `| \`exports/*.json\` | Export artifacts (тесты, курсы, шпаргалки) |`,
        ``,
        `## Host wire (IDE)`,
        ``,
        `\`sdm init\` alone does not install MCP/skills into the IDE.`,
        `Use \`sdm mcp install --hosts <cursor|gigacode>\` (portable skills installed by default; \`--no-skills\` to skip).`,
        `Omit \`--project\` for multi-project; pass tool arg \`project\` with the methodology root.`,
        `See SDM \`GETTING_STARTED.md\` and skill \`connect-mcp\`.`,
        ``,
        `## Multi-project workflow`,
        ``,
        `This vault / workspace may contain **multiple** SDM projects.`,
        `SDM MCP runs without \`SDM_PROJECT_ROOT\` — the agent selects a project on each call.`,
        ``,
        `### Discovery`,
        ``,
        `- \`list_projects(workspaceDir: "<vault-root>")\` — scan for all sdm.yaml files`,
        `- \`locate_project(dir: "<current-directory>")\` — find which project a path belongs to`,
        ``,
        `### Rule`,
        ``,
        `**Always pass \`project\` (root path) to every SDM MCP tool that modifies methodology.**`,
        `The project root is the directory containing \`sdm.yaml\`, returned by \`locate_project\` / \`list_projects\`.`,
        ``,
        `### Read vs. write routing`,
        ``,
        `| Operation | MCP server | Specifies project via |`,
        `|---|---|---|`,
        `| **Read vault files** (YAML, .md) | \`cortex\` / filesystem | Vault path |`,
        `| **List SDM projects** | \`sdm\` \`list_projects\`, \`locate_project\` | \`workspaceDir\` / \`dir\` |`,
        `| **Create/edit methodology** | \`sdm\` \`skill_add\`, \`question_add\`, \`cert_create\` ... | **Always** \`project\` |`,
        `| **Coverage / gaps** | \`sdm\` \`cert_coverage\`, \`cert_gaps\` | **Always** \`project\` |`,
        `| **Export** | \`sdm\` \`export_test\`, \`export_course\` ... | **Always** \`project\` |`,
        `| **Sync artifacts** | \`sdm\` \`player_sync\` | **Always** \`project\` |`,
        ``,
        `## How agents operate`,
        ``,
        `- Prefer SDM MCP tools, or CLI with \`--json\`.`,
        `- Do not hand-edit YAML when a SDM command exists.`,
        `- Portable skills: SDM repo \`AGENTS.md\` + \`agents/*/SKILL.md\` (mirrored via \`mcp install\` / \`agent install\`).`,
        `- Primary: **intent-loop**. Gaps: **close-coverage**.`,
        `- Obsidian: install **Cortex** + **OpenCode** plugin. Cortex exposes vault via MCP; OpenCode runs the agent. See SDM \`docs/obsidian-integration.md\`.`,
        ``,
        `## Agent appendix (CLI)`,
        ``,
        "```bash",
        `sdm doctor`,
        `sdm intent validate-plan --file plan.json --json`,
        `sdm profile create <profile-id> --title "..." --json`,
        "```",
        ``,
    ].join("\n"), created, skipped, force);
    for (const rel of [
        "ontology/.gitkeep",
        "ontology/categories/.gitkeep",
        "library/questions/.gitkeep",
        "library/terms/.gitkeep",
        "certifications/profiles/.gitkeep",
        "certifications/levels/.gitkeep",
        "certifications/teams/.gitkeep",
    ]) {
        writeIfAbsent(join(targetDir, rel), "", created, skipped, force);
    }
    copyPlayerTemplateInto(targetDir, created, skipped, force);
    if (options.withExamples) {
        const examplesSrc = join(templatesRoot(), "examples");
        if (existsSync(examplesSrc)) {
            copyTreeDeep(examplesSrc, targetDir, created, skipped, force);
        }
    }
    return { targetDir, created, skipped };
}
export function isMethodologyProject(dir) {
    return existsSync(join(dir, "sdm.yaml"));
}
//# sourceMappingURL=init.js.map