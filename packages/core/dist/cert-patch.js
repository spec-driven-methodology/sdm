import { existsSync } from "node:fs";
import { join } from "node:path";
import { ZodError } from "zod";
import { SdmError } from "./errors.js";
import { skillExists } from "./skills.js";
import { LevelSchema } from "./schemas.js";
import { readYamlFile, writeYamlFile } from "./yaml.js";
import { parseRequirementTriple } from "./cert-write.js";
import { assertWeightSum, parseWeightTransfer, roundWeight, sumWeights, weightSumIsValid, } from "./weights.js";
function levelPath(projectRoot, levelId) {
    return join(projectRoot, "certifications", "levels", `${levelId}.yaml`);
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
function loadLevelFile(projectRoot, levelId) {
    const path = levelPath(projectRoot, levelId);
    if (!existsSync(path)) {
        throw new SdmError("LEVEL_NOT_FOUND", `Level "${levelId}" not found under certifications/levels/`);
    }
    return { level: parseLevel(readYamlFile(path)), path };
}
function applyDonorTransfers(bySkill, fromTransfers, levelId) {
    for (const raw of fromTransfers) {
        const { skill, amount } = parseWeightTransfer(raw);
        const donor = bySkill.get(skill);
        if (!donor) {
            throw new SdmError("WEIGHT_SKILL_NOT_ON_LEVEL", `Donor skill "${skill}" is not on level "${levelId}"`);
        }
        if (donor.weight + 1e-12 < amount) {
            throw new SdmError("WEIGHT_DONOR_INSUFFICIENT", `Donor "${skill}" has weight ${donor.weight}, cannot give ${amount}`);
        }
        donor.weight = roundWeight(donor.weight - amount);
    }
}
/**
 * Patch an existing level: add/set/remove requirements and optional metadata.
 * Mutating requirements enforces sum(weights) ≈ 1; adds need explicit --from transfers.
 */
export function patchCertification(projectRoot, input) {
    const levelId = input.level.trim();
    if (!levelId) {
        throw new SdmError("VALIDATION_FAILED", "Level id must not be empty");
    }
    const addTriples = input.addTriples ?? [];
    const setTriples = input.setTriples ?? [];
    const removeSkills = (input.removeSkills ?? [])
        .map((s) => s.trim())
        .filter(Boolean);
    const fromTransfers = input.fromTransfers ?? [];
    const absorbInto = input.absorbInto?.trim();
    const hasMeta = input.title !== undefined ||
        input.description !== undefined ||
        input.threshold !== undefined;
    if (addTriples.length === 0 &&
        setTriples.length === 0 &&
        removeSkills.length === 0 &&
        !hasMeta) {
        throw new SdmError("VALIDATION_FAILED", "Provide at least one of --add-requirement, --set-requirement, --remove-requirement, or metadata flags");
    }
    const { level: existing, path } = loadLevelFile(projectRoot, levelId);
    if (input.profile?.trim()) {
        const profileId = input.profile.trim();
        if (existing.profile && existing.profile !== profileId) {
            throw new SdmError("PROFILE_LEVEL_MISMATCH", `Level "${levelId}" belongs to profile "${existing.profile}", not "${profileId}"`);
        }
    }
    const mutatesRequirements = addTriples.length > 0 || setTriples.length > 0 || removeSkills.length > 0;
    const bySkill = new Map();
    for (const req of existing.requirements) {
        bySkill.set(req.skill, { ...req });
    }
    const added = [];
    const updated = [];
    const removed = [];
    let removedWeight = 0;
    for (const skillId of removeSkills) {
        const prev = bySkill.get(skillId);
        if (!prev) {
            throw new SdmError("REQUIREMENT_NOT_FOUND", `Requirement skill "${skillId}" is not on level "${levelId}"`);
        }
        removedWeight = roundWeight(removedWeight + prev.weight);
        bySkill.delete(skillId);
        removed.push(skillId);
    }
    if (removeSkills.length > 0) {
        if (!absorbInto) {
            throw new SdmError("WEIGHT_TRANSFER_REQUIRED", `Removing requirements requires --absorb-into <skill> to keep weight sum = 1 (removed weight ${removedWeight})`);
        }
        if (removeSkills.includes(absorbInto)) {
            throw new SdmError("VALIDATION_FAILED", `Cannot --absorb-into "${absorbInto}" which is being removed`);
        }
        const sink = bySkill.get(absorbInto);
        if (!sink) {
            throw new SdmError("WEIGHT_SKILL_NOT_ON_LEVEL", `Absorb target "${absorbInto}" is not on level "${levelId}"`);
        }
        sink.weight = roundWeight(sink.weight + removedWeight);
    }
    if (addTriples.length > 0) {
        if (fromTransfers.length === 0) {
            throw new SdmError("WEIGHT_TRANSFER_REQUIRED", "Adding a requirement with weight requires --from <skill:amount> (no silent renormalize)");
        }
        applyDonorTransfers(bySkill, fromTransfers, levelId);
    }
    else if (fromTransfers.length > 0) {
        throw new SdmError("VALIDATION_FAILED", "--from is only valid together with --add-requirement");
    }
    for (const raw of addTriples) {
        const req = parseRequirementTriple(raw);
        if (!skillExists(projectRoot, req.skill)) {
            throw new SdmError("SKILL_NOT_FOUND", `Requirement skill "${req.skill}" not found under ontology/skills/`);
        }
        if (bySkill.has(req.skill)) {
            throw new SdmError("REQUIREMENT_EXISTS", `Requirement skill "${req.skill}" already on level "${levelId}". Use --set-requirement to update.`);
        }
        bySkill.set(req.skill, req);
        added.push(req.skill);
    }
    for (const raw of setTriples) {
        const req = parseRequirementTriple(raw);
        if (!skillExists(projectRoot, req.skill)) {
            throw new SdmError("SKILL_NOT_FOUND", `Requirement skill "${req.skill}" not found under ontology/skills/`);
        }
        const was = bySkill.has(req.skill);
        bySkill.set(req.skill, req);
        if (was) {
            updated.push(req.skill);
        }
        else {
            added.push(req.skill);
        }
    }
    const requirements = [...bySkill.values()];
    if (requirements.length === 0) {
        throw new SdmError("VALIDATION_FAILED", "Level must keep at least one requirement after patch");
    }
    if (mutatesRequirements) {
        const weights = requirements.map((r) => r.weight);
        const sum = sumWeights(weights);
        if (!weightSumIsValid(sum)) {
            if (addTriples.length > 0) {
                throw new SdmError("WEIGHT_TRANSFER_REQUIRED", `After add/transfer, weights sum to ${sum}; --from amounts must balance new requirement weights to 1`);
            }
            assertWeightSum(weights, `level ${levelId}`);
        }
    }
    const next = parseLevel({
        ...existing,
        title: input.title?.trim() || existing.title,
        description: input.description !== undefined ? input.description : existing.description,
        threshold: input.threshold ?? existing.threshold,
        requirements,
    });
    writeYamlFile(path, next);
    return {
        level: next,
        path,
        action: "patch",
        added,
        updated,
        removed,
    };
}
//# sourceMappingURL=cert-patch.js.map