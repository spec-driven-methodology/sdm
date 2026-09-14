import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SdmError } from "@spec-driven-methodology/core";
import { resolveHostsFromCli, type McpHostId } from "./mcp-hosts.js";

/** Same host ids as MCP for a unified `--hosts` UX. */
export type AgentHostId = McpHostId;

export interface AgentHostInfo {
  id: AgentHostId;
  title: string;
  experimental?: boolean;
}

const AGENT_HOSTS: AgentHostInfo[] = [
  { id: "cursor", title: "Cursor (.cursor/skills/)" },
  {
    id: "gigacode",
    title: "GigaCode CLI (~/.gigacode/skills/)",
    experimental: true,
  },
  {
    id: "multitool",
    title: "MultiTool (~/.config/gigatool/skills/)",
    experimental: true,
  },
];

export function listAgentHosts(): AgentHostInfo[] {
  return AGENT_HOSTS.map((h) => ({ ...h }));
}

export interface AgentPathOptions {
  cursorRoot?: string;
  gigacodeHome?: string;
  /** Directory that contains skills/ for MultiTool (default: ~/.config/gigatool) */
  multitoolHome?: string;
  homedir?: () => string;
}

/** Skills root directory for a host (contains <skillId>/SKILL.md). */
export function agentSkillsRoot(host: AgentHostId, options?: AgentPathOptions): string {
  if (host === "cursor") {
    const root = resolve(options?.cursorRoot ?? process.cwd());
    return join(root, ".cursor", "skills");
  }
  if (host === "gigacode") {
    const home = options?.gigacodeHome
      ? resolve(options.gigacodeHome)
      : join((options?.homedir ?? homedir)(), ".gigacode");
    return join(home, "skills");
  }
  // multitool
  const home = options?.multitoolHome
    ? resolve(options.multitoolHome)
    : join((options?.homedir ?? homedir)(), ".config", "gigatool");
  return join(home, "skills");
}

/**
 * Resolve SDM `agents/` directory (portable skills source of truth).
 * Order: --agents-root → SDM_HOME/agents → walk from this package to monorepo root.
 */
export function resolveAgentsRoot(explicit?: string): string {
  if (explicit?.trim()) {
    const root = resolve(explicit.trim());
    if (!hasPortableSkills(root)) {
      throw new SdmError(
        "AGENTS_NOT_FOUND",
        `No portable skills (*/SKILL.md) under --agents-root: ${root}`,
      );
    }
    return root;
  }

  const fromEnv = process.env.SDM_HOME?.trim();
  if (fromEnv) {
    const candidate = join(resolve(fromEnv), "agents");
    if (hasPortableSkills(candidate)) {
      return candidate;
    }
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, "..", "..", "..", "agents"), // packages/cli/dist → repo root
    join(here, "..", "..", "..", "..", "agents"), // safety if layout differs
  ];
  for (const c of candidates) {
    const root = resolve(c);
    if (hasPortableSkills(root)) {
      return root;
    }
  }

  // npm-installed @spec-driven-methodology/core ships agents/ next to dist (files: agents)
  try {
    const require = createRequire(import.meta.url);
    const corePkg = require.resolve("@spec-driven-methodology/core/package.json");
    const root = join(dirname(corePkg), "agents");
    if (hasPortableSkills(root)) {
      return root;
    }
  } catch {
    // core package not installed — fall through to the error below
  }

  throw new SdmError(
    "AGENTS_NOT_FOUND",
    "Could not locate SDM agents/ with SKILL.md. Pass --agents-root or set SDM_HOME.",
  );
}

export function listPortableSkillIds(agentsRoot: string): string[] {
  if (!existsSync(agentsRoot)) {
    return [];
  }
  return readdirSync(agentsRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => existsSync(join(agentsRoot, name, "SKILL.md")))
    .sort();
}

function hasPortableSkills(agentsRoot: string): boolean {
  return listPortableSkillIds(agentsRoot).length > 0;
}

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
  skillsRoots: Array<{ host: AgentHostId; path: string }>;
}

export function installAgentSkills(
  options: InstallAgentSkillsOptions,
): InstallAgentSkillsResult {
  if (!options.hosts.length) {
    throw new SdmError(
      "HOSTS_REQUIRED",
      "Pass --hosts <csv>|all (e.g. cursor,gigacode,multitool)",
    );
  }

  const agentsRoot = resolveAgentsRoot(options.agentsRoot);
  const skillIds = listPortableSkillIds(agentsRoot);
  if (skillIds.length === 0) {
    throw new SdmError(
      "AGENTS_NOT_FOUND",
      `No portable skills under ${agentsRoot}`,
    );
  }

  const pathOpts: AgentPathOptions = {
    cursorRoot: options.cursorRoot,
    gigacodeHome: options.gigacodeHome,
    multitoolHome: options.multitoolHome,
    homedir: options.homedir,
  };

  const installs: SkillInstallItem[] = [];
  const skillsRoots: Array<{ host: AgentHostId; path: string }> = [];
  const force = options.force ?? false;
  const link = options.link ?? false;

  for (const host of options.hosts) {
    const root = agentSkillsRoot(host, pathOpts);
    skillsRoots.push({ host, path: root });
    mkdirSync(root, { recursive: true });

    for (const skillId of skillIds) {
      const src = join(agentsRoot, skillId);
      const dest = join(root, skillId);
      if (existsSync(dest) && !force) {
        installs.push({ host, skillId, path: dest, mode: "skipped" });
        continue;
      }
      if (existsSync(dest) && force) {
        rmSync(dest, { recursive: true, force: true });
      }
      mkdirSync(dirname(dest), { recursive: true });
      if (link) {
        symlinkSync(src, dest, "dir");
        installs.push({ host, skillId, path: dest, mode: "linked" });
      } else {
        cpSync(src, dest, { recursive: true });
        installs.push({ host, skillId, path: dest, mode: "copied" });
      }
    }

    // Pointer so hosts see SDM entry without opening the framework repo
    const pointerPath = join(root, "sdm-AGENTS.md");
    const frameworkAgentsMd = join(dirname(agentsRoot), "AGENTS.md");
    if (existsSync(frameworkAgentsMd) && (!existsSync(pointerPath) || force)) {
      const body = readFileSync(frameworkAgentsMd, "utf8");
      writeFileSync(
        pointerPath,
        [
          "<!-- Mirrored by `sdm agent install`. Source of truth: SDM repo AGENTS.md -->",
          "",
          body,
        ].join("\n"),
        "utf8",
      );
    }
  }

  return { agentsRoot, skillIds, installs, skillsRoots };
}

/** Re-export host resolution used by MCP (same ids). */
export { resolveHostsFromCli };

/** Type guard helper for tests / symlink detection. */
export function isSymlink(path: string): boolean {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}
