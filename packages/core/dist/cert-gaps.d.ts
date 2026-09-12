import { type CertCoverageOptions, type CertCoverageRun } from "./cert-coverage.js";
import type { CoverageWorkItem, SkillCoverage } from "./coverage.js";
export interface CertGapsRun extends CertCoverageRun {
    gaps: SkillCoverage[];
    workItems: CoverageWorkItem[];
}
/**
 * Coverage skills that are not yet `ok` (missing or thin).
 */
export declare function runCertGaps(options: CertCoverageOptions): CertGapsRun;
//# sourceMappingURL=cert-gaps.d.ts.map