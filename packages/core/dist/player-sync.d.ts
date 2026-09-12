export interface SyncPlayerOptions {
    projectRoot: string;
    force?: boolean;
}
export interface SyncPlayerResult {
    projectRoot: string;
    playerDir: string;
    created: string[];
    skipped: string[];
    force: boolean;
}
/**
 * Copy shipped export-test player assets into `<project>/player/`.
 * Does not modify methodology YAML or other project roots.
 */
export declare function syncPlayerAssets(options: SyncPlayerOptions): SyncPlayerResult;
/** Used by init to seed player/ without requiring a prior project check. */
export declare function copyPlayerTemplateInto(targetDir: string, created: string[], skipped: string[], force: boolean): void;
//# sourceMappingURL=player-sync.d.ts.map