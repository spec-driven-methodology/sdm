import type { Question } from "./schemas.js";
export declare const EXPORT_QUESTION_TYPES: readonly ["single_choice", "multi_choice", "open", "code"];
export type ExportQuestionType = (typeof EXPORT_QUESTION_TYPES)[number];
export type ExportTypeFilterMode = "include" | "exclude";
export interface ExportTypeFilter {
    mode: ExportTypeFilterMode;
    types: ExportQuestionType[];
}
export interface ResolveExportTypeFilterInput {
    includeTypes?: string[];
    excludeTypes?: string[];
}
/**
 * Resolve include XOR exclude type filter. Empty/undefined → no filter.
 */
export declare function resolveExportTypeFilter(input: ResolveExportTypeFilterInput): ExportTypeFilter | undefined;
export declare function applyExportTypeFilter(questions: Question[], filter: ExportTypeFilter | undefined): Question[];
//# sourceMappingURL=export-type-filter.d.ts.map