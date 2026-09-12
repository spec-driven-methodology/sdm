import { type LoadWarning } from "./loaders.js";
import { type CoverageResult } from "./coverage.js";
export interface CertCoverageOptions {
    startDir: string;
    profile: string;
    level: string;
    team?: string;
}
export interface CertCoverageRun {
    projectRoot: string;
    result: CoverageResult;
    warnings: LoadWarning[];
    team?: string;
}
/**
 * End-to-end coverage for a methodology project (used by CLI).
 */
export declare function runCertCoverage(options: CertCoverageOptions): CertCoverageRun;
//# sourceMappingURL=cert-coverage.d.ts.map