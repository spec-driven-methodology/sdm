import type { ContentBasis, Question } from "../schemas.js";
import type { LoadWarning } from "../loaders.js";
export declare const EXPORT_COURSE_SCHEMA: "sdm.export.course/v1";
export declare const COURSE_DEPTHS: readonly ["brief", "standard", "detailed"];
export type CourseDepth = (typeof COURSE_DEPTHS)[number];
export declare const COURSE_FORMATS: readonly ["howto", "notes", "cheatsheet", "course"];
export type CourseFormat = (typeof COURSE_FORMATS)[number];
/** Layout hint for agent prose: one document vs modular lessons. */
export declare const COURSE_LAYOUTS: readonly ["single_doc", "modular_course"];
export type CourseLayout = (typeof COURSE_LAYOUTS)[number];
export declare const COURSE_WARNING_CODES: readonly ["SKILL_DESCRIPTION_THIN", "SKILL_TOPICS_EMPTY", "TOPIC_UNCOVERED_BY_QUESTIONS", "GRAPH_ISOLATED_IN_SCOPE", "GRAPH_CYCLE_FALLBACK", "PRACTICE_THIN", "PRACTICE_MONO_TYPE", "PRACTICE_EMPTY", "QUESTION_EXPLANATION_MISSING", "FORMAT_CONCEPT_DEPRECATED", "PROSE_LOCALE_MIXED", "LESSON_TRUNCATED", "GLOSSARY_TAUTOLOGY", "GLOSSARY_MISSING_TERM", "LESSON_DUPLICATE"];
export type CourseWarningCode = (typeof COURSE_WARNING_CODES)[number];
/** Description shorter than this (trimmed) is considered thin for teaching. */
export declare const SKILL_DESCRIPTION_MIN_CHARS = 40;
export interface CourseWarning {
    code: CourseWarningCode;
    message: string;
    skill?: string;
    topic?: string;
    questionId?: string;
}
export interface CourseContentControls {
    depth: CourseDepth;
    format: CourseFormat;
    includePractice: boolean;
    locale?: string;
}
export interface QuestionAnchor {
    id: string;
    skill: string;
    topics: string[];
    text: string;
    explanation?: string;
    difficulty: number;
    type: Question["type"];
}
export interface TeachingSkillView {
    id: string;
    name: string;
    description: string;
    topics: string[];
    /** Learner-facing labels for topic slugs (topic key → title). */
    topicLabels: Record<string, string>;
    dependsOn: string[];
    relatedTo: string[];
    depth?: number;
    weight?: number;
}
export interface TeachingContext {
    skills: TeachingSkillView[];
    topics: string[];
    questionAnchors: QuestionAnchor[];
    graphEdges: {
        dependsOn: Array<{
            from: string;
            to: string;
        }>;
        relatedTo: Array<{
            from: string;
            to: string;
        }>;
    };
}
export interface CourseGlossaryEntry {
    term: string;
    /** Empty when SDM only seeds candidates. */
    definition: string;
    aliases?: string[];
}
export interface CourseFootnote {
    term: string;
    definition: string;
}
export interface CourseLessonStub {
    id: string;
    topic?: string;
    title: string;
    /** Markdown body; empty when SDM only seeds stubs (agent fills). */
    body: string;
    /** Optional per-lesson term definitions (agent-filled). */
    footnotes?: CourseFootnote[];
    /** Estimated reading/study time in minutes (agent-filled). */
    estimatedMinutes?: number;
}
export declare const COURSE_MODULE_KINDS: readonly ["overview", "skill"];
export type CourseModuleKind = (typeof COURSE_MODULE_KINDS)[number];
/** Synthetic skill id for the leading overview module (not an ontology skill). */
export declare const COURSE_OVERVIEW_SKILL_ID: "course-overview";
export interface CourseModule {
    /** Defaults to `skill` when omitted (older packs). */
    kind?: CourseModuleKind;
    skill: string;
    title: string;
    lessons: CourseLessonStub[];
    practiceQuestionIds: string[];
    /** Prerequisite skill ids the learner should know before this module. */
    prerequisites?: string[];
    /** Learning objectives for the module (agent-filled). */
    learningObjectives?: string[];
}
export interface ExportCourseDocument {
    schemaVersion: typeof EXPORT_COURSE_SCHEMA;
    /** Stable upsert slot for external consumers. */
    id: string;
    profile?: string;
    level?: string;
    title?: string;
    controls: CourseContentControls;
    teachingContext: TeachingContext;
    modules: CourseModule[];
    /** Term candidates / filled glossary for learner-facing packs. */
    glossary?: CourseGlossaryEntry[];
    warnings: CourseWarning[];
    meta: {
        scope: CourseScopeMeta;
        moduleOrder: "depends_on_topo" | "alpha_fallback";
        layout: CourseLayout;
        basis?: ContentBasis;
        /** Content fingerprint (basis hashes without capturedAt). */
        revision?: string;
        /** Per-module content fingerprints: `{ [skillId]: hash }`. */
        revisionByModule?: Record<string, string>;
        /** Optional generation provenance for reproducibility. */
        generation?: {
            model: string;
            promptVersion?: string;
            temperature?: number;
            seed?: number;
            generatedAt: string;
        };
    };
}
export interface CourseScopeMeta {
    mode: "profile_level" | "from_gaps" | "skill" | "topic" | "from_questions" | "topic_in_level";
    profile?: string;
    level?: string;
    skill?: string;
    topic?: string;
    questionIds?: string[];
}
export interface ExportCourseOptions {
    startDir: string;
    profile?: string;
    level?: string;
    /** Limit modules to cert gaps (missing/thin). Requires profile+level. */
    fromGaps?: boolean;
    skill?: string;
    topic?: string;
    fromQuestions?: string[];
    depth?: string;
    format?: string;
    includePractice?: boolean;
    locale?: string;
    /** @internal Used by tests to pass guardrail without filling bodies. */
    planOnly?: boolean;
    /**
     * When true and depth=detailed, fail if critical learning-readiness warnings exist.
     * Default: soft warn only.
     */
    strictContext?: boolean;
}
export interface ExportCourseRun {
    projectRoot: string;
    document: ExportCourseDocument;
    loadWarnings: LoadWarning[];
}
export declare function parseCourseDepth(value: string | undefined): CourseDepth;
export declare function resolveCourseFormat(value: string | undefined): {
    format: CourseFormat;
    deprecatedConcept: boolean;
};
export declare function parseCourseFormat(value: string | undefined): CourseFormat;
export declare function layoutForFormat(format: CourseFormat): CourseLayout;
//# sourceMappingURL=types.d.ts.map