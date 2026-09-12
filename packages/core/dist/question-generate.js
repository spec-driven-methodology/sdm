import { SdmError } from "./errors.js";
import { findProjectRoot } from "./project-root.js";
import { loadSkill, assertSkillExists } from "./skills.js";
import { listQuestions } from "./question-list.js";
import { runCertGaps } from "./cert-gaps.js";
import { MIN_OK_QUESTIONS, } from "./coverage.js";
import { assertTypeAndMixExclusive, assignTypesForMix, parseTypeMixPreset, } from "./question-type-mix.js";
function clamp01(n) {
    if (!Number.isFinite(n))
        return 0.3;
    return Math.min(1, Math.max(0, n));
}
function parseDifficultyRange(minRaw, maxRaw) {
    const min = clamp01(minRaw ?? 0.3);
    const max = clamp01(maxRaw ?? 0.6);
    if (min > max) {
        throw new SdmError("VALIDATION_FAILED", `difficulty min (${min}) must be <= max (${max})`);
    }
    return { min, max };
}
function difficultyForIndex(i, count, min, max) {
    if (count <= 1)
        return Number(((min + max) / 2).toFixed(2));
    const t = i / (count - 1);
    return Number((min + (max - min) * t).toFixed(2));
}
function buildStub(skillId, skillName, index, type, difficulty, extras) {
    const topicHint = extras?.mustCoverTopic
        ? ` Cover topic "${extras.mustCoverTopic}".`
        : "";
    const stub = {
        index,
        skill: skillId,
        type,
        difficulty,
        text: `[DRAFT ${index}] Replace with a real question about ${skillName}${extras?.mustCoverTopic ? ` (topic: ${extras.mustCoverTopic})` : ""}`,
        instructions: `Replace text (and options/correct for choice types, or expected for open), then call question validate then question add.${topicHint} Do not write library YAML by hand.`,
        mustCoverTopic: extras?.mustCoverTopic,
        avoidNearIds: extras?.avoidNearIds,
        relatedSkillIds: extras?.relatedSkillIds,
    };
    if (type === "single_choice" || type === "multi_choice") {
        stub.options = ["Option A", "Option B", "Option C", "Option D"];
        stub.correct = type === "multi_choice" ? [1, 2] : 1;
        stub.explanation = "[DRAFT] Short explanation";
        stub.instructions =
            `Replace text/options/correct (1-based; multi_choice may use multiple --correct), then question validate → question add.${topicHint} Distractors must be comparable length/plausibility. Do not hand-edit YAML.`;
    }
    else if (type === "open") {
        stub.expected = "[DRAFT] short acceptable answer";
        stub.explanation = "[DRAFT] Short explanation";
        stub.instructions =
            `Replace text and expected short answer(s), then question validate → question add --type open --expected "…".${topicHint} Do not hand-edit YAML.`;
    }
    else {
        stub.instructions =
            `Replace text (and code_template/validation when relevant), then question validate → question add.${topicHint} Do not hand-edit YAML.`;
    }
    return stub;
}
/**
 * Build agent-facing generation context and draft shells (does not write files).
 */
