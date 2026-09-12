import { type McpConfigResult } from "./mcp-config.js";
export type McpHostId = "cursor" | "gigacode" | "multitool";
export interface McpHostInfo {
    id: McpHostId;
    title: string;
    /** Unofficial / experimental host surface */
    experimental?: boolean;
}
export interface HostPathOptions {
    cursorRoot?: string;
    /** Absolute path override for this host's config file */
    configPath?: string;
    /** Directory that contains settings.json for gigacode (default: ~/.gigacode) */
    gigacodeHome?: string;
    /** Directory that contains opencode.json for MultiTool (default: ~/.config/gigatool) */
    multitoolHome?: string;
    homedir?: () => string;
}
export declare function listHosts(): McpHostInfo[];
export declare function resolveHosts(input: string): McpHostId[];
export declare function hostConfigPath(host: McpHostId, options?: HostPathOptions): string;
export interface InstallMcpHostsOptions {
    hosts: McpHostId[];
    /** Explicit default SDM_PROJECT_ROOT only; omit for multi-project MCP */
    projectDir?: string;
    cursorRoot?: string;
    configPath?: string;
    gigacodeHome?: string;
    /** Directory that contains opencode.json for MultiTool (default: ~/.config/gigatool) */
    multitoolHome?: string;
    serverName?: string;
    homedir?: () => string;
}
export interface HostInstallResult {
    host: McpHostId;
    path: string;
}
export declare function installMcpHosts(options: InstallMcpHostsOptions): {
    installs: HostInstallResult[];
    config: McpConfigResult;
};
/** Thin wrapper — Cursor only (backward compatible). */
export declare function installCursorMcp(options?: {
    cursorRoot?: string;
    projectDir?: string;
    serverName?: string;
    configPath?: string;
}): {
    path: string;
    config: McpConfigResult;
    wrote: boolean;
};
/**
 * Resolve host list from CLI flags. Non-TTY without hosts/cursor → HOSTS_REQUIRED.
 * TTY: prompt for comma-separated hosts (default cursor).
 */
export declare function resolveHostsFromCli(options: {
    hosts?: string;
    cursor?: boolean;
    isTty?: boolean;
    prompt?: (question: string) => Promise<string>;
}): Promise<McpHostId[]>;
//# sourceMappingURL=mcp-hosts.d.ts.map