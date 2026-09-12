import type { Level, Question, QualityConfig, Skill } from "./schemas.js";
/** PoC heuristic: enough questions per required skill. */
export declare const MIN_OK_QUESTIONS = 3;
/** Depth is considered met when achievedDepth / requiredDepth >= this ratio. */
export declare const DEPTH_OK_RATIO = 0.9;
export type CoverageStatus = "missing" | "thin" | "ok";
export interface CoverageWorkItem {
    skill: string;
    topic?: string;
    type?: Question["type"];
    difficultyMin?: number;
    difficultyMax?: number;
    reason: string;
}
export interface SkillCoverage {
    skill: string;
    depth: number;
    weight: number;
    depthBand: string;
    depthLabel: string;
    questionCount: number;
    /** Max difficulty among questions for this skill (0 if none). */
    achievedDepth: number;
    /** achievedDepth / depth (1 if depth is 0 and there is at least one question). */
    depthRatio: number;
    /** Skill topics not covered by any question topic (when skill topics are set). */
    uncoveredTopics: string[];
    /** Suggested difficulty band to close a depth gap. */
    missingDifficultyBand?: {
        min: number;
        max: number;
    };
    /** Blueprint: why status is not ok (empty in legacy when ok). */
    reasons: string[];
    status: CoverageStatus;
    statusSymbol: "❌" | "⚠️" | "✅";
}
export interface CoverageResult {
    profile?: string;
    level: string;
    title: string;
    skills: SkillCoverage[];
    hasMissing: boolean;
    /** True when any skill is thin due to count or depth (not missing). */
    hasThin: boolean;
    minOkQuestions: number;
    /** Blueprint work queue (empty in legacy). */
    workItems: CoverageWorkItem[];
    coverageMode: QualityConfig["coverageMode"];
}
export declare function statusForCount(count: number, minOk?: number): CoverageStatus;
export declare function countQuestionsBySkill(questions: Question[]): Map<string, number>;
export declare function maxDifficultyBySkill(questions: Question[]): Map<string, number>;
export declare function depthRatio(achieved: number, required: number, questionCount: number): number;
export declare function computeCoverage(level: Level, questions: Question[], options?: {
    profile?: string;
    minOkQuestions?: number;
    /** Optional skill metadata for topic gaps. */
    skillsById?: Map<string, Skill>;
    quality?: QualityConfig;
}): CoverageResult;
//# sourceMappingURL=coverage.d.ts.map