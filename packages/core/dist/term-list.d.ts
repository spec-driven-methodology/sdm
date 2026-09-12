import { type LoadWarning } from "./loaders.js";
import type { Term } from "./schemas.js";
export interface ListTermsOptions {
    startDir: string;
    skill?: string;
}
export interface ListTermsRun {
    projectRoot: string;
    terms: Term[];
    warnings: LoadWarning[];
    skill?: string;
}
export declare function listTerms(options: ListTermsOptions): ListTermsRun;
//# sourceMappingURL=term-list.d.ts.map