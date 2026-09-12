import type { ContentBasis } from "./schemas.js";
export declare const CONTENT_STALE_SCHEMA: "sdm.content.stale/v1";
export type StaleReason = "skill_basis_mismatch" | "level_basis_mismatch" | "missing_basis";
export type StaleAction = "review" | "regenerate";
export interface StaleItem {
    kind: "question" | "export";
    id?: string;
    path?: string;
    skill?: string;
    reason: StaleReason;
    severity: "info" | "warn";
    action: StaleAction;
}
export interface StaleWorkItem {
    kind: "question" | "export";
    id?: string;
    path?: string;
    skill?: string;
    action: StaleAction;
    reason: StaleReason;
}
export interface ContentStaleDocument {
    schemaVersion: typeof CONTENT_STALE_SCHEMA;
    skill?: string;
    profile?: string;
    level?: string;
    stale: StaleItem[];
    workItems: StaleWorkItem[];
}
export interface ContentStaleRun {
    projectRoot: string;
    document: ContentStaleDocument;
}
export interface RunContentStaleOptions {
    startDir: string;
    skill?: string;
    profile?: string;
    level?: string;
}
/**
 * Compare stamped content basis against current skill/level hashes.
 * Default: `--skill S` only checks questions bound to S (not downstream).
 */
export declare function runContentStale(options: RunContentStaleOptions): ContentStaleRun;
/** Count basis mismatches (excludes missing_basis) for suggest ranking. */
export declare function countBasisMismatches(document: ContentStaleDocument): number;
/** Peek basis for a ContentBasis value (tests / helpers). */
export declare function readBasis(value: unknown): ContentBasis | undefined;
//# sourceMappingURL=content-stale.d.ts.map