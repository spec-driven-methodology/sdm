export declare const EXPORT_CONFLUENCE_SCHEMA = "sdm.export.confluence/v1";
export interface ExportConfluenceDocument {
    schemaVersion: typeof EXPORT_CONFLUENCE_SCHEMA;
    profile: string;
    level?: string;
    title: string;
    markdown: string;
}
export interface ExportConfluenceOptions {
    startDir: string;
    profile: string;
    level?: string;
    team?: string;
}
export interface ExportConfluenceRun {
    projectRoot: string;
    document: ExportConfluenceDocument;
}
/**
 * One Markdown page for Confluence: coverage summary + mermaid + matrix.
 */
export declare function exportConfluence(options: ExportConfluenceOptions): ExportConfluenceRun;
//# sourceMappingURL=export-confluence.d.ts.map