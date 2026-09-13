import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SdmError, findProjectRoot } from "@spec-driven-methodology/core";
import { withSdmBanner } from "./banner.js";

/** Host mcpServers map key (Cursor sidebar shows this, not MCP title). */
export const DEFAULT_MCP_SERVER_NAME = "SDM";
/** Previous default key; migrated away on default install. */
export const LEGACY_MCP_SERVER_NAME = "sdm";

export interface McpServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface McpConfigResult {
  serverName: string;
  mcpEntry: string;
  projectRoot: string | null;
  mcpServer: McpServerConfig;
  /** Ready to merge into any host mcpServers map */
  snippet: { mcpServers: Record<string, McpServerConfig> };
  /** @deprecated use snippet — kept for older callers */
  cursorSnippet: { mcpServers: Record<string, McpServerConfig> };
}

/** Absolute path to resolved `@spec-driven-methodology/mcp/package.json`, or null if missing. */
export function resolveMcpPackageJson(): string | null {
  const require = createRequire(import.meta.url);
  try {
    const pkgJson = require.resolve("@spec-driven-methodology/mcp/package.json");
    if (existsSync(pkgJson)) {
      return pkgJson;
    }
  } catch {
    // fall through to sibling layout (monorepo / linked)
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const sibling = resolve(here, "..", "..", "mcp", "package.json");
  return existsSync(sibling) ? sibling : null;
}

function resolveMcpEntry(): string {
  const pkgJson = resolveMcpPackageJson();
  if (pkgJson) {
    const entry = join(dirname(pkgJson), "dist", "index.js");
    if (existsSync(entry)) {
      return entry;
    }
  }

  throw new SdmError(
    "MCP_NOT_FOUND",
    "Could not resolve @spec-driven-methodology/mcp dist/index.js. Run `npm run build -w @spec-driven-methodology/mcp` (and prefer `npm link -w @spec-driven-methodology/mcp`).",
  );
}

/**
 * Version from the resolved `@spec-driven-methodology/mcp` package.json (what hosts load via mcp install).
 * Null when the package cannot be resolved.
 */
export function getResolvedMcpVersion(): string | null {
  const pkgJson = resolveMcpPackageJson();
  if (!pkgJson) return null;
  try {
    const pkg = JSON.parse(readFileSync(pkgJson, "utf8")) as { version?: string };
    return typeof pkg.version === "string" && pkg.version.length > 0
      ? pkg.version
      : null;
  } catch {
    return null;
  }
}

/**
 * Multi-line `--version` text: ASCII wordmark, then core + resolved MCP versions.
 */
export function formatSdmVersionOutput(cliVersion: string): string {
  const mcp = getResolvedMcpVersion();
  const body = mcp
    ? `core ${cliVersion}\nmcp ${mcp}`
    : `core ${cliVersion}\nmcp (not found)`;
  return withSdmBanner(body);
}

/**
 * Build stdio MCP server config with absolute paths.
 *
 * One MCP instance per host — do **not** bake a methodology path by default.
 * Pass `projectRoot` only when the user explicitly wants a default
 * `SDM_PROJECT_ROOT` (agents should prefer per-tool `project` instead).
 */
export function buildMcpConfig(options?: {
  /** @deprecated Ignored for auto-binding; use `projectRoot` for explicit default only */
  startDir?: string;
  serverName?: string;
  /** Explicit default SDM_PROJECT_ROOT; omit/null = multi-project (no env) */
  projectRoot?: string | null;
}): McpConfigResult {
  const serverName = options?.serverName?.trim() || DEFAULT_MCP_SERVER_NAME;
  const mcpEntry = resolveMcpEntry();

  let projectRoot: string | null = null;
  if (options?.projectRoot?.trim()) {
    const resolved = resolve(options.projectRoot.trim());
    try {
      projectRoot = findProjectRoot(resolved);
    } catch {
      // Still bake the path the user asked for (may be created later)
      projectRoot = resolved;
    }
  }

  const mcpServer: McpServerConfig = {
    command: process.execPath,
    args: projectRoot ? [mcpEntry, "--project", projectRoot] : [mcpEntry],
  };
  if (projectRoot) {
    // env kept as fallback for hosts/older entry versions that ignore argv
    mcpServer.env = { SDM_PROJECT_ROOT: projectRoot };
  }

  const snippet = { mcpServers: { [serverName]: mcpServer } };
  return {
    serverName,
    mcpEntry,
    projectRoot,
    mcpServer,
    snippet,
    cursorSnippet: snippet,
  };
}

/**
 * Merge SDM server into a JSON file with top-level `mcpServers` (create if missing).
 * Preserves all other keys in the file.
 */
export function mergeMcpServersJson(
  configPath: string,
  serverName: string,
  mcpServer: McpServerConfig,
): void {
  const path = resolve(configPath);
  mkdirSync(dirname(path), { recursive: true });

  let existing: Record<string, unknown> = {};
  if (existsSync(path)) {
    try {
      existing = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    } catch {
      throw new SdmError(
        "VALIDATION_FAILED",
        `Cannot parse existing MCP config: ${path}`,
      );
    }
  }

  const prevServers =
    existing.mcpServers &&
    typeof existing.mcpServers === "object" &&
    !Array.isArray(existing.mcpServers)
      ? { ...(existing.mcpServers as Record<string, unknown>) }
      : {};

  // Default brand key: drop legacy lowercase so hosts do not show two SDM servers.
  if (serverName === DEFAULT_MCP_SERVER_NAME && LEGACY_MCP_SERVER_NAME in prevServers) {
    delete prevServers[LEGACY_MCP_SERVER_NAME];
  }

  const mcpServers = { ...prevServers, [serverName]: mcpServer };
  const next = { ...existing, mcpServers };
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

/**
 * Merge SDM server into an OpenCode-style config (`opencode.json`),
 * where the top-level key is `mcp` (not `mcpServers`) and each server is
 * `{ type: "local", command: [cmd, ...args], environment? }`.
 * Preserves all other keys in the file. Used by the MultiTool host.
 */
export function mergeMcpIntoOpenCode(
  configPath: string,
  serverName: string,
  mcpServer: McpServerConfig,
): void {
  const path = resolve(configPath);
  mkdirSync(dirname(path), { recursive: true });

  let existing: Record<string, unknown> = {};
  if (existsSync(path)) {
    try {
      existing = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
    } catch {
      throw new SdmError(
        "VALIDATION_FAILED",
        `Cannot parse existing OpenCode MCP config: ${path}`,
      );
    }
  }

  const prevServers =
    existing.mcp &&
    typeof existing.mcp === "object" &&
    !Array.isArray(existing.mcp)
      ? { ...(existing.mcp as Record<string, unknown>) }
      : {};

  // Default brand key: drop legacy lowercase so hosts do not show two SDM servers.
  if (serverName === DEFAULT_MCP_SERVER_NAME && LEGACY_MCP_SERVER_NAME in prevServers) {
    delete prevServers[LEGACY_MCP_SERVER_NAME];
  }

  const openCodeServer = {
    type: "local",
    command: [mcpServer.command, ...mcpServer.args],
    ...(mcpServer.env ? { environment: mcpServer.env } : {}),
  };

  const mcp = { ...prevServers, [serverName]: openCodeServer };
  const next = { ...existing, mcp };
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}
