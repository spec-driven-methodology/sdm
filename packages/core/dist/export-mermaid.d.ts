import { type CoverageStatus } from "./coverage.js";
import { type LoadWarning } from "./loaders.js";
import type { Level } from "./schemas.js";
export declare const EXPORT_MERMAID_SCHEMA = "sdm.export.mermaid/v1";
export interface ExportMermaidNode {
    skill: string;
    status?: CoverageStatus;
}
export interface ExportMermaidEdge {
    from: string;
    to: string;
}
export interface ExportMermaidDocument {
    schemaVersion: typeof EXPORT_MERMAID_SCHEMA;
    profile: string;
    level: string;
    title: string;
    coverage: boolean;
    nodes: ExportMermaidNode[];
    edges: ExportMermaidEdge[];
    mermaid: string;
    markdown: string;
}
export interface ExportMermaidOptions {
    startDir: string;
    profile: string;
    level: string;
    /** Color nodes by coverage status. Default true. */
    coverage?: boolean;
}
export interface ExportMermaidRun {
    projectRoot: string;
    format: "markdown";
    document: ExportMermaidDocument;
    warnings: LoadWarning[];
}
/** Sanitize skill id for Mermaid node identifiers. */
export declare function mermaidNodeId(skillId: string): string;
export declare function assembleMermaidDocument(input: {
    profileId: string;
    level: Level;
    nodes: ExportMermaidNode[];
    edges: ExportMermaidEdge[];
    coverage: boolean;
}): ExportMermaidDocument;
/**
 * Assemble a Mermaid skill graph for a certification role + level.
 */
export declare function exportMermaid(options: ExportMermaidOptions): ExportMermaidRun;
//# sourceMappingURL=export-mermaid.d.ts.map