export function generateQuestions(options) {
    const skillId = options.skill.trim();
    if (!skillId) {
        throw new SdmError("VALIDATION_FAILED", "Skill id must not be empty");
    }
    const count = options.count ?? 3;
    if (!Number.isInteger(count) || count < 1 || count > 20) {
        throw new SdmError("VALIDATION_FAILED", "count must be an integer between 1 and 20");
    }
    assertTypeAndMixExclusive(options.type, options.mix);
    const typeMix = options.mix !== undefined ? parseTypeMixPreset(options.mix) : "single";
    const draftTypes = options.type !== undefined
        ? Array.from({ length: count }, () => options.type)
        : assignTypesForMix(typeMix, count);
    const { min, max } = parseDifficultyRange(options.difficultyMin, options.difficultyMax);
    const projectRoot = findProjectRoot(options.startDir);
    assertSkillExists(projectRoot, skillId);
    const skill = loadSkill(projectRoot, skillId);
    const listed = listQuestions({ startDir: projectRoot, skill: skillId });
    const existing = listed.questions;
    const avoidNearIds = existing.map((q) => q.id);
    const relatedSkillIds = [
        ...new Set([...(skill.depends_on ?? []), ...(skill.related_to ?? [])]),
    ];
    let gap;
    let skillWorkItems = [];
    if (options.profile?.trim() && options.level?.trim()) {
        const gapsRun = runCertGaps({
            startDir: projectRoot,
            profile: options.profile.trim(),
            level: options.level.trim(),
        });
        const hit = gapsRun.gaps.find((g) => g.skill === skillId);
        if (hit) {
            gap = {
                status: hit.status,
                questionCount: hit.questionCount,
                depth: hit.depth,
                weight: hit.weight,
                achievedDepth: hit.achievedDepth,
                depthRatio: hit.depthRatio,
                uncoveredTopics: hit.uncoveredTopics,
                missingDifficultyBand: hit.missingDifficultyBand,
                reasons: hit.reasons,
            };
        }
        else {
            gap = undefined;
        }
        skillWorkItems = gapsRun.workItems.filter((w) => w.skill === skillId);
    }
    const band = gap?.missingDifficultyBand;
    const effectiveMin = band ? Math.min(min, band.min) : min;
    const effectiveMax = band ? Math.max(max, band.max) : max;
    const typeSummary = [...new Set(draftTypes)].join(", ");
    const drafts = [];
    if (skillWorkItems.length > 0) {
        for (let i = 0; i < count; i += 1) {
            const item = skillWorkItems[i % skillWorkItems.length];
            const dMin = item.difficultyMin ?? effectiveMin;
            const dMax = item.difficultyMax ?? effectiveMax;
            const difficulty = difficultyForIndex(i % Math.max(skillWorkItems.length, 1), Math.max(skillWorkItems.length, 2), dMin, dMax);
            const type = item.type ??
                draftTypes[i] ??
                "single_choice";
            const topic = item.topic ??
                (gap?.uncoveredTopics?.length
                    ? gap.uncoveredTopics[i % gap.uncoveredTopics.length]
                    : undefined);
            drafts.push(buildStub(skillId, skill.name, i + 1, type, difficulty, {
                mustCoverTopic: topic,
                avoidNearIds,
                relatedSkillIds,
            }));
        }
    }
    else {
        const uncovered = gap?.uncoveredTopics?.length
            ? gap.uncoveredTopics
            : skill.topics ?? [];
        for (let i = 0; i < count; i += 1) {
            const difficulty = difficultyForIndex(i, count, effectiveMin, effectiveMax);
            const topic = uncovered.length > 0 ? uncovered[i % uncovered.length] : undefined;
            drafts.push(buildStub(skillId, skill.name, i + 1, draftTypes[i], difficulty, {
                mustCoverTopic: topic,
                avoidNearIds,
                relatedSkillIds,
            }));
        }
    }
    const briefLines = drafts.map((d) => `- draft ${d.index}: type=${d.type} difficulty=${d.difficulty}` +
        (d.mustCoverTopic ? ` topic=${d.mustCoverTopic}` : ""));
    const agentPrompt = [
        `Generate ${count} assessment question(s) for SDM skill "${skill.id}" (${skill.name}).`,
        skill.description ? `Skill description: ${skill.description}` : null,
        skill.category ? `Category: ${skill.category}` : null,
        skill.topics?.length
            ? `Expected skill topics: ${skill.topics.join(", ")}`
            : null,
        relatedSkillIds.length
            ? `Related skills: ${relatedSkillIds.join(", ")}`
            : null,
        `Type mix: ${typeMix}. Per-draft types: ${drafts.map((d) => d.type).join(", ")} (requested mix types: ${typeSummary}).`,
        `Target difficulty range: ${effectiveMin}..${effectiveMax}.`,
        gap
            ? `Coverage gap status: ${gap.status} (${gap.questionCount} questions; achievedDepth=${gap.achievedDepth}, requiredDepth=${gap.depth}, depthRatio=${gap.depthRatio}; reasons=${(gap.reasons ?? []).join(",") || "—"}).`
            : `Existing questions for skill: ${existing.length} (ok threshold ${MIN_OK_QUESTIONS}).`,
        gap?.uncoveredTopics?.length
            ? `Uncovered topics to prioritize: ${gap.uncoveredTopics.join(", ")}`
            : null,
        skillWorkItems.length
            ? `Work items for this skill: ${skillWorkItems.map((w) => w.reason + (w.topic ? `:${w.topic}` : "")).join(", ")}`
            : null,
        "Per-draft briefs:",
        ...briefLines,
        existing.length > 0
            ? `Avoid duplicating these existing texts (ids: ${avoidNearIds.join(", ")}):\n${existing.map((q) => `- [${q.id}] ${q.text}`).join("\n")}`
            : "No existing questions for this skill yet.",
        "For each draft: fill text; for single_choice/multi_choice provide ≥2 options and 1-based correct index(es); for open provide short expected answer(s) via --expected; set --topic to mustCoverTopic when present.",
        "Quality loop: question validate --json → rewrite on errors/findings → question add --json. Do not invent deferred types or code auto-validators.",
        "Do not hand-edit library YAML.",
    ]
        .filter(Boolean)
        .join("\n");
    return {
        projectRoot,
        typeMix,
        context: {
            skill,
            existingCount: existing.length,
            existingIds: existing.map((q) => q.id),
            existingTexts: existing.map((q) => q.text),
            minOkQuestions: MIN_OK_QUESTIONS,
            gap,
            workItems: skillWorkItems.length > 0 ? skillWorkItems : undefined,
            agentPrompt,
        },
        drafts,
        nextStep: "Fill each draft, run `sdm question validate --json`, rewrite until ok, then `sdm question add` (or MCP). Re-check with `sdm cert gaps --json`.",
    };
}
//# sourceMappingURL=question-generate.js.map