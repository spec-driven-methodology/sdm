import { type AddQuestionInput } from "./question-payload.js";
import { type ValidateIssue } from "./question-validate.js";
import type { Question } from "./schemas.js";
export type { AddQuestionInput } from "./question-payload.js";
export interface AddQuestionResult {
    question: Question;
    path: string;
    skill: string;
    /** Soft writeGate / soft distractor findings that did not block the write. */
    warnings?: ValidateIssue[];
}
export declare function generateQuestionId(projectRoot: string, skillId: string): string;
/**
 * Validate and write a question YAML into the methodology library.
 */
export declare function addQuestion(projectRoot: string, input: AddQuestionInput): AddQuestionResult;
/** @internal test helper — rebuild payload without validate */
export declare function __testBuildPayload(input: AddQuestionInput, id: string): Record<string, unknown>;
//# sourceMappingURL=question-add.d.ts.map