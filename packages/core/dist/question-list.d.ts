import { type LoadWarning } from "./loaders.js";
import type { Question } from "./schemas.js";
export interface ListQuestionsOptions {
    startDir: string;
    skill?: string;
}
export interface ListQuestionsRun {
    projectRoot: string;
    questions: Question[];
    warnings: LoadWarning[];
    skill?: string;
}
/**
 * List library questions, optionally filtered by skill id.
 */
export declare function listQuestions(options: ListQuestionsOptions): ListQuestionsRun;
//# sourceMappingURL=question-list.d.ts.map