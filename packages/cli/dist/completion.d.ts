import type { Command } from "commander";
export type ShellId = "zsh" | "bash" | "fish";
export type InstallCompletionOptions = {
    shell?: ShellId;
    homeDir?: string;
    quiet?: boolean;
    dryRun?: boolean;
    /** Skip when CI=1 / SDM_SKIP_COMPLETION=1 (build hooks). */
    respectSkipEnv?: boolean;
};
export type InstallCompletionResult = {
    ok: boolean;
    skipped?: boolean;
    reason?: string;
    shell: ShellId;
    scriptPath: string;
    rcPath: string | null;
    wroteScript: boolean;
    updatedRc: boolean;
};
export declare function detectShell(envShell?: string): ShellId;
export declare function renderCompletionScript(shell: ShellId, program: Command): string;
export declare function parseShellArg(raw: string | undefined): ShellId;
export declare function completionScriptPath(shell: ShellId, home?: string): string;
export declare function shellRcPath(shell: ShellId, home?: string): string | null;
/** Remove earlier one-liner installs so we don't double-register completion. */
export declare function stripLegacyCompletionLines(rcText: string): string;
/**
 * Upsert a managed marker block in shell rc. Returns whether the file changed.
 */
export declare function upsertRcBlock(rcPath: string, block: string, dryRun?: boolean): boolean;
/**
 * Write completion script under ~/.sdm (or fish completions dir) and
 * ensure shell rc sources it. Safe to re-run after every build/link.
 */
export declare function installCompletion(program: Command, options?: InstallCompletionOptions): InstallCompletionResult;
/**
 * Register `sdm completion …`. Call after all other commands, before parseAsync.
 */
export declare function registerCompletion(program: Command): void;
//# sourceMappingURL=completion.d.ts.map