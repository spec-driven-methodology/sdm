import { z } from "zod";
export declare const SkillSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    depends_on: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    related_to: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    topics: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Human-readable labels for topic slugs (topic key → learner-facing title). */
    topic_labels: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    description: string;
    depends_on: string[];
    related_to: string[];
    topics: string[];
    topic_labels: Record<string, string>;
    category?: string | undefined;
}, {
    name: string;
    id: string;
    description?: string | undefined;
    category?: string | undefined;
    depends_on?: string[] | undefined;
    related_to?: string[] | undefined;
    topics?: string[] | undefined;
    topic_labels?: Record<string, string> | undefined;
}>;
/** Content basis stamped on questions / exports — not wire schemaVersion. */
export declare const ContentBasisSchema: z.ZodObject<{
    skills: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    level: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        hash: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        hash: string;
    }, {
        id: string;
        hash: string;
    }>>;
    capturedAt: z.ZodString;
    /** Truncated hashes of library/terms entries (id → hash). */
    terms: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    capturedAt: string;
    skills?: Record<string, string> | undefined;
    level?: {
        id: string;
        hash: string;
    } | undefined;
    terms?: Record<string, string> | undefined;
}, {
    capturedAt: string;
    skills?: Record<string, string> | undefined;
    level?: {
        id: string;
        hash: string;
    } | undefined;
    terms?: Record<string, string> | undefined;
}>;
/** Single topic slug in the project-wide topic registry. */
export declare const TopicSchema: z.ZodObject<{
    /** Slug used as identity in skill.topics / question.topics / lesson.topic. */
    id: z.ZodString;
    /** Learner-facing human label («HTTP-клиент для LLM»). */
    label: z.ZodDefault<z.ZodString>;
    /** Optional definition for glossary seeding / reference. */
    definition: z.ZodDefault<z.ZodString>;
    /** Aliases / synonyms for matching and display. */
    aliases: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Skill ids that declare this topic. */
    skills: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    skills: string[];
    label: string;
    definition: string;
    aliases: string[];
}, {
    id: string;
    skills?: string[] | undefined;
    label?: string | undefined;
    definition?: string | undefined;
    aliases?: string[] | undefined;
}>;
export declare const TermKindSchema: z.ZodEnum<["concept", "product"]>;
export declare const TermSchema: z.ZodObject<{
    id: z.ZodString;
    term: z.ZodString;
    definition: z.ZodString;
    aliases: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Optional skill ids this term relates to (for kit glossary filtering). */
    skills: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    kind: z.ZodDefault<z.ZodEnum<["concept", "product"]>>;
    meta: z.ZodOptional<z.ZodObject<{
        basis: z.ZodOptional<z.ZodObject<{
            skills: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            level: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                hash: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                hash: string;
            }, {
                id: string;
                hash: string;
            }>>;
            capturedAt: z.ZodString;
            /** Truncated hashes of library/terms entries (id → hash). */
            terms: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            capturedAt: string;
            skills?: Record<string, string> | undefined;
            level?: {
                id: string;
                hash: string;
            } | undefined;
            terms?: Record<string, string> | undefined;
        }, {
            capturedAt: string;
            skills?: Record<string, string> | undefined;
            level?: {
                id: string;
                hash: string;
            } | undefined;
            terms?: Record<string, string> | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        basis?: {
            capturedAt: string;
            skills?: Record<string, string> | undefined;
            level?: {
                id: string;
                hash: string;
            } | undefined;
            terms?: Record<string, string> | undefined;
        } | undefined;
    }, {
        basis?: {
            capturedAt: string;
            skills?: Record<string, string> | undefined;
            level?: {
                id: string;
                hash: string;
            } | undefined;
            terms?: Record<string, string> | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    skills: string[];
    definition: string;
    aliases: string[];
    term: string;
    kind: "concept" | "product";
    meta?: {
        basis?: {
            capturedAt: string;
            skills?: Record<string, string> | undefined;
            level?: {
                id: string;
                hash: string;
            } | undefined;
            terms?: Record<string, string> | undefined;
        } | undefined;
    } | undefined;
}, {
    id: string;
    definition: string;
    term: string;
    skills?: string[] | undefined;
    aliases?: string[] | undefined;
    kind?: "concept" | "product" | undefined;
    meta?: {
        basis?: {
            capturedAt: string;
            skills?: Record<string, string> | undefined;
            level?: {
                id: string;
                hash: string;
            } | undefined;
            terms?: Record<string, string> | undefined;
        } | undefined;
    } | undefined;
}>;
export declare const QuestionSchema: z.ZodObject<{
    id: z.ZodString;
    skill: z.ZodString;
    difficulty: z.ZodNumber;
    type: z.ZodEnum<["single_choice", "multi_choice", "code", "open"]>;
    text: z.ZodString;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    correct: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>>;
    /** Acceptable short answers for type=open (exact match after normalize). */
    expected: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    explanation: z.ZodOptional<z.ZodString>;
    code_template: z.ZodOptional<z.ZodString>;
    topics: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Probe evidence type (open/code interview questions). */
    evidence: z.ZodOptional<z.ZodEnum<["knowledge", "skill", "artifact"]>>;
    /** Minimum mastery depth (0..1) this probe can attest. */
    min_depth: z.ZodOptional<z.ZodNumber>;
    /** Interview red flags — wrong answers / anti-patterns. */
    red_flags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /** Scored rubric rows (0–3), separate from L-band depth labels. */
    rubric: z.ZodDefault<z.ZodArray<z.ZodObject<{
        score: z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>]>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        score: 0 | 1 | 2 | 3;
    }, {
        description: string;
        score: 0 | 1 | 2 | 3;
    }>, "many">>;
    validation: z.ZodOptional<z.ZodObject<{
        criteria: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        criteria?: string[] | undefined;
    }, {
        criteria?: string[] | undefined;
    }>>;
    /** Optional provenance / freshness stamp (content basis hashes). */
    meta: z.ZodOptional<z.ZodObject<{
        basis: z.ZodOptional<z.ZodObject<{
            skills: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            level: z.ZodOptional<z.ZodObject<{
                id: z.ZodString;
                hash: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                hash: string;
            }, {
                id: string;
                hash: string;
            }>>;
            capturedAt: z.ZodString;
            /** Truncated hashes of library/terms entries (id → hash). */
            terms: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            capturedAt: string;
            skills?: Record<string, string> | undefined;
            level?: {
                id: string;
                hash: string;
            } | undefined;
            terms?: Record<string, string> | undefined;
        }, {
            capturedAt: string;
            skills?: Record<string, string> | undefined;
            level?: {
                id: string;
                hash: string;
            } | undefined;
            terms?: Record<string, string> | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        basis?: {
            capturedAt: string;
            skills?: Record<string, string> | undefined;
            level?: {
                id: string;
                hash: string;
            } | undefined;
            terms?: Record<string, string> | undefined;
        } | undefined;
    }, {
        basis?: {
            capturedAt: string;
            skills?: Record<string, string> | undefined;
            level?: {
                id: string;
                hash: string;
            } | undefined;
            terms?: Record<string, string> | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "code" | "single_choice" | "multi_choice" | "open";
    id: string;
    topics: string[];
    skill: string;
    difficulty: number;
    text: string;
    red_flags: string[];
    rubric: {
        description: string;
        score: 0 | 1 | 2 | 3;
    }[];
    expected?: string | string[] | undefined;
    options?: string[] | undefined;
    validation?: {
        criteria?: string[] | undefined;
    } | undefined;
    meta?: {
        basis?: {
            capturedAt: string;
            skills?: Record<string, string> | undefined;
            level?: {
                id: string;
                hash: string;
            } | undefined;
            terms?: Record<string, string> | undefined;
        } | undefined;
    } | undefined;
    correct?: number | number[] | undefined;
    explanation?: string | undefined;
    code_template?: string | undefined;
    evidence?: "skill" | "knowledge" | "artifact" | undefined;
    min_depth?: number | undefined;
}, {
    type: "code" | "single_choice" | "multi_choice" | "open";
    id: string;
    skill: string;
    difficulty: number;
    text: string;
    expected?: string | string[] | undefined;
    options?: string[] | undefined;
    validation?: {
        criteria?: string[] | undefined;
    } | undefined;
    topics?: string[] | undefined;
    meta?: {
        basis?: {
            capturedAt: string;
            skills?: Record<string, string> | undefined;
            level?: {
                id: string;
                hash: string;
            } | undefined;
            terms?: Record<string, string> | undefined;
        } | undefined;
    } | undefined;
    correct?: number | number[] | undefined;
    explanation?: string | undefined;
    code_template?: string | undefined;
    evidence?: "skill" | "knowledge" | "artifact" | undefined;
    min_depth?: number | undefined;
    red_flags?: string[] | undefined;
    rubric?: {
        description: string;
        score: 0 | 1 | 2 | 3;
    }[] | undefined;
}>;
export declare const ProfileSchema: z.ZodObject<{
    profile: z.ZodString;
    title: z.ZodString;
    levels: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    profile: string;
    title: string;
    levels: string[];
}, {
    profile: string;
    title: string;
    levels?: string[] | undefined;
}>;
export declare const RequirementSchema: z.ZodObject<{
    skill: z.ZodString;
    depth: z.ZodNumber;
    weight: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    skill: string;
    depth: number;
    weight: number;
}, {
    skill: string;
    depth: number;
    weight: number;
}>;
export declare const LevelSchema: z.ZodObject<{
    level: z.ZodString;
    title: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    profile: z.ZodOptional<z.ZodString>;
    requirements: z.ZodDefault<z.ZodArray<z.ZodObject<{
        skill: z.ZodString;
        depth: z.ZodNumber;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        skill: string;
        depth: number;
        weight: number;
    }, {
        skill: string;
        depth: number;
        weight: number;
    }>, "many">>;
    threshold: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description: string;
    level: string;
    title: string;
    requirements: {
        skill: string;
        depth: number;
        weight: number;
    }[];
    threshold: number;
    profile?: string | undefined;
}, {
    level: string;
    title: string;
    description?: string | undefined;
    profile?: string | undefined;
    requirements?: {
        skill: string;
        depth: number;
        weight: number;
    }[] | undefined;
    threshold?: number | undefined;
}>;
export declare const DistractorQualityModeSchema: z.ZodEnum<["off", "soft", "strict"]>;
export declare const CoverageModeSchema: z.ZodEnum<["legacy", "blueprint"]>;
export declare const GateModeSchema: z.ZodEnum<["off", "soft", "strict"]>;
export declare const QualityConfigSchema: z.ZodDefault<z.ZodObject<{
    /** Choice distractor quality policy (orthogonal to cert threshold). */
    distractorQuality: z.ZodDefault<z.ZodEnum<["off", "soft", "strict"]>>;
    /** Distractor len must lie in [C·R, C/R] relative to correct length C. */
    lengthBandRatio: z.ZodDefault<z.ZodNumber>;
    /** Fraction of choice Q with min(correct)==1 that triggers position bias. */
    positionBiasThreshold: z.ZodDefault<z.ZodNumber>;
    /** Minimum choice-question sample before position-bias finding. */
    minChoiceSample: z.ZodDefault<z.ZodNumber>;
    /** legacy = count+max(difficulty); blueprint = topics/bands/types too. */
    coverageMode: z.ZodDefault<z.ZodEnum<["legacy", "blueprint"]>>;
    /** Write-path policy gate for add/validate (topics, near-dup, explanation, …). */
    writeGate: z.ZodDefault<z.ZodEnum<["off", "soft", "strict"]>>;
    /** Min description/topics gate on skill add. */
    skillGate: z.ZodDefault<z.ZodEnum<["off", "soft", "strict"]>>;
    /** Course export readiness gate: strict blocks thin/isolated/uncov. content. */
    courseGate: z.ZodDefault<z.ZodEnum<["off", "soft", "strict"]>>;
    /** Jaccard threshold for same-skill near-duplicate detection. */
    nearDupThreshold: z.ZodDefault<z.ZodNumber>;
    /** When true and writeGate soft/strict, missing explanation is a policy issue. */
    requireExplanation: z.ZodDefault<z.ZodBoolean>;
    /** skillGate: minimum topics length (default 3). */
    minSkillTopics: z.ZodDefault<z.ZodNumber>;
    /** skillGate: minimum description character length (default 20). */
    minSkillDescriptionLength: z.ZodDefault<z.ZodNumber>;
    /** Blueprint: required fraction of skill topics covered by question topics. */
    minTopicsCoveredRatio: z.ZodDefault<z.ZodNumber>;
    /** Blueprint: min distinct question types (0 = disabled). */
    minDistinctTypes: z.ZodDefault<z.ZodNumber>;
    /** Blueprint: override min questions (0 = use MIN_OK_QUESTIONS). */
    minQuestions: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    distractorQuality: "off" | "soft" | "strict";
    lengthBandRatio: number;
    positionBiasThreshold: number;
    minChoiceSample: number;
    coverageMode: "legacy" | "blueprint";
    writeGate: "off" | "soft" | "strict";
    skillGate: "off" | "soft" | "strict";
    courseGate: "off" | "soft" | "strict";
    nearDupThreshold: number;
    requireExplanation: boolean;
    minSkillTopics: number;
    minSkillDescriptionLength: number;
    minTopicsCoveredRatio: number;
    minDistinctTypes: number;
    minQuestions: number;
}, {
    distractorQuality?: "off" | "soft" | "strict" | undefined;
    lengthBandRatio?: number | undefined;
    positionBiasThreshold?: number | undefined;
    minChoiceSample?: number | undefined;
    coverageMode?: "legacy" | "blueprint" | undefined;
    writeGate?: "off" | "soft" | "strict" | undefined;
    skillGate?: "off" | "soft" | "strict" | undefined;
    courseGate?: "off" | "soft" | "strict" | undefined;
    nearDupThreshold?: number | undefined;
    requireExplanation?: boolean | undefined;
    minSkillTopics?: number | undefined;
    minSkillDescriptionLength?: number | undefined;
    minTopicsCoveredRatio?: number | undefined;
    minDistinctTypes?: number | undefined;
    minQuestions?: number | undefined;
}>>;
export type QualityConfig = z.infer<typeof QualityConfigSchema>;
export type CoverageMode = z.infer<typeof CoverageModeSchema>;
export type GateMode = z.infer<typeof GateModeSchema>;
export declare const SdmConfigSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    name: z.ZodString;
    search: z.ZodDefault<z.ZodObject<{
        /** none | lancedb — semantic index over skills/questions */
        provider: z.ZodDefault<z.ZodEnum<["none", "lancedb"]>>;
        embedding_model: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider: "none" | "lancedb";
        embedding_model: string;
    }, {
        provider?: "none" | "lancedb" | undefined;
        embedding_model?: string | undefined;
    }>>;
    logging: z.ZodOptional<z.ZodObject<{
        /** Append NDJSON actions under .sdm/logs/ (default on) */
        enabled: z.ZodDefault<z.ZodBoolean>;
        maxBytes: z.ZodDefault<z.ZodNumber>;
        maxFiles: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        maxBytes: number;
        maxFiles: number;
    }, {
        enabled?: boolean | undefined;
        maxBytes?: number | undefined;
        maxFiles?: number | undefined;
    }>>;
    quality: z.ZodOptional<z.ZodDefault<z.ZodObject<{
        /** Choice distractor quality policy (orthogonal to cert threshold). */
        distractorQuality: z.ZodDefault<z.ZodEnum<["off", "soft", "strict"]>>;
        /** Distractor len must lie in [C·R, C/R] relative to correct length C. */
        lengthBandRatio: z.ZodDefault<z.ZodNumber>;
        /** Fraction of choice Q with min(correct)==1 that triggers position bias. */
        positionBiasThreshold: z.ZodDefault<z.ZodNumber>;
        /** Minimum choice-question sample before position-bias finding. */
        minChoiceSample: z.ZodDefault<z.ZodNumber>;
        /** legacy = count+max(difficulty); blueprint = topics/bands/types too. */
        coverageMode: z.ZodDefault<z.ZodEnum<["legacy", "blueprint"]>>;
        /** Write-path policy gate for add/validate (topics, near-dup, explanation, …). */
        writeGate: z.ZodDefault<z.ZodEnum<["off", "soft", "strict"]>>;
        /** Min description/topics gate on skill add. */
        skillGate: z.ZodDefault<z.ZodEnum<["off", "soft", "strict"]>>;
        /** Course export readiness gate: strict blocks thin/isolated/uncov. content. */
        courseGate: z.ZodDefault<z.ZodEnum<["off", "soft", "strict"]>>;
        /** Jaccard threshold for same-skill near-duplicate detection. */
        nearDupThreshold: z.ZodDefault<z.ZodNumber>;
        /** When true and writeGate soft/strict, missing explanation is a policy issue. */
        requireExplanation: z.ZodDefault<z.ZodBoolean>;
        /** skillGate: minimum topics length (default 3). */
        minSkillTopics: z.ZodDefault<z.ZodNumber>;
        /** skillGate: minimum description character length (default 20). */
        minSkillDescriptionLength: z.ZodDefault<z.ZodNumber>;
        /** Blueprint: required fraction of skill topics covered by question topics. */
        minTopicsCoveredRatio: z.ZodDefault<z.ZodNumber>;
        /** Blueprint: min distinct question types (0 = disabled). */
        minDistinctTypes: z.ZodDefault<z.ZodNumber>;
        /** Blueprint: override min questions (0 = use MIN_OK_QUESTIONS). */
        minQuestions: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        distractorQuality: "off" | "soft" | "strict";
        lengthBandRatio: number;
        positionBiasThreshold: number;
        minChoiceSample: number;
        coverageMode: "legacy" | "blueprint";
        writeGate: "off" | "soft" | "strict";
        skillGate: "off" | "soft" | "strict";
        courseGate: "off" | "soft" | "strict";
        nearDupThreshold: number;
        requireExplanation: boolean;
        minSkillTopics: number;
        minSkillDescriptionLength: number;
        minTopicsCoveredRatio: number;
        minDistinctTypes: number;
        minQuestions: number;
    }, {
        distractorQuality?: "off" | "soft" | "strict" | undefined;
        lengthBandRatio?: number | undefined;
        positionBiasThreshold?: number | undefined;
        minChoiceSample?: number | undefined;
        coverageMode?: "legacy" | "blueprint" | undefined;
        writeGate?: "off" | "soft" | "strict" | undefined;
        skillGate?: "off" | "soft" | "strict" | undefined;
        courseGate?: "off" | "soft" | "strict" | undefined;
        nearDupThreshold?: number | undefined;
        requireExplanation?: boolean | undefined;
        minSkillTopics?: number | undefined;
        minSkillDescriptionLength?: number | undefined;
        minTopicsCoveredRatio?: number | undefined;
        minDistinctTypes?: number | undefined;
        minQuestions?: number | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    search: {
        provider: "none" | "lancedb";
        embedding_model: string;
    };
    name: string;
    version: string;
    logging?: {
        enabled: boolean;
        maxBytes: number;
        maxFiles: number;
    } | undefined;
    quality?: {
        distractorQuality: "off" | "soft" | "strict";
        lengthBandRatio: number;
        positionBiasThreshold: number;
        minChoiceSample: number;
        coverageMode: "legacy" | "blueprint";
        writeGate: "off" | "soft" | "strict";
        skillGate: "off" | "soft" | "strict";
        courseGate: "off" | "soft" | "strict";
        nearDupThreshold: number;
        requireExplanation: boolean;
        minSkillTopics: number;
        minSkillDescriptionLength: number;
        minTopicsCoveredRatio: number;
        minDistinctTypes: number;
        minQuestions: number;
    } | undefined;
}, {
    name: string;
    search?: {
        provider?: "none" | "lancedb" | undefined;
        embedding_model?: string | undefined;
    } | undefined;
    version?: string | undefined;
    logging?: {
        enabled?: boolean | undefined;
        maxBytes?: number | undefined;
        maxFiles?: number | undefined;
    } | undefined;
    quality?: {
        distractorQuality?: "off" | "soft" | "strict" | undefined;
        lengthBandRatio?: number | undefined;
        positionBiasThreshold?: number | undefined;
        minChoiceSample?: number | undefined;
        coverageMode?: "legacy" | "blueprint" | undefined;
        writeGate?: "off" | "soft" | "strict" | undefined;
        skillGate?: "off" | "soft" | "strict" | undefined;
        courseGate?: "off" | "soft" | "strict" | undefined;
        nearDupThreshold?: number | undefined;
        requireExplanation?: boolean | undefined;
        minSkillTopics?: number | undefined;
        minSkillDescriptionLength?: number | undefined;
        minTopicsCoveredRatio?: number | undefined;
        minDistinctTypes?: number | undefined;
        minQuestions?: number | undefined;
    } | undefined;
}>;
export type Skill = z.infer<typeof SkillSchema>;
export type Term = z.infer<typeof TermSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type TermKind = z.infer<typeof TermKindSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Level = z.infer<typeof LevelSchema>;
export type ContentBasis = z.infer<typeof ContentBasisSchema>;
export type SdmConfig = z.infer<typeof SdmConfigSchema>;
//# sourceMappingURL=schemas.d.ts.map