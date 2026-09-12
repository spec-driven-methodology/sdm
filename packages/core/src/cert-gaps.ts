import {
  runCertCoverage,
  type CertCoverageOptions,
  type CertCoverageRun,
} from "./cert-coverage.js";
import type { CoverageWorkItem, SkillCoverage } from "./coverage.js";

export interface CertGapsRun extends CertCoverageRun {
  gaps: SkillCoverage[];
  workItems: CoverageWorkItem[];
}

/**
 * Coverage skills that are not yet `ok` (missing or thin).
 */
export function runCertGaps(options: CertCoverageOptions): CertGapsRun {
  const run = runCertCoverage(options);
  const gaps = run.result.skills.filter(
    (s) => s.status === "missing" || s.status === "thin",
  );
  return { ...run, gaps, workItems: run.result.workItems };
}
