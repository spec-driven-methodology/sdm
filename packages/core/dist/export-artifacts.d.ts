import type { ContentBasis } from "./schemas.js";
export interface ExportArtifactRef {
    path: string;
    kind: string;
    /** Package upsert id when present on export JSON. */
    id?: string;
    schemaVersion?: string;
    profile?: string;
    level?: string;
    skills?: string[];
    basis?: ContentBasis;
}
/** Scan project exports directory for SDM export JSON documents. */
export declare function scanExportArtifacts(projectRoot: string): ExportArtifactRef[];
export declare function exportMatchesScope(ref: ExportArtifactRef, scope: {
    skills?: Set<string>;
    profiles?: Set<string>;
    levels?: Set<string>;
}): boolean;
//# sourceMappingURL=export-artifacts.d.ts.map