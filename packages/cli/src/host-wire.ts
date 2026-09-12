import { SdmError } from "@spec-driven-methodology/core";
import {
  installAgentSkills,
  type InstallAgentSkillsResult,
} from "./agent-hosts.js";
import {
  installMcpHosts,
  type HostInstallResult,
  type InstallMcpHostsOptions,
} from "./mcp-hosts.js";
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
  skills: (InstallAgentSkillsResult & { ok: true }) | null;
}

/**
 * Install SDM MCP into hosts, then (by default) portable skills for the same hosts.
 * If skills fail after MCP write, throws SdmError; callers SHOULD include `installs` in JSON errors.
 */
export function wireMcpHosts(options: WireMcpHostsOptions): WireMcpHostsResult {
  const { installs, config } = installMcpHosts(options);
  const withSkills = options.withSkills !== false;

  if (!withSkills) {
    return { installs, config, skills: null };
  }

  try {
    const skills = installAgentSkills({
      hosts: options.hosts,
      cursorRoot: options.cursorRoot,
      gigacodeHome: options.gigacodeHome,
      agentsRoot: options.agentsRoot,
      link: options.linkSkills,
      force: options.forceSkills,
      homedir: options.homedir,
    });
    return { installs, config, skills: { ok: true, ...skills } };
  } catch (err) {
    if (err instanceof SdmError) {
      throw new SdmError(
        err.code,
        `${err.message} (MCP already written: ${installs.map((i) => `${i.host}=${i.path}`).join(", ")})`,
      );
    }
    throw err;
  }
}
