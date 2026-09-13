import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ZodError } from "zod";
import { SdmError } from "./errors.js";
import { loadProfile, profilePath } from "./loaders.js";
import { skillExists } from "./skills.js";
import { LevelSchema, ProfileSchema, } from "./schemas.js";
import { writeYamlFile } from "./yaml.js";
import { normalizeWeights } from "./weights.js";
export function parseRequirementTriple(raw) {
    const parts = raw.split(":");
    if (parts.length !== 3) {
        throw new SdmError("VALIDATION_FAILED", `Invalid --requirement "${raw}". Expected skill:depth:weight`);
    }
    const [skill, depthRaw, weightRaw] = parts;
    if (!skill?.trim()) {
        throw new SdmError("VALIDATION_FAILED", `Invalid --requirement "${raw}": empty skill id`);
    }
    const depth = Number(depthRaw);
    const weight = Number(weightRaw);
    if (!Number.isFinite(depth) || depth < 0 || depth > 1) {
        throw new SdmError("VALIDATION_FAILED", `Invalid --requirement "${raw}": depth must be a number in 0..1`);
    }
    if (!Number.isFinite(weight) || weight < 0 || weight > 1) {
        throw new SdmError("VALIDATION_FAILED", `Invalid --requirement "${raw}": weight must be a number in 0..1`);
    }
    return { skill: skill.trim(), depth, weight };
}
function levelPath(projectRoot, levelId) {
    return join(projectRoot, "certifications", "levels", `${levelId}.yaml`);
}
function parseProfile(payload) {
    try {
        return ProfileSchema.parse(payload);
    }
    catch (err) {
        if (err instanceof ZodError) {
            throw new SdmError("VALIDATION_FAILED", err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
        }
        throw err;
    }
}
function parseLevel(payload) {
    try {
        return LevelSchema.parse(payload);
    }
    catch (err) {
        if (err instanceof ZodError) {
            throw new SdmError("VALIDATION_FAILED", err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
        }
        throw err;
    }
}
/**
 * Create a certification level for an existing profile. All validation runs before any write.
 */
export function createCertification(projectRoot, input) {
    const profileId = input.profile.trim();
    const levelId = input.level.trim();
    if (!profileId || !levelId) {
        throw new SdmError("VALIDATION_FAILED", "Profile and level ids must not be empty");
    }
    if (!input.levelTitle.trim()) {
        throw new SdmError("VALIDATION_FAILED", "Level title must not be empty");
    }
    if (input.requirementTriples.length === 0) {
        throw new SdmError("VALIDATION_FAILED", "At least one --requirement skill:depth:weight is required");
    }
    // Pre-validate all skills exist before any other processing
    const skillIds = input.requirementTriples.map(triple => {
        const parts = triple.split(":");
        return parts[0]?.trim();
    }).filter(id => id);
    const missingSkills = [];
    for (const skillId of skillIds) {
        if (!skillExists(projectRoot, skillId)) {
            missingSkills.push(skillId);
        }
    }
    if (missingSkills.length > 0) {
        const available = readdirSync(join(projectRoot, "ontology"))
            .filter(name => !name.startsWith(".") && (name.endsWith(".yaml") || name.endsWith(".yml")))
            .map(name => name.replace(/\.ya?ml$/, ""));
        throw new SdmError("SKILL_NOT_FOUND", `Skills not found: [${missingSkills.join(", ")}]. Available skills: [${available.slice(0, 10).join(", ")}${available.length > 10 ? ", ..." : ""}]`);
    }
    const parsed = input.requirementTriples.map(parseRequirementTriple);
    // Map named depths (junior/middle/senior/expert) to numbers if needed
    const depthMap = {
        junior: 0.3,
        middle: 0.6,
        senior: 0.9,
        expert: 1.0,
    };
    const normalizedDepths = parsed.map(req => {
        const d = req.depth;
        if (typeof d === 'string') {
            const depthStr = d;
            const key = depthStr.toLowerCase();
            return { ...req, depth: depthMap[key] ?? d };
        }
        return req;
    });
    // If no explicit weights provided (all zeros), assign equal shares before normalization
    const requirementWeights = normalizedDepths.map(r => r.weight);
    const rawSum = requirementWeights.reduce((s, w) => s + w, 0);
    if (rawSum === 0) {
        throw new SdmError("WEIGHT_SUM_INVALID", "Requirement weights sum to zero — at least one non-zero weight is required");
    }
    let normalizedWeights;
    let requirements;
    if (input.noNormalizeWeights) {
        normalizedWeights = { weights: [...requirementWeights], normalized: false };
        requirements = normalizedDepths.map((r, i) => ({
            ...r,
            weight: requirementWeights[i] ?? 0,
        }));
    }
    else {
        normalizedWeights = normalizeWeights(requirementWeights);
        requirements = normalizedDepths.map((r, i) => ({
            ...r,
            weight: normalizedWeights.weights[i] ?? 0,
        }));
    }
    const pPath = profilePath(projectRoot, profileId);
    const lPath = levelPath(projectRoot, levelId);
    let existing;
    try {
        existing = loadProfile(projectRoot, profileId);
    }
    catch (err) {
        if (err instanceof SdmError && err.code === "PROFILE_NOT_FOUND") {
            throw new SdmError("PROFILE_NOT_FOUND", `Profile "${profileId}" not found. Run profile create first.`);
        }
        throw err;
    }
    if (existsSync(lPath) && !input.force) {
        throw new SdmError("LEVEL_EXISTS", `Level file already exists: ${lPath}. Use --force to overwrite.`);
    }
    const levels = [...new Set([...existing.levels, levelId])];
    const profile = parseProfile({
        profile: profileId,
        title: existing.title,
        levels,
    });
    const level = parseLevel({
        level: levelId,
        profile: profileId,
        title: input.levelTitle.trim(),
        description: input.description ?? "",
        requirements,
        threshold: input.threshold ?? 0.7,
    });
    // Always write to profiles/ (migrate off legacy roles/ on write)
    writeYamlFile(lPath, level);
    writeYamlFile(pPath, profile);
    return {
        profile,
        level,
        paths: { profile: pPath, level: lPath },
        action: "create",
        weightsNormalized: normalizedWeights.normalized,
    };
}
//# sourceMappingURL=cert-write.js.map