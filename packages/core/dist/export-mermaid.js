import { computeCoverage } from "./coverage.js";
import { assertProfileLevelMatch, loadLevel, loadQuestions, loadProfile, } from "./loaders.js";
import { findProjectRoot } from "./project-root.js";
import { loadSkill, skillExists } from "./skills.js";
export const EXPORT_MERMAID_SCHEMA = "sdm.export.mermaid/v1";
/** Sanitize skill id for Mermaid node identifiers. */
export function mermaidNodeId(skillId) {
    return skillId.replace(/[^a-zA-Z0-9_]/g, "_");
}
function escapeLabel(skillId) {
    return skillId.replace(/"/g, "#quot;");
}
export function assembleMermaidDocument(input) {
    const { profileId, level, nodes, edges, coverage } = input;
    const lines = ["flowchart LR"];
    for (const node of nodes) {
        const id = mermaidNodeId(node.skill);
        const label = escapeLabel(node.skill);
        lines.push(`  ${id}["${label}"]`);
    }
    const edgeKeys = new Set();
    for (const edge of edges) {
        const key = `${edge.from}->${edge.to}`;
        if (edgeKeys.has(key))
            continue;
        edgeKeys.add(key);
        lines.push(`  ${mermaidNodeId(edge.from)} --> ${mermaidNodeId(edge.to)}`);
    }
    if (coverage) {
        lines.push("  classDef ok fill:#90EE90,stroke:#228B22,color:#000");
        lines.push("  classDef thin fill:#FFE066,stroke:#CC9900,color:#000");
        lines.push("  classDef missing fill:#FFB3B3,stroke:#CC0000,color:#000");
        for (const node of nodes) {
            if (!node.status)
                continue;
            lines.push(`  class ${mermaidNodeId(node.skill)} ${node.status}`);
        }
    }
    const mermaid = lines.join("\n") + "\n";
    const markdown = `# ${level.title}\n\n` +
        `Profile: \`${profileId}\` · Level: \`${level.level}\`` +
        (coverage ? " · coverage coloring\n\n" : "\n\n") +
        "```mermaid\n" +
        mermaid +
        "```\n";
    return {
        schemaVersion: EXPORT_MERMAID_SCHEMA,
        profile: profileId,
        level: level.level,
        title: level.title,
        coverage,
        nodes,
        edges,
        mermaid,
        markdown,
    };
}
/**
 * Assemble a Mermaid skill graph for a certification role + level.
 */
export function exportMermaid(options) {
    const coverage = options.coverage !== false;
    const projectRoot = findProjectRoot(options.startDir);
    const level = loadLevel(projectRoot, options.level);
    const profile = loadProfile(projectRoot, options.profile);
    assertProfileLevelMatch(profile, level, options.profile);
    const skillIds = level.requirements.map((r) => r.skill);
    const skillSet = new Set(skillIds);
    let statusBySkill = new Map();
    let warnings = [];
    if (coverage) {
        const loaded = loadQuestions(projectRoot);
        warnings = loaded.warnings;
        const result = computeCoverage(level, loaded.questions, { profile: options.profile });
        statusBySkill = new Map(result.skills.map((s) => [s.skill, s.status]));
    }
    const nodes = skillIds
        .slice()
        .sort((a, b) => a.localeCompare(b))
        .map((skill) => ({
        skill,
        ...(coverage ? { status: statusBySkill.get(skill) ?? "missing" } : {}),
    }));
    const edges = [];
    for (const skillId of skillIds) {
        if (!skillExists(projectRoot, skillId))
            continue;
        const skill = loadSkill(projectRoot, skillId);
        for (const dep of skill.depends_on) {
            if (skillSet.has(dep)) {
                edges.push({ from: skillId, to: dep });
            }
        }
    }
    edges.sort((a, b) => {
        const byFrom = a.from.localeCompare(b.from);
        if (byFrom !== 0)
            return byFrom;
        return a.to.localeCompare(b.to);
    });
    const document = assembleMermaidDocument({
        profileId: options.profile,
        level,
        nodes,
        edges,
        coverage,
    });
    return { projectRoot, format: "markdown", document, warnings };
}
//# sourceMappingURL=export-mermaid.js.map