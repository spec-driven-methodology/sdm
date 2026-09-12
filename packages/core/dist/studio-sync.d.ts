export interface SyncStudioOptions {
    projectRoot: string;
    force?: boolean;
}
export interface SyncStudioResult {
    projectRoot: string;
    studioDir: string;
    created: string[];
    skipped: string[];
    force: boolean;
}
/**
 * Copy shipped Methodology Studio assets into `<project>/studio/`.
 * Does not modify methodology YAML, player/, or other project roots.
 */
export declare function syncStudioAssets(options: SyncStudioOptions): SyncStudioResult;
/** Used by init to seed studio/ without requiring a prior project check. */
export declare function copyStudioTemplateInto(targetDir: string, created: string[], skipped: string[], force: boolean): void;
//# sourceMappingURL=studio-sync.d.ts.map