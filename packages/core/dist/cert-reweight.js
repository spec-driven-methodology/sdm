import { existsSync } from "node:fs";
import { join } from "node:path";
import { ZodError } from "zod";
import { SdmError } from "./errors.js";
import { LevelSchema } from "./schemas.js";
import { readYamlFile, writeYamlFile } from "./yaml.js";
import { assertWeightSum, parseWeightSet, parseWeightTransfer, roundWeight, weightMap, } from "./weights.js";
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
function applyTransfer(level, skill, delta, fromRaws) {
    const target = skill.trim();
    if (!target) {
        throw new SdmError("VALIDATION_FAILED", "--skill must not be empty");
    }
    if (!Number.isFinite(delta) || delta <= 0 || delta > 1) {
        throw new SdmError("VALIDATION_FAILED", "--delta must be a number in (0, 1]");
    }
    if (!fromRaws.length) {
        throw new SdmError("VALIDATION_FAILED", "Transfer mode requires at least one --from <skill>[:amount]");
    }
    const bySkill = new Map(level.requirements.map((r) => [r.skill, { ...r }]));
    if (!bySkill.has(target)) {
        throw new SdmError("WEIGHT_SKILL_NOT_ON_LEVEL", `Skill "${target}" is not on level "${level.level}"`);
    }
    const donors = [];
    if (fromRaws.length === 1 && !fromRaws[0].includes(":")) {
        donors.push({ skill: fromRaws[0].trim(), amount: delta });
    }
    else {
        for (const raw of fromRaws) {
            if (!raw.includes(":")) {
                throw new SdmError("VALIDATION_FAILED", `Invalid --from "${raw}". With multiple donors use skill:amount`);
            }
            donors.push(parseWeightTransfer(raw));
        }
    }
    const donorTotal = donors.reduce((s, d) => s + d.amount, 0);
    if (Math.abs(donorTotal - delta) > 1e-9) {
        throw new SdmError("VALIDATION_FAILED", `Sum of --from amounts (${donorTotal}) must equal --delta (${delta})`);
    }
    const transfers = [];
    for (const donor of donors) {
        const req = bySkill.get(donor.skill);
        if (!req) {
            throw new SdmError("WEIGHT_SKILL_NOT_ON_LEVEL", `Donor skill "${donor.skill}" is not on level "${level.level}"`);
        }
        if (donor.skill === target) {
            throw new SdmError("VALIDATION_FAILED", "Cannot transfer weight from a skill to itself");
        }
        if (req.weight + 1e-12 < donor.amount) {
            throw new SdmError("WEIGHT_DONOR_INSUFFICIENT", `Donor "${donor.skill}" has weight ${req.weight}, cannot give ${donor.amount}`);
        }
        req.weight = roundWeight(req.weight - donor.amount);
        transfers.push({ from: donor.skill, to: target, amount: donor.amount });
    }
    const targetReq = bySkill.get(target);
    targetReq.weight = roundWeight(targetReq.weight + delta);
    const requirements = [...bySkill.values()];
    assertWeightSum(requirements.map((r) => r.weight), `level ${level.level}`);
    return { requirements, transfers };
}
function applySetMap(level, setRaws) {
    const entries = setRaws.map(parseWeightSet);
    const setSkills = new Set(entries.map((e) => e.skill));
    const levelSkills = new Set(level.requirements.map((r) => r.skill));
    for (const skill of levelSkills) {
        if (!setSkills.has(skill)) {
            throw new SdmError("WEIGHT_SUM_INVALID", `Incomplete --set map: missing skill "${skill}"`);
        }
    }
    for (const skill of setSkills) {
        if (!levelSkills.has(skill)) {
            throw new SdmError("WEIGHT_SKILL_NOT_ON_LEVEL", `Skill "${skill}" is not on level "${level.level}"`);
        }
    }
    if (setSkills.size !== entries.length) {
        throw new SdmError("VALIDATION_FAILED", "Duplicate skill in --set map");
    }
    const weightBySkill = new Map(entries.map((e) => [e.skill, e.weight]));
    const requirements = level.requirements.map((r) => ({
        ...r,
        weight: weightBySkill.get(r.skill),
    }));
    assertWeightSum(requirements.map((r) => r.weight), `level ${level.level}`);
    return requirements;
}
/**
 * Adjust requirement weights on an existing level (transfer or full map replace).
 * Does not change depths.
 */
export function reweightCertification(projectRoot, input) {
    const levelId = input.level.trim();
    if (!levelId) {
        throw new SdmError("VALIDATION_FAILED", "Level id must not be empty");
    }
    const setRaws = input.set ?? [];
    const fromRaws = input.from ?? [];
    const hasTransfer = input.skill !== undefined || input.delta !== undefined || fromRaws.length > 0;
    const hasSet = setRaws.length > 0;
    if (hasTransfer === hasSet) {
        throw new SdmError("VALIDATION_FAILED", "Provide either transfer (--skill --delta --from) or full --set map, not both/neither");
    }
    const { level: existing, path } = loadLevelFile(projectRoot, levelId);
    if (input.profile?.trim()) {
        const profileId = input.profile.trim();
        if (existing.profile && existing.profile !== profileId) {
            throw new SdmError("PROFILE_LEVEL_MISMATCH", `Level "${levelId}" belongs to profile "${existing.profile}", not "${profileId}"`);
        }
    }
    const before = weightMap(existing.requirements);
    let requirements;
    let transfers = [];
    if (hasSet) {
        requirements = applySetMap(existing, setRaws);
    }
    else {
        const result = applyTransfer(existing, input.skill ?? "", input.delta ?? NaN, fromRaws);
        requirements = result.requirements;
        transfers = result.transfers;
    }
    const next = parseLevel({
        ...existing,
        requirements,
    });
    writeYamlFile(path, next);
    return {
        level: next,
        path,
        action: "reweight",
        before,
        after: weightMap(next.requirements),
        transfers,
    };
}
//# sourceMappingURL=cert-reweight.js.map