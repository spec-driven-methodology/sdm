import type { Question } from "./schemas.js";
export interface ExportQuestionFilter {
    mode: "include";
    ids: string[];
}
export interface ResolveExportQuestionFilterInput {
    includeQuestions?: string[];
}
/**
 * Resolve question-id allowlist. Empty/undefined → no filter.
 */
export declare function resolveExportQuestionFilter(input: ResolveExportQuestionFilterInput): ExportQuestionFilter | undefined;
/**
 * Keep only allowlisted question ids. Hard-fail if any requested id is missing
 * from the current candidate set.
 */
export declare function applyExportQuestionFilter(questions: Question[], filter: ExportQuestionFilter | undefined): Question[];
//# sourceMappingURL=export-question-filter.d.ts.map