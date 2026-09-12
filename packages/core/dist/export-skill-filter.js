import { SdmError } from "./errors.js";
import { normalizeWeights } from "./weights.js";
function normalizeSkillList(raw) {
    if (!raw?.length)
        return [];
    return [...new Set(raw.map((s) => s.trim()).filter(Boolean))];
}
/**
 * Resolve include XOR exclude skill filter. Empty/undefined → no filter.
 * Skills must appear on the effective level requirements.
 */
export function resolveExportSkillFilter(input, levelRequirements) {
    const includeRaw = normalizeSkillList(input.includeSkills);
    const excludeRaw = normalizeSkillList(input.excludeSkills);
    if (includeRaw.length > 0 && excludeRaw.length > 0) {
        throw new SdmError("EXPORT_SKILL_FILTER_CONFLICT", "Pass either includeSkills / --include-skill or excludeSkills / --exclude-skill, not both.");
    }
    if (includeRaw.length === 0 && excludeRaw.length === 0) {
        return undefined;
    }
    const onLevel = new Set(levelRequirements.map((r) => r.skill));
    const requested = includeRaw.length > 0 ? includeRaw : excludeRaw;
    for (const skill of requested) {
        if (!onLevel.has(skill)) {
            throw new SdmError("EXPORT_SKILL_UNKNOWN", `Skill "${skill}" is not on the effective level requirements.`);
        }
    }
    if (includeRaw.length > 0) {
        return { mode: "include", skills: includeRaw };
    }
    return { mode: "exclude", skills: excludeRaw };
}
/**
 * Narrow level requirements by skill filter and renormalize weights to sum 1.
 */
export function applySkillFilterToRequirements(requirements, filter) {
    if (!filter) {
        return { requirements: [...requirements], weightsNormalized: false };
    }
    const set = new Set(filter.skills);
    const kept = filter.mode === "include"
        ? requirements.filter((r) => set.has(r.skill))
        : requirements.filter((r) => !set.has(r.skill));
    if (kept.length === 0) {
        throw new SdmError("EXPORT_FILTER_EMPTY", "Skill filter removed all requirements from the export package.");
    }
    const { weights, normalized } = normalizeWeights(kept.map((r) => r.weight));
    return {
        requirements: kept.map((r, i) => ({
            ...r,
            weight: weights[i],
        })),
        weightsNormalized: normalized,
    };
}
//# sourceMappingURL=export-skill-filter.js.map