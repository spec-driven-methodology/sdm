import { type AddQuestionInput } from "./question-payload.js";
import { type Question, type Skill } from "./schemas.js";
export type ValidateIssueSeverity = "error" | "finding";
export interface ValidateIssue {
    code: string;
    message: string;
    severity: ValidateIssueSeverity;
}
export interface ValidateQuestionResult {
    ok: boolean;
    projectRoot: string;
    skill: Skill;
    /** Parsed question when structural parse succeeded (may still have policy issues). */
    question?: Question;
    errors: ValidateIssue[];
    findings: ValidateIssue[];
}
/**
 * Dry-run validation of a question draft (no file writes).
 */
export declare function validateQuestionDraft(projectRoot: string, input: AddQuestionInput, options?: {
    excludeQuestionId?: string;
}): ValidateQuestionResult;
export interface ValidateQuestionOptions {
    startDir: string;
    input: AddQuestionInput;
    excludeQuestionId?: string;
}
/** CLI/MCP entry: resolve project root then validate. */
export declare function validateQuestion(options: ValidateQuestionOptions): ValidateQuestionResult;
/** Throw first blocking error as SdmError (for write-path strict). */
export declare function throwIfValidateErrors(result: ValidateQuestionResult): void;
export interface DeepValidateIssue {
    questionId: string;
    skill: string;
    code: string;
    message: string;
    severity: "error" | "finding";
}
export interface DeepValidateQuestionResult {
    projectRoot: string;
    total: number;
    issues: DeepValidateIssue[];
    ok: boolean;
    /** Summary: count of questions per difficulty label. */
    difficultySummary: Record<string, number>;
    /** Count of questions lacking rubric (open/code). */
    rubricMissingCount: number;
}
/** Map difficulty 0..1 to a human label. */
export declare function difficultyLabel(d: number): string;
/**
 * Deep validation over the whole question library: checks consistency
 * between type and payload that per-draft validate cannot see — e.g.
 * `single_choice`/`multi_choice` without `options`, `open` without
 * `expected`/`rubric`, explanations that merely restate the correct option.
 */
export declare function validateQuestionLibraryDeep(projectRoot: string): DeepValidateQuestionResult;
//# sourceMappingURL=question-validate.d.ts.map