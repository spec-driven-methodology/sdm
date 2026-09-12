export declare const DEFAULT_LOG_MAX_BYTES: number;
export declare const DEFAULT_LOG_MAX_FILES = 5;
export type ActionLogSource = "cli" | "mcp";
export interface ActionLogEntry {
    source: ActionLogSource;
    action: string;
    args?: unknown;
    ok: boolean;
    code?: string;
    durationMs?: number;
    summary?: unknown;
    /** Directory used to resolve methodology project (cwd / --project) */
    startDir?: string;
    /** Explicit project root when already known */
    projectRoot?: string | null;
}
export interface ActionLogRecord {
    ts: string;
    source: ActionLogSource;
    action: string;
    args?: unknown;
    ok: boolean;
    code?: string;
    durationMs?: number;
    summary?: unknown;
}
export interface LoggingSettings {
    enabled: boolean;
    maxBytes: number;
    maxFiles: number;
}
export declare function isLoggingEnvDisabled(): boolean;
export declare function redactForLog(value: unknown, depth?: number): unknown;
export declare function resolveProjectRootForLog(startDir?: string, explicit?: string | null): string | null;
export declare function loadLoggingSettings(projectRoot: string): LoggingSettings;
export declare function actionLogDir(projectRoot: string): string;
export declare function rotateLogFile(filePath: string, maxFiles: number): void;
/**
 * Append an action record to `.sdm/logs/`. No-op outside a methodology project
 * or when disabled. Never writes to stdout/stderr.
 */
export declare function appendActionLog(entry: ActionLogEntry): ActionLogRecord | null;
export declare function withActionLog<T>(options: {
    source: ActionLogSource;
    action: string;
    args?: unknown;
    startDir?: string;
    projectRoot?: string | null;
    summarize?: (result: T) => unknown;
    run: () => T | Promise<T>;
}): Promise<T>;
//# sourceMappingURL=action-log.d.ts.map