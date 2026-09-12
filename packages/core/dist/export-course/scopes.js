import { runCertGaps } from "../cert-gaps.js";
import { SdmError } from "../errors.js";
import { assertProfileLevelMatch, loadLevel, loadProfile, } from "../loaders.js";
import { loadAllSkills, loadSkill, assertSkillExists } from "../skills.js";
export function resolveScope(projectRoot, options, allQuestions) {
    const fromQuestions = (options.fromQuestions ?? [])
        .map((id) => id.trim())
        .filter(Boolean);
    const skillOpt = options.skill?.trim();
    const topicOpt = options.topic?.trim();
    const fromGaps = Boolean(options.fromGaps);
    const profileOpt = options.profile?.trim();
    const levelOpt = options.level?.trim();
    if (fromGaps && !(profileOpt && levelOpt)) {
        throw new SdmError("COURSE_SCOPE_INVALID", "fromGaps requires --profile and --level.");
    }
    if (fromQuestions.length > 0 && (skillOpt || fromGaps)) {
        throw new SdmError("COURSE_SCOPE_INVALID", "fromQuestions cannot be combined with --skill or --from-gaps.");
    }
    if (!fromQuestions.length &&
        !skillOpt &&
        !fromGaps &&
        !topicOpt &&
        !(profileOpt && levelOpt)) {
        throw new SdmError("COURSE_SCOPE_INVALID", "Provide --profile/--level, --from-gaps with profile/level, --skill, --topic, or --from-questions.");
    }
    if ((profileOpt && !levelOpt) || (!profileOpt && levelOpt)) {
        throw new SdmError("COURSE_SCOPE_INVALID", "Profile and level must be provided together (unless using --skill / --topic / --from-questions alone).");
    }
    if (fromQuestions.length > 0) {
        const byId = new Map(allQuestions.map((q) => [q.id, q]));
        const missing = fromQuestions.filter((id) => !byId.has(id));
        if (missing.length) {
            throw new SdmError("EXPORT_QUESTION_NOT_FOUND", `Question(s) not found: ${missing.join(", ")}`);
        }
        const selected = fromQuestions.map((id) => byId.get(id));
        let skillIds = [...new Set(selected.map((q) => q.skill))].sort((a, b) => a.localeCompare(b));
        if (topicOpt) {
            skillIds = skillIds.filter((sid) => {
                const skill = loadSkill(projectRoot, sid);
                return (skill.topics.includes(topicOpt) ||
                    selected.some((q) => q.skill === sid && q.topics.includes(topicOpt)));
            });
            if (skillIds.length === 0) {
                throw new SdmError("COURSE_SCOPE_EMPTY", `No skills/questions match topic "${topicOpt}" for the given question ids.`);
            }
        }
        return {
            skillIds,
            requirementsBySkill: new Map(),
            forcedQuestionIds: new Set(fromQuestions),
            scopeMeta: {
                mode: "from_questions",
                questionIds: fromQuestions,
                ...(topicOpt ? { topic: topicOpt } : {}),
            },
            loadWarnings: [],
        };
    }
    if (skillOpt && !fromGaps && !(profileOpt && levelOpt)) {
        assertSkillExists(projectRoot, skillOpt);
        const skill = loadSkill(projectRoot, skillOpt);
        if (topicOpt && !skill.topics.includes(topicOpt)) {
            const hasQ = allQuestions.some((q) => q.skill === skillOpt && q.topics.includes(topicOpt));
            if (!hasQ) {
                throw new SdmError("COURSE_SCOPE_EMPTY", `Skill "${skillOpt}" has no topic "${topicOpt}".`);
            }
        }
        return {
            skillIds: [skillOpt],
            requirementsBySkill: new Map(),
            scopeMeta: {
                mode: topicOpt ? "topic" : "skill",
                skill: skillOpt,
                ...(topicOpt ? { topic: topicOpt } : {}),
            },
            loadWarnings: [],
        };
    }
    if (topicOpt && !(profileOpt && levelOpt) && !skillOpt && !fromGaps) {
        const skillIds = [
            ...new Set([
                ...loadSkillIdsWithTopic(projectRoot, topicOpt),
                ...allQuestions
                    .filter((q) => q.topics.includes(topicOpt))
                    .map((q) => q.skill),
            ]),
        ].sort((a, b) => a.localeCompare(b));
        if (skillIds.length === 0) {
            throw new SdmError("COURSE_SCOPE_EMPTY", `No skills or questions found for topic "${topicOpt}".`);
        }
        return {
            skillIds,
            requirementsBySkill: new Map(),
            scopeMeta: { mode: "topic", topic: topicOpt },
            loadWarnings: [],
        };
    }
    // profile + level (± gaps ± topic ± skill filter)
    if (!profileOpt || !levelOpt) {
        throw new SdmError("COURSE_SCOPE_INVALID", "Provide --profile/--level, --skill, --topic, or --from-questions.");
    }
    const profile = loadProfile(projectRoot, profileOpt);
    const level = loadLevel(projectRoot, levelOpt);
    assertProfileLevelMatch(profile, level, profileOpt);
    let reqSkills = level.requirements.map((r) => r.skill);
    let loadWarnings = [];
    if (fromGaps) {
        const gapsRun = runCertGaps({
            startDir: projectRoot,
            profile: profileOpt,
            level: levelOpt,
        });
        loadWarnings = gapsRun.warnings;
        reqSkills = gapsRun.gaps.map((g) => g.skill);
    }
    if (skillOpt) {
        if (!reqSkills.includes(skillOpt) && !fromGaps) {
            // allow skill even if not in requirements when explicitly requested with level? Prefer filter.
            assertSkillExists(projectRoot, skillOpt);
            reqSkills = [skillOpt];
        }
        else {
            reqSkills = reqSkills.filter((s) => s === skillOpt);
        }
    }
    if (topicOpt) {
        reqSkills = reqSkills.filter((sid) => {
            const skill = loadSkill(projectRoot, sid);
            return (skill.topics.includes(topicOpt) ||
                allQuestions.some((q) => q.skill === sid && q.topics.includes(topicOpt)));
        });
    }
    if (reqSkills.length === 0) {
        throw new SdmError("COURSE_SCOPE_EMPTY", fromGaps
            ? "No missing/thin skills for this profile/level."
            : "No skills match the requested course scope.");
    }
    const requirementsBySkill = new Map(level.requirements
        .filter((r) => reqSkills.includes(r.skill))
        .map((r) => [r.skill, { depth: r.depth, weight: r.weight }]));
    let mode = "profile_level";
    if (fromGaps)
        mode = "from_gaps";
    else if (topicOpt)
        mode = "topic_in_level";
    else if (skillOpt)
        mode = "skill";
    return {
        skillIds: [...new Set(reqSkills)].sort((a, b) => a.localeCompare(b)),
        profile: profileOpt,
        level,
        requirementsBySkill,
        scopeMeta: {
            mode,
            profile: profileOpt,
            level: levelOpt,
            ...(skillOpt ? { skill: skillOpt } : {}),
            ...(topicOpt ? { topic: topicOpt } : {}),
        },
        loadWarnings,
    };
}
export function loadSkillIdsWithTopic(projectRoot, topic) {
    return loadAllSkills(projectRoot)
        .filter((s) => s.topics.includes(topic))
        .map((s) => s.id);
}
export function shouldIncludeOverviewModule(format, scope) {
    if (format !== "course")
        return false;
    if (!scope.profile || !scope.level)
        return false;
    // Explicit single-skill / question packs stay without mandatory overview.
    if (scope.mode === "skill" || scope.mode === "from_questions")
        return false;
    if (scope.mode === "topic" && !scope.profile)
        return false;
    return (scope.mode === "profile_level" ||
        scope.mode === "from_gaps" ||
        scope.mode === "topic_in_level");
}
//# sourceMappingURL=scopes.js.map