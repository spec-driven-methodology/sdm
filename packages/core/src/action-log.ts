import {
  appendFileSync,
  existsSync,
  mkdirSync,
  renameSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { join } from "node:path";
import { findProjectRoot, PROJECT_MANIFEST } from "./project-root.js";
import { SdmConfigSchema } from "./schemas.js";
import { readYamlFile } from "./yaml.js";

export const DEFAULT_LOG_MAX_BYTES = 2 * 1024 * 1024;
export const DEFAULT_LOG_MAX_FILES = 5;
const MAX_STRING = 500;
const MAX_DEPTH = 4;

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

const SECRET_KEY =
  /pass(word)?|token|secret|authorization|api[_-]?key|credential/i;

export function isLoggingEnvDisabled(): boolean {
  const raw = process.env.SDM_LOG?.trim().toLowerCase();
  if (!raw) return false;
  return raw === "0" || raw === "false" || raw === "off" || raw === "no";
}

export function redactForLog(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return "[Truncated]";
  if (value == null) return value;
  if (typeof value === "string") {
    return value.length > MAX_STRING
      ? `${value.slice(0, MAX_STRING)}…`
      : value;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((v) => redactForLog(v, depth + 1));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SECRET_KEY.test(k) ? "[REDACTED]" : redactForLog(v, depth + 1);
    }
    return out;
  }
  return String(value);
}

export function resolveProjectRootForLog(
  startDir?: string,
  explicit?: string | null,
): string | null {
  if (explicit) return explicit;
  const start = startDir ?? process.cwd();
  try {
    return findProjectRoot(start);
  } catch {
    return null;
  }
}

export function loadLoggingSettings(projectRoot: string): LoggingSettings {
  const defaults: LoggingSettings = {
    enabled: true,
    maxBytes: DEFAULT_LOG_MAX_BYTES,
    maxFiles: DEFAULT_LOG_MAX_FILES,
  };
  const manifest = join(projectRoot, PROJECT_MANIFEST);
  if (!existsSync(manifest)) return defaults;
  try {
    const config = SdmConfigSchema.parse(readYamlFile(manifest));
    return {
      enabled: config.logging?.enabled ?? true,
      maxBytes: config.logging?.maxBytes ?? DEFAULT_LOG_MAX_BYTES,
      maxFiles: config.logging?.maxFiles ?? DEFAULT_LOG_MAX_FILES,
    };
  } catch {
    return defaults;
  }
}

export function actionLogDir(projectRoot: string): string {
  return join(projectRoot, ".sdm", "logs");
}

export function rotateLogFile(filePath: string, maxFiles: number): void {
  if (maxFiles < 1) return;
  const drop = `${filePath}.${maxFiles}`;
  if (existsSync(drop)) unlinkSync(drop);
  for (let i = maxFiles - 1; i >= 1; i--) {
    const from = `${filePath}.${i}`;
    const to = `${filePath}.${i + 1}`;
    if (existsSync(from)) renameSync(from, to);
  }
  if (existsSync(filePath)) renameSync(filePath, `${filePath}.1`);
}

function appendLine(filePath: string, line: string, settings: LoggingSettings): void {
  if (existsSync(filePath)) {
    const size = statSync(filePath).size;
    if (size >= settings.maxBytes) {
      rotateLogFile(filePath, settings.maxFiles);
    }
  }
  appendFileSync(filePath, line.endsWith("\n") ? line : `${line}\n`, "utf8");
}

/**
 * Append an action record to `.sdm/logs/`. No-op outside a methodology project
 * or when disabled. Never writes to stdout/stderr.
 */
export function appendActionLog(entry: ActionLogEntry): ActionLogRecord | null {
  if (isLoggingEnvDisabled()) return null;

  const projectRoot = resolveProjectRootForLog(entry.startDir, entry.projectRoot);
  if (!projectRoot) return null;

  const settings = loadLoggingSettings(projectRoot);
  if (!settings.enabled) return null;

  const record: ActionLogRecord = {
    ts: new Date().toISOString(),
    source: entry.source,
    action: entry.action,
    ok: entry.ok,
  };
  if (entry.args !== undefined) record.args = redactForLog(entry.args);
  if (entry.code) record.code = entry.code;
  if (entry.durationMs !== undefined) record.durationMs = entry.durationMs;
  if (entry.summary !== undefined) record.summary = redactForLog(entry.summary);

  const dir = actionLogDir(projectRoot);
  mkdirSync(dir, { recursive: true });
  const line = JSON.stringify(record);
  const mainPath = join(dir, "sdm.log");
  appendLine(mainPath, line, settings);
  if (!entry.ok) {
    appendLine(join(dir, "error.log"), line, settings);
  }
  return record;
}

export async function withActionLog<T>(options: {
  source: ActionLogSource;
  action: string;
  args?: unknown;
  startDir?: string;
  projectRoot?: string | null;
  summarize?: (result: T) => unknown;
  run: () => T | Promise<T>;
}): Promise<T> {
  const started = Date.now();
  try {
    const result = await options.run();
    appendActionLog({
      source: options.source,
      action: options.action,
      args: options.args,
      ok: true,
      durationMs: Date.now() - started,
      summary: options.summarize?.(result),
      startDir: options.startDir,
      projectRoot: options.projectRoot,
    });
    return result;
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: unknown }).code)
        : "UNEXPECTED";
    const message = err instanceof Error ? err.message : String(err);
    appendActionLog({
      source: options.source,
      action: options.action,
      args: options.args,
      ok: false,
      code,
      durationMs: Date.now() - started,
      summary: { message },
      startDir: options.startDir,
      projectRoot: options.projectRoot,
    });
    throw err;
  }
}
