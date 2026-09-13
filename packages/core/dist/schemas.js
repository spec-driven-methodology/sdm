import { z } from "zod";
export const SkillSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().default(""),
    /** Тип узла онтологии: skill, concept, topic, talk... Открытый набор. */
    kind: z.string().default("skill"),
    category: z.string().optional(),
    depends_on: z.array(z.string()).default([]),
    related_to: z.array(z.string()).default([]),
    topics: z.array(z.string()).default([]),
    /** Human-readable labels for topic slugs (topic key → learner-facing title). */
    topic_labels: z.record(z.string(), z.string().min(1)).default({}),
});
/** Content basis stamped on questions / exports — not wire schemaVersion. */
export const ContentBasisSchema = z.object({
    skills: z.record(z.string(), z.string().min(1)).optional(),
    level: z
        .object({
        id: z.string().min(1),
        hash: z.string().min(1),
    })
        .optional(),
    capturedAt: z.string().min(1),
    /** Truncated hashes of library/terms entries (id → hash). */
    terms: z.record(z.string(), z.string().min(1)).optional(),
});
/** Single topic slug in the project-wide topic registry. */
export const TopicSchema = z.object({
    /** Slug used as identity in skill.topics / question.topics / lesson.topic. */
    id: z.string().min(1),
    /** Learner-facing human label («HTTP-клиент для LLM»). */
    label: z.string().default(""),
    /** Optional definition for glossary seeding / reference. */
    definition: z.string().default(""),
    /** Aliases / synonyms for matching and display. */
    aliases: z.array(z.string()).default([]),
    /** Skill ids that declare this topic. */
    skills: z.array(z.string()).default([]),
});
export const TermKindSchema = z.enum(["concept", "product"]);
export const TermSchema = z.object({
    id: z.string().min(1),
    term: z.string().min(1),
    definition: z.string().min(1),
    aliases: z.array(z.string()).default([]),
    /** Optional skill ids this term relates to (for kit glossary filtering). */
    skills: z.array(z.string()).default([]),
    kind: TermKindSchema.default("concept"),
    meta: z
        .object({
        basis: ContentBasisSchema.optional(),
    })
        .optional(),
});
export const QuestionSchema = z.object({
    id: z.string().min(1),
    skill: z.string().min(1),
    difficulty: z.number().min(0).max(1),
    type: z.enum(["single_choice", "multi_choice", "code", "open"]),
    text: z.string().min(1),
    options: z.array(z.string()).optional(),
    correct: z.union([z.number(), z.array(z.number())]).optional(),
    /** Acceptable short answers for type=open (exact match after normalize). */
    expected: z
        .union([z.string().min(1), z.array(z.string().min(1)).min(1)])
        .optional(),
    explanation: z.string().optional(),
    code_template: z.string().optional(),
    topics: z.array(z.string()).default([]),
    /** Probe evidence type (open/code interview questions). */
    evidence: z.enum(["knowledge", "skill", "artifact"]).optional(),
    /** Minimum mastery depth (0..1) this probe can attest. */
    min_depth: z.number().min(0).max(1).optional(),
    /** Interview red flags — wrong answers / anti-patterns. */
    red_flags: z.array(z.string()).default([]),
    /** Scored rubric rows (0–3), separate from L-band depth labels. */
    rubric: z
        .array(z.object({
        score: z.union([
            z.literal(0),
            z.literal(1),
            z.literal(2),
            z.literal(3),
        ]),
        description: z.string().min(1),
    }))
        .default([]),
    validation: z
        .object({
        criteria: z.array(z.string()).optional(),
    })
        .optional(),
    /** Optional provenance / freshness stamp (content basis hashes). */
    meta: z
        .object({
        basis: ContentBasisSchema.optional(),
    })
        .optional(),
});
export const ProfileSchema = z.object({
    profile: z.string().min(1),
    title: z.string().min(1),
    levels: z.array(z.string()).default([]),
});
export const RequirementSchema = z.object({
    skill: z.string().min(1),
    depth: z.number().min(0).max(1),
    weight: z.number().min(0).max(1),
});
export const LevelSchema = z.object({
    level: z.string().min(1),
    title: z.string().min(1),
    description: z.string().default(""),
    profile: z.string().optional(),
    requirements: z.array(RequirementSchema).default([]),
    threshold: z.number().min(0).max(1).default(0.7),
});
export const DistractorQualityModeSchema = z.enum(["off", "soft", "strict"]);
export const CoverageModeSchema = z.enum(["legacy", "blueprint"]);
export const GateModeSchema = z.enum(["off", "soft", "strict"]);
const defaultQuality = {
    distractorQuality: "off",
    lengthBandRatio: 0.5,
    positionBiasThreshold: 0.6,
    minChoiceSample: 5,
    coverageMode: "legacy",
    writeGate: "off",
    skillGate: "off",
    courseGate: "off",
    nearDupThreshold: 0.85,
    requireExplanation: false,
    minSkillTopics: 3,
    minSkillDescriptionLength: 20,
    minTopicsCoveredRatio: 1,
    minDistinctTypes: 0,
    minQuestions: 0,
};
export const QualityConfigSchema = z
    .object({
    /** Choice distractor quality policy (orthogonal to cert threshold). */
    distractorQuality: DistractorQualityModeSchema.default("off"),
    /** Distractor len must lie in [C·R, C/R] relative to correct length C. */
    lengthBandRatio: z.number().gt(0).lt(1).default(0.5),
    /** Fraction of choice Q with min(correct)==1 that triggers position bias. */
    positionBiasThreshold: z.number().min(0).max(1).default(0.6),
    /** Minimum choice-question sample before position-bias finding. */
    minChoiceSample: z.number().int().positive().default(5),
    /** legacy = count+max(difficulty); blueprint = topics/bands/types too. */
    coverageMode: CoverageModeSchema.default("legacy"),
    /** Write-path policy gate for add/validate (topics, near-dup, explanation, …). */
    writeGate: GateModeSchema.default("off"),
    /** Min description/topics gate on skill add. */
    skillGate: GateModeSchema.default("off"),
    /** Course export readiness gate: strict blocks thin/isolated/uncov. content. */
    courseGate: GateModeSchema.default("off"),
    /** Jaccard threshold for same-skill near-duplicate detection. */
    nearDupThreshold: z.number().min(0).max(1).default(0.85),
    /** When true and writeGate soft/strict, missing explanation is a policy issue. */
    requireExplanation: z.boolean().default(false),
    /** skillGate: minimum topics length (default 3). */
    minSkillTopics: z.number().int().nonnegative().default(3),
    /** skillGate: minimum description character length (default 20). */
    minSkillDescriptionLength: z.number().int().nonnegative().default(20),
    /** Blueprint: required fraction of skill topics covered by question topics. */
    minTopicsCoveredRatio: z.number().min(0).max(1).default(1),
    /** Blueprint: min distinct question types (0 = disabled). */
    minDistinctTypes: z.number().int().nonnegative().default(0),
    /** Blueprint: override min questions (0 = use MIN_OK_QUESTIONS). */
    minQuestions: z.number().int().nonnegative().default(0),
})
    .default(defaultQuality);
export const SdmConfigSchema = z.object({
    version: z.string().default("0.1"),
    name: z.string().min(1),
    search: z
        .object({
        /** none | lancedb — semantic index over skills/questions */
        provider: z.enum(["none", "lancedb"]).default("none"),
        embedding_model: z.string().default("Xenova/all-MiniLM-L6-v2"),
    })
        .default({
        provider: "none",
        embedding_model: "Xenova/all-MiniLM-L6-v2",
    }),
    logging: z
        .object({
        /** Append NDJSON actions under .sdm/logs/ (default on) */
        enabled: z.boolean().default(true),
        maxBytes: z.number().int().positive().default(2_097_152),
        maxFiles: z.number().int().positive().default(5),
    })
        .optional(),
    quality: QualityConfigSchema.optional(),
});
//# sourceMappingURL=schemas.js.map