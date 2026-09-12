export interface BuildStudioCoverageViewOptions {
    projectRoot: string;
    profile: string;
    level: string;
}
/**
 * Build a studio view document with a coverage phase from live gaps + suggest.
 * Does not write methodology YAML.
 */
export declare function buildStudioCoverageView(options: BuildStudioCoverageViewOptions): Record<string, unknown>;
export interface PushStudioCoverageResult {
    projectRoot: string;
    viewPath: string;
    profile: string;
    level: string;
    summary: {
        missing: number;
        thin: number;
        ok: number;
    };
}
/** Build coverage view and write to .sdm/studio/current-view.json */
export declare function pushStudioCoverage(options: BuildStudioCoverageViewOptions): PushStudioCoverageResult;
//# sourceMappingURL=studio-coverage.d.ts.map