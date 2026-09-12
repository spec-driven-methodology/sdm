import { type InstallAgentSkillsResult } from "./agent-hosts.js";
import { type HostInstallResult, type InstallMcpHostsOptions } from "./mcp-hosts.js";
import type { McpConfigResult } from "./mcp-config.js";
export interface WireMcpHostsOptions extends InstallMcpHostsOptions {
    /** Default true — also mirror portable skills into the same hosts */
    withSkills?: boolean;
    agentsRoot?: string;
    linkSkills?: boolean;
    forceSkills?: boolean;
}
export interface WireMcpHostsResult {
    installs: HostInstallResult[];
    config: McpConfigResult;
    skills: (InstallAgentSkillsResult & {
        ok: true;
    }) | null;
}
/**
 * Install SDM MCP into hosts, then (by default) portable skills for the same hosts.
 * If skills fail after MCP write, throws SdmError; callers SHOULD include `installs` in JSON errors.
 */
export declare function wireMcpHosts(options: WireMcpHostsOptions): WireMcpHostsResult;
//# sourceMappingURL=host-wire.d.ts.map