import { runCertCoverage, } from "./cert-coverage.js";
/**
 * Coverage skills that are not yet `ok` (missing or thin).
 */
export function runCertGaps(options) {
    const run = runCertCoverage(options);
    const gaps = run.result.skills.filter((s) => s.status === "missing" || s.status === "thin");
    return { ...run, gaps, workItems: run.result.workItems };
}
//# sourceMappingURL=cert-gaps.js.map