/** Host mcpServers map key (Cursor sidebar shows this, not MCP title). */
export declare const DEFAULT_MCP_SERVER_NAME = "SDM";
/** Previous default key; migrated away on default install. */
export declare const LEGACY_MCP_SERVER_NAME = "sdm";
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
    snippet: {
        mcpServers: Record<string, McpServerConfig>;
    };
    /** @deprecated use snippet — kept for older callers */
    cursorSnippet: {
        mcpServers: Record<string, McpServerConfig>;
    };
}
/** Absolute path to resolved `@spec-driven-methodology/mcp/package.json`, or null if missing. */
export declare function resolveMcpPackageJson(): string | null;
/**
 * Version from the resolved `@spec-driven-methodology/mcp` package.json (what hosts load via mcp install).
 * Null when the package cannot be resolved.
 */
export declare function getResolvedMcpVersion(): string | null;
/**
 * Multi-line `--version` text: ASCII wordmark, then core + resolved MCP versions.
 */
export declare function formatSdmVersionOutput(cliVersion: string): string;
/**
 * Build stdio MCP server config with absolute paths.
 *
 * One MCP instance per host — do **not** bake a methodology path by default.
 * Pass `projectRoot` only when the user explicitly wants a default
 * `SDM_PROJECT_ROOT` (agents should prefer per-tool `project` instead).
 */
export declare function buildMcpConfig(options?: {
    /** @deprecated Ignored for auto-binding; use `projectRoot` for explicit default only */
    startDir?: string;
    serverName?: string;
    /** Explicit default SDM_PROJECT_ROOT; omit/null = multi-project (no env) */
    projectRoot?: string | null;
}): McpConfigResult;
/**
 * Merge SDM server into a JSON file with top-level `mcpServers` (create if missing).
 * Preserves all other keys in the file.
 */
export declare function mergeMcpServersJson(configPath: string, serverName: string, mcpServer: McpServerConfig): void;
/**
 * Merge SDM server into an OpenCode-style config (`opencode.json`),
 * where the top-level key is `mcp` (not `mcpServers`) and each server is
 * `{ type: "local", command: [cmd, ...args], environment? }`.
 * Preserves all other keys in the file. Used by the MultiTool host.
 */
export declare function mergeMcpIntoOpenCode(configPath: string, serverName: string, mcpServer: McpServerConfig): void;
//# sourceMappingURL=mcp-config.d.ts.map