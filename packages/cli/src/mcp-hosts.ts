import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { SdmError } from "@spec-driven-methodology/core";
import {
  buildMcpConfig,
  mergeMcpServersJson,
  mergeMcpIntoOpenCode,
  type McpConfigResult,
} from "./mcp-config.js";

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

const HOSTS: McpHostInfo[] = [
  { id: "cursor", title: "Cursor (.cursor/mcp.json)" },
  {
    id: "gigacode",
    title: "GigaCode CLI (~/.gigacode/settings.json)",
    experimental: true,
  },
  {
    id: "multitool",
    title: "MultiTool (~/.config/gigatool/opencode.json)",
    experimental: true,
  },
];

const HOST_IDS = new Set<string>(HOSTS.map((h) => h.id));

export function listHosts(): McpHostInfo[] {
  return HOSTS.map((h) => ({ ...h }));
}

export function resolveHosts(input: string): McpHostId[] {
  const raw = input.trim().toLowerCase();
  if (!raw) {
    throw new SdmError("HOSTS_REQUIRED", "Pass --hosts <csv>|all (e.g. cursor,gigacode,multitool)");
  }
  if (raw === "all") {
    return HOSTS.map((h) => h.id);
  }
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    throw new SdmError("HOSTS_REQUIRED", "Pass --hosts <csv>|all (e.g. cursor,gigacode,multitool)");
  }
  const known = HOSTS.map((h) => h.id).join(", ");
  const out: McpHostId[] = [];
  for (const id of parts) {
    if (!HOST_IDS.has(id)) {
      throw new SdmError(
        "UNKNOWN_HOST",
        `Unknown MCP host "${id}". Known: ${known}`,
      );
    }
    if (!out.includes(id as McpHostId)) {
      out.push(id as McpHostId);
    }
  }
  return out;
}

export function hostConfigPath(host: McpHostId, options?: HostPathOptions): string {
  if (options?.configPath) {
    return resolve(options.configPath);
  }
  if (host === "cursor") {
    const root = resolve(options?.cursorRoot ?? process.cwd());
    return join(root, ".cursor", "mcp.json");
  }
  if (host === "gigacode") {
    const home = options?.gigacodeHome
      ? resolve(options.gigacodeHome)
      : join((options?.homedir ?? homedir)(), ".gigacode");
    return join(home, "settings.json");
  }
  // multitool
  const home = options?.multitoolHome
    ? resolve(options.multitoolHome)
    : join((options?.homedir ?? homedir)(), ".config", "gigatool");
  return join(home, "opencode.json");
}

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

export function installMcpHosts(options: InstallMcpHostsOptions): {
  installs: HostInstallResult[];
  config: McpConfigResult;
} {
  if (!options.hosts.length) {
    throw new SdmError("HOSTS_REQUIRED", "Pass --hosts <csv>|all (e.g. cursor,gigacode,multitool)");
  }

  const config = buildMcpConfig({
    serverName: options.serverName,
    projectRoot: options.projectDir?.trim() ? resolve(options.projectDir) : null,
  });

  const pathOpts: HostPathOptions = {
    cursorRoot: options.cursorRoot,
    configPath: options.configPath,
    gigacodeHome: options.gigacodeHome,
    multitoolHome: options.multitoolHome,
    homedir: options.homedir,
  };

  const installs: HostInstallResult[] = [];
  for (const host of options.hosts) {
    const path = hostConfigPath(host, pathOpts);
    if (host === "multitool") {
      mergeMcpIntoOpenCode(path, config.serverName, config.mcpServer);
    } else {
      mergeMcpServersJson(path, config.serverName, config.mcpServer);
    }
    installs.push({ host, path });
  }

  return { installs, config };
}

/** Thin wrapper — Cursor only (backward compatible). */
export function installCursorMcp(options?: {
  cursorRoot?: string;
  projectDir?: string;
  serverName?: string;
  configPath?: string;
}): { path: string; config: McpConfigResult; wrote: boolean } {
  const result = installMcpHosts({
    hosts: ["cursor"],
    cursorRoot: options?.cursorRoot,
    projectDir: options?.projectDir,
    serverName: options?.serverName,
    configPath: options?.configPath,
  });
  return {
    path: result.installs[0]!.path,
    config: result.config,
    wrote: true,
  };
}

/**
 * Resolve host list from CLI flags. Non-TTY without hosts/cursor → HOSTS_REQUIRED.
 * TTY: prompt for comma-separated hosts (default cursor).
 */
export async function resolveHostsFromCli(options: {
  hosts?: string;
  cursor?: boolean;
  isTty?: boolean;
  prompt?: (question: string) => Promise<string>;
}): Promise<McpHostId[]> {
  const selected = new Set<McpHostId>();

  if (options.hosts) {
    for (const id of resolveHosts(options.hosts)) {
      selected.add(id);
    }
  }
  if (options.cursor) {
    selected.add("cursor");
  }

  if (selected.size > 0) {
    return [...selected];
  }

  const tty = options.isTty ?? Boolean(input.isTTY && output.isTTY);
  if (!tty) {
    throw new SdmError(
      "HOSTS_REQUIRED",
      "Pass --hosts <csv>|all or --cursor (e.g. --hosts cursor,gigacode,multitool)",
    );
  }

  const known = HOSTS.map((h) => h.id).join(", ");
  const ask =
    options.prompt ??
    (async (question: string) => {
      const rl = createInterface({ input, output });
      try {
        return await rl.question(question);
      } finally {
        rl.close();
      }
    });

  const answer = (await ask(`MCP hosts [${known}] (default: cursor): `)).trim();
  if (!answer) {
    return ["cursor"];
  }
  return resolveHosts(answer);
}
