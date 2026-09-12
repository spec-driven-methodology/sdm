import { type CoverageWorkItem, type SkillCoverage } from "./coverage.js";
import type { Question, Skill } from "./schemas.js";
import { type TypeMixPreset } from "./question-type-mix.js";
export interface GenerateQuestionsOptions {
    startDir: string;
    skill: string;
    count?: number;
    /** Inclusive difficulty range 0..1 */
    difficultyMin?: number;
    difficultyMax?: number;
    /** Optional: include gap status for this profile/level */
    profile?: string;
    level?: string;
    /** Homogeneous type — mutually exclusive with `mix` */
    type?: Question["type"];
    /** Type-mix preset — mutually exclusive with `type` */
    mix?: string;
}
export interface QuestionDraftStub {
    index: number;
    skill: string;
    type: Question["type"];
    difficulty: number;
    /** Placeholder — agent MUST replace before `question add` */
    text: string;
    options?: string[];
    /** 1-based index or indices when options present */
    correct?: number | number[];
    /** For open: acceptable short answer(s); persist via question add --expected */
    expected?: string | string[];
    explanation?: string;
    instructions: string;
    /** Prefer covering this skill topic */
    mustCoverTopic?: string;
    /** Existing question ids to avoid paraphrasing */
    avoidNearIds?: string[];
    /** Related ontology skill ids for context */
    relatedSkillIds?: string[];
}
export interface GenerateQuestionsContext {
    skill: Skill;
    existingCount: number;
    existingIds: string[];
    existingTexts: string[];
    minOkQuestions: number;
    gap?: Pick<SkillCoverage, "status" | "questionCount" | "depth" | "weight" | "achievedDepth" | "depthRatio" | "uncoveredTopics" | "missingDifficultyBand" | "reasons">;
    workItems?: CoverageWorkItem[];
    agentPrompt: string;
}
export interface GenerateQuestionsResult {
    projectRoot: string;
    /** Effective mix preset (`single` when homogeneous / default) */
    typeMix: TypeMixPreset;
    context: GenerateQuestionsContext;
    drafts: QuestionDraftStub[];
    nextStep: string;
}
/**
 * Build agent-facing generation context and draft shells (does not write files).
 */
export declare function generateQuestions(options: GenerateQuestionsOptions): GenerateQuestionsResult;
//# sourceMappingURL=question-generate.d.ts.map