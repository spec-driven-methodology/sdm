import type { Question, Skill } from "../schemas.js";
import { type CourseModule, type CourseWarning } from "./types.js";
/**
 * Detect likely text truncation in a lesson body.
 * Returns true when the body looks cut off mid-sentence.
 */
export declare function detectTruncation(body: string): boolean;
export declare const TRUNCATION_WARNING_CODE: "LESSON_TRUNCATED";
/**
 * Soft heuristic: Cyrillic + Latin word-like tokens outside fenced code.
 * Used when lesson bodies are non-empty (agent-filled packs).
 */
export declare function detectProseLocaleMixed(body: string): boolean;
export declare function collectProseLocaleWarnings(modules: CourseModule[]): CourseWarning[];
export declare function isCriticalWarning(w: CourseWarning): boolean;
export interface CollectLearningWarningsInput {
    skills: Skill[];
    questionsBySkill: Map<string, Question[]>;
    scopedSkillIds: string[];
    cycleFallback: boolean;
    includePractice: boolean;
    /** Optional glossary entries to validate. */
    glossary?: Array<{
        term: string;
        definition: string;
        aliases?: string[];
    }>;
}
/**
 * Collect learning-readiness quality warnings from TeachingContext.
 * All codes are defined in COURSE_WARNING_CODES. Some may become errors
 * when `courseGate` is strict (see course-gate.ts).
 */
export declare function collectLearningWarnings(input: CollectLearningWarningsInput): CourseWarning[];
/**
 * Scan lesson bodies for technical terms (topics, concept words) that appear
 * but are not defined in the course glossary. Only considers words ≥4 chars
 * that match topic slugs or look like foreign/technical terms.
 */
export declare function collectGlossaryMissingTerms(modules: CourseModule[], glossaryTerms: string[], topicSlugs: string[]): CourseWarning[];
/**
 * Detect near-duplicate lesson bodies within the same module/skill.
 * Uses jaccardSimilarity; threshold=0.7 means >70% token overlap.
 */
export declare function collectDuplicateLessons(modules: CourseModule[], threshold?: number): CourseWarning[];
//# sourceMappingURL=warnings.d.ts.map