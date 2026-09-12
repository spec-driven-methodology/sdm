import { resolveHostsFromCli, type McpHostId } from "./mcp-hosts.js";
/** Same host ids as MCP for a unified `--hosts` UX. */
export type AgentHostId = McpHostId;
export interface AgentHostInfo {
    id: AgentHostId;
    title: string;
    experimental?: boolean;
}
export declare function listAgentHosts(): AgentHostInfo[];
export interface AgentPathOptions {
    cursorRoot?: string;
    gigacodeHome?: string;
    /** Directory that contains skills/ for MultiTool (default: ~/.config/gigatool) */
    multitoolHome?: string;
    homedir?: () => string;
}
/** Skills root directory for a host (contains <skillId>/SKILL.md). */
export declare function agentSkillsRoot(host: AgentHostId, options?: AgentPathOptions): string;
/**
 * Resolve SDM `agents/` directory (portable skills source of truth).
 * Order: --agents-root → SDM_HOME/agents → walk from this package to monorepo root.
 */
export declare function resolveAgentsRoot(explicit?: string): string;
export declare function listPortableSkillIds(agentsRoot: string): string[];
export interface InstallAgentSkillsOptions {
    hosts: AgentHostId[];
    agentsRoot?: string;
    cursorRoot?: string;
    gigacodeHome?: string;
    multitoolHome?: string;
    link?: boolean;
    force?: boolean;
    homedir?: () => string;
}
export interface SkillInstallItem {
    host: AgentHostId;
    skillId: string;
    path: string;
    mode: "copied" | "linked" | "skipped";
}
export interface InstallAgentSkillsResult {
    agentsRoot: string;
    skillIds: string[];
    installs: SkillInstallItem[];
    skillsRoots: Array<{
        host: AgentHostId;
        path: string;
    }>;
}
export declare function installAgentSkills(options: InstallAgentSkillsOptions): InstallAgentSkillsResult;
/** Re-export host resolution used by MCP (same ids). */
export { resolveHostsFromCli };
/** Type guard helper for tests / symlink detection. */
export declare function isSymlink(path: string): boolean;
//# sourceMappingURL=agent-hosts.d.ts.map