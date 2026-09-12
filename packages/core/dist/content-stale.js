import { hashLevelContent, hashSkillContent, } from "./content-basis.js";
import { SdmError } from "./errors.js";
import { exportMatchesScope, scanExportArtifacts, } from "./export-artifacts.js";
import { assertProfileLevelMatch, loadLevel, loadProfile, loadQuestions, } from "./loaders.js";
import { findProjectRoot } from "./project-root.js";
import { assertSkillExists, loadSkill } from "./skills.js";
export const CONTENT_STALE_SCHEMA = "sdm.content.stale/v1";
function evaluateQuestion(q, currentSkillHashes) {
    const basis = q.meta?.basis;
    if (!basis?.skills || basis.skills[q.skill] === undefined) {
        return {
            kind: "question",
            id: q.id,
            skill: q.skill,
            reason: "missing_basis",
            severity: "info",
            action: "review",
        };
    }
    const stamped = basis.skills[q.skill];
    const current = currentSkillHashes.get(q.skill);
    if (current === undefined) {
        return {
            kind: "question",
            id: q.id,
            skill: q.skill,
            reason: "missing_basis",
            severity: "info",
            action: "review",
        };
    }
    if (stamped !== current) {
        return {
            kind: "question",
            id: q.id,
            skill: q.skill,
            reason: "skill_basis_mismatch",
            severity: "warn",
            action: "review",
        };
    }
    return null;
}
function evaluateExport(ref, currentSkillHashes, currentLevelHash) {
    const basis = ref.basis;
    if (!basis) {
        return {
            kind: "export",
            path: ref.path,
            reason: "missing_basis",
            severity: "info",
            action: "regenerate",
        };
    }
    if (basis.skills) {
        for (const [skillId, stamped] of Object.entries(basis.skills)) {
            const current = currentSkillHashes.get(skillId);
            if (current !== undefined && stamped !== current) {
                return {
                    kind: "export",
                    path: ref.path,
                    skill: skillId,
                    reason: "skill_basis_mismatch",
                    severity: "warn",
                    action: "regenerate",
                };
            }
        }
    }
    if (basis.level && currentLevelHash) {
        if (basis.level.id === currentLevelHash.id &&
            basis.level.hash !== currentLevelHash.hash) {
            return {
                kind: "export",
                path: ref.path,
                reason: "level_basis_mismatch",
                severity: "warn",
                action: "regenerate",
            };
        }
    }
    // Has basis but none of the scoped skills/level were comparable — treat as ok
    // when all stamped skills that we know match.
    if (basis.skills) {
        const known = Object.keys(basis.skills).filter((id) => currentSkillHashes.has(id));
        if (known.length === 0 && !basis.level) {
            return null;
        }
    }
    return null;
}
function toWorkItem(item) {
    return {
        kind: item.kind,
        ...(item.id ? { id: item.id } : {}),
        ...(item.path ? { path: item.path } : {}),
        ...(item.skill ? { skill: item.skill } : {}),
        action: item.action,
        reason: item.reason,
    };
}
function skillHashesForIds(projectRoot, skillIds) {
    const map = new Map();
    for (const id of skillIds) {
        try {
            map.set(id, hashSkillContent(loadSkill(projectRoot, id)));
        }
        catch {
            // skip missing
        }
    }
    return map;
}
/**
 * Compare stamped content basis against current skill/level hashes.
 * Default: `--skill S` only checks questions bound to S (not downstream).
 */
export function runContentStale(options) {
    const projectRoot = findProjectRoot(options.startDir);
    const skillOpt = options.skill?.trim();
    const profileOpt = options.profile?.trim();
    const levelOpt = options.level?.trim();
    if (!skillOpt && !(profileOpt && levelOpt)) {
        throw new SdmError("STALE_SCOPE_REQUIRED", "content stale requires --skill and/or --profile with --level");
    }
    if ((profileOpt && !levelOpt) || (!profileOpt && levelOpt)) {
        throw new SdmError("STALE_SCOPE_REQUIRED", "content stale profile scope requires both --profile and --level");
    }
    if (skillOpt) {
        assertSkillExists(projectRoot, skillOpt);
    }
    let level;
    if (profileOpt && levelOpt) {
        const profile = loadProfile(projectRoot, profileOpt);
        level = loadLevel(projectRoot, levelOpt);
        assertProfileLevelMatch(profile, level, profileOpt);
    }
    const questionSkillScope = new Set();
    const hashSkillIds = new Set();
    const exportSkills = new Set();
    const exportProfiles = new Set();
    const exportLevels = new Set();
    if (skillOpt) {
        questionSkillScope.add(skillOpt);
        hashSkillIds.add(skillOpt);
        exportSkills.add(skillOpt);
    }
    if (level) {
        for (const r of level.requirements) {
            hashSkillIds.add(r.skill);
            exportSkills.add(r.skill);
            // Level scope: check questions for all requirement skills
            if (!skillOpt) {
                questionSkillScope.add(r.skill);
            }
        }
        if (level.profile)
            exportProfiles.add(level.profile);
        exportLevels.add(level.level);
    }
    if (profileOpt)
        exportProfiles.add(profileOpt);
    if (levelOpt)
        exportLevels.add(levelOpt);
    const currentSkillHashes = skillHashesForIds(projectRoot, hashSkillIds);
    const currentLevelHash = level
        ? { id: level.level, hash: hashLevelContent(level) }
        : undefined;
    const { questions } = loadQuestions(projectRoot);
    const stale = [];
    for (const q of questions) {
        if (!questionSkillScope.has(q.skill))
            continue;
        const item = evaluateQuestion(q, currentSkillHashes);
        if (item)
            stale.push(item);
    }
    const exports = scanExportArtifacts(projectRoot).filter((ref) => exportMatchesScope(ref, {
        skills: exportSkills.size > 0 ? exportSkills : undefined,
        profiles: exportProfiles.size > 0 ? exportProfiles : undefined,
        levels: exportLevels.size > 0 ? exportLevels : undefined,
    }));
    for (const ref of exports) {
        const item = evaluateExport(ref, currentSkillHashes, currentLevelHash);
        if (item)
            stale.push(item);
    }
    stale.sort((a, b) => {
        const ak = a.id ?? a.path ?? "";
        const bk = b.id ?? b.path ?? "";
        return ak.localeCompare(bk);
    });
    const document = {
        schemaVersion: CONTENT_STALE_SCHEMA,
        ...(skillOpt ? { skill: skillOpt } : {}),
        ...(profileOpt ? { profile: profileOpt } : {}),
        ...(levelOpt ? { level: levelOpt } : {}),
        stale,
        workItems: stale.map(toWorkItem),
    };
    return { projectRoot, document };
}
/** Count basis mismatches (excludes missing_basis) for suggest ranking. */
export function countBasisMismatches(document) {
    return document.stale.filter((s) => s.reason === "skill_basis_mismatch" ||
        s.reason === "level_basis_mismatch").length;
}
/** Peek basis for a ContentBasis value (tests / helpers). */
export function readBasis(value) {
    if (!value || typeof value !== "object")
        return undefined;
    return value;
}
//# sourceMappingURL=content-stale.js.map