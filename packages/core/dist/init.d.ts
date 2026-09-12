export interface InitOptions {
    targetDir: string;
    name?: string;
    withExamples?: boolean;
    force?: boolean;
    /**
     * When set, the project is scaffolded inside `<targetDir>/<subdir>`
     * (created on the fly) instead of directly in `targetDir`.
     */
    subdir?: string;
}
export interface InitResult {
    targetDir: string;
    created: string[];
    skipped: string[];
}
/**
 * Scaffold a SDM methodology project (user-facing knowledge base).
 * Mirrors: install CLI → `sdm init` in an empty directory.
 */
export declare function initMethodologyProject(options: InitOptions): InitResult;
export declare function isMethodologyProject(dir: string): boolean;
//# sourceMappingURL=init.d.ts.map