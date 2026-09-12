import { createHash } from "node:crypto";
import { loadTerms } from "./loaders.js";
import { loadSkill } from "./skills.js";
export { ContentBasisSchema } from "./schemas.js";
function sha16(text) {
    return createHash("sha256").update(text, "utf8").digest("hex").slice(0, 16);
}
function stableStringify(value) {
    if (value === null || typeof value !== "object") {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((v) => stableStringify(v)).join(",")}]`;
    }
    const obj = value;
    const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}
/** Deterministic truncated hash of semantic skill fields. */
export function hashSkillContent(skill) {
    const payload = {
        id: skill.id,
        name: skill.name,
        description: skill.description ?? "",
        category: skill.category ?? "",
        topics: [...(skill.topics ?? [])].sort((a, b) => a.localeCompare(b)),
        depends_on: [...(skill.depends_on ?? [])].sort((a, b) => a.localeCompare(b)),
        related_to: [...(skill.related_to ?? [])].sort((a, b) => a.localeCompare(b)),
    };
    return sha16(stableStringify(payload));
}
/** Deterministic truncated hash of library term fields. */
export function hashTermContent(term) {
    const payload = {
        id: term.id,
        term: term.term,
        definition: term.definition,
        aliases: [...(term.aliases ?? [])].sort((a, b) => a.localeCompare(b)),
        skills: [...(term.skills ?? [])].sort((a, b) => a.localeCompare(b)),
        kind: term.kind ?? "concept",
    };
    return sha16(stableStringify(payload));
}
export function buildTermBasis(projectRoot, termIds) {
    const { terms } = loadTerms(projectRoot);
    const byId = new Map(terms.map((t) => [t.id, t]));
    const out = {};
    const unique = [...new Set(termIds)].sort((a, b) => a.localeCompare(b));
    for (const id of unique) {
        const term = byId.get(id);
        if (!term) {
            throw new Error(`Term "${id}" not found in library/terms`);
        }
        out[id] = hashTermContent(term);
    }
    return out;
}
/** Deterministic truncated hash of level requirements / threshold. */
export function hashLevelContent(level) {
    const requirements = [...(level.requirements ?? [])]
        .map((r) => ({
        skill: r.skill,
        depth: r.depth,
        weight: r.weight,
    }))
        .sort((a, b) => a.skill.localeCompare(b.skill));
    const payload = {
        level: level.level,
        profile: level.profile ?? "",
        threshold: level.threshold,
        requirements,
    };
    return sha16(stableStringify(payload));
}
export function nowCapturedAt() {
    return new Date().toISOString();
}
export function buildSkillBasis(projectRoot, skillIds) {
    const skills = {};
    const unique = [...new Set(skillIds)].sort((a, b) => a.localeCompare(b));
    for (const id of unique) {
        skills[id] = hashSkillContent(loadSkill(projectRoot, id));
    }
    return skills;
}
export function buildContentBasis(options) {
    const skills = buildSkillBasis(options.projectRoot, options.skillIds);
    let terms;
    if (options.termHashes && Object.keys(options.termHashes).length > 0) {
        terms = options.termHashes;
    }
    else if (options.termIds && options.termIds.length > 0) {
        terms = buildTermBasis(options.projectRoot, options.termIds);
    }
    return {
        ...(Object.keys(skills).length > 0 ? { skills } : {}),
        ...(terms && Object.keys(terms).length > 0 ? { terms } : {}),
        ...(options.level
            ? {
                level: {
                    id: options.level.level,
                    hash: hashLevelContent(options.level),
                },
            }
            : {}),
        capturedAt: nowCapturedAt(),
    };
}
//# sourceMappingURL=content-basis.js.map