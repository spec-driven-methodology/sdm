import { createRequire } from "node:module";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { z } from "zod";
import { SdmError } from "./errors.js";

/** Public CLI command paths for about capabilities (keep in sync when adding CLI). */
export const ABOUT_CLI_COMMANDS = [
  "about",
  "suggest",
  "init",
  "doctor",
  "player sync",
  "intent validate-plan",
  "audit",
  "quality report",
  "skill add",
  "skill link",
  "skill graph",
  "skill impact",
  "content stale",
  "profile create",
  "cert create",
  "cert patch",
  "cert reweight",
  "cert coverage",
  "cert gaps",
  "question add",
  "question validate",
  "question list",
  "question generate",
  "term add",
  "term list",
  "index rebuild",
  "search",
  "export test",
  "export matrix",
  "export learning",
  "export course",
  "export mermaid",
  "export confluence",
  "mcp hosts",
  "mcp config",
  "mcp install",
  "agent hosts",
  "agent install",
  "completion install",
  "completion print",
] as const;

/** Public MCP tool names for about capabilities (keep in sync with @spec-driven-methodology/mcp TOOL_NAMES). */
export const ABOUT_MCP_TOOLS = [
  "about",
  "suggest",
  "doctor",
  "audit",
  "quality_report",
  "init",
  "locate_project",
  "list_projects",
  "player_sync",
  "skill_add",
  "skill_link",
  "skill_graph",
  "skill_impact",
  "content_stale",
  "profile_create",
  "cert_create",
  "cert_patch",
  "cert_reweight",
  "cert_coverage",
  "cert_gaps",
  "question_add",
  "question_validate",
  "question_list",
  "question_generate",
  "term_add",
  "term_list",
  "export_test",
  "export_matrix",
  "export_learning",
  "export_course",
  "export_kit",
  "export_mermaid",
  "export_confluence",
  "index_rebuild",
  "search",
  "skill_suggest_links",
  "question_deep_validate",
  "topic_registry",
  "topic_sync",
  "course_heal",
] as const;

const AboutCanonFrontmatterSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  what: z.string().min(1),
  whatNot: z.array(z.string().min(1)).min(1),
  model: z.string().min(1),
});

export const AboutSkillSchema = z.object({
  id: z.string().min(1),
  purpose: z.string().min(1),
});

export const AboutPayloadSchema = z.object({
  ok: z.literal(true),
  version: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  positioning: z.object({
    what: z.string().min(1),
    whatNot: z.array(z.string().min(1)).min(1),
    model: z.string().min(1),
  }),
  capabilities: z.object({
    cli: z.array(z.string()),
    mcp: z.array(z.string()),
    skills: z.array(AboutSkillSchema),
  }),
  nextSteps: z.array(
    z.object({
      id: z.string().min(1),
      hint: z.string().min(1),
    }),
  ),
  pointers: z.object({
    about: z.string(),
    agents: z.string(),
    changelog: z.string(),
  }),
});

export type AboutPayload = z.infer<typeof AboutPayloadSchema>;

export type BuildAboutOptions = {
  /** Override SDM package root (tests / SDM_HOME). */
  sdmHome?: string;
};

function isSdmPackageRoot(dir: string): boolean {
  const pkgPath = join(dir, "package.json");
  const aboutPath = join(dir, "ABOUT.md");
  if (!existsSync(pkgPath) || !existsSync(aboutPath)) {
    return false;
  }
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string };
    // Root: "sdm" (dev); published: @spec-driven-methodology/core or /cli — both ship ABOUT.md
    return pkg.name === "sdm" || pkg.name === "@spec-driven-methodology/cli" || pkg.name === "@spec-driven-methodology/core";
  } catch {
    return false;
  }
}

/**
 * Resolve SDM package root (contains ABOUT.md + package.json name "sdm").
 * Order: explicit → SDM_HOME → walk from this module → npm-resolved CLI package → cwd walk.
 */
export function resolveSdmHome(explicit?: string): string {
  if (explicit?.trim()) {
    const root = resolve(explicit.trim());
    if (!isSdmPackageRoot(root)) {
      throw new SdmError(
        "SDM_HOME_NOT_FOUND",
        `Not a SDM package root (need ABOUT.md + package.json name "sdm"): ${root}`,
      );
    }
    return root;
  }

  const fromEnv = process.env.SDM_HOME?.trim();
  if (fromEnv) {
    const root = resolve(fromEnv);
    if (isSdmPackageRoot(root)) {
      return root;
    }
  }

  // Walk from this module (works in monorepo: packages/core/{src|dist} → repo root)
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, "..", "..", ".."), // packages/core/{src|dist} → repo root
    join(here, "..", "..", "..", ".."),
  ];
  for (const c of candidates) {
    const root = resolve(c);
    if (isSdmPackageRoot(root)) {
      return root;
    }
  }

  // Installed core package: dist/about.js → packages/core/ root (ABOUT.md ships since 2.1)
  const coreRoot = resolve(here, "..");
  if (isSdmPackageRoot(coreRoot)) {
    return coreRoot;
  }
  for (const c of candidates) {
    const root = resolve(c);
    if (isSdmPackageRoot(root)) {
      return root;
    }
  }

  // Try resolving the CLI package from npm (published alongside core).
  // @spec-driven-methodology/cli ships ABOUT.md + AGENTS.md + agents/ since 2.x.
  try {
    const require = createRequire(import.meta.url);
    const cliPkg = require.resolve("@spec-driven-methodology/cli/package.json");
    const cliRoot = dirname(cliPkg);
    if (isSdmPackageRoot(cliRoot)) {
      return cliRoot;
    }
  } catch {
    // CLI package not installed — fall through
  }

  let dir = resolve(process.cwd());
  for (let i = 0; i < 8; i++) {
    if (isSdmPackageRoot(dir)) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  throw new SdmError(
    "SDM_HOME_NOT_FOUND",
    "Could not locate SDM package root (ABOUT.md). Set SDM_HOME or pass sdmHome.",
  );
}

function parseAboutFrontmatter(text: string): z.infer<typeof AboutCanonFrontmatterSchema> {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n([\s\S]*))?$/);
  if (!match) {
    throw new SdmError(
      "ABOUT_CANON_INVALID",
      "ABOUT.md must start with YAML frontmatter (--- ... ---)",
    );
  }
  let raw: unknown;
  try {
    raw = yaml.load(match[1] ?? "");
  } catch (err) {
    throw new SdmError(
      "ABOUT_CANON_INVALID",
      `ABOUT.md frontmatter is not valid YAML: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  const parsed = AboutCanonFrontmatterSchema.safeParse(raw);
  if (!parsed.success) {
    throw new SdmError(
      "ABOUT_CANON_INVALID",
      `ABOUT.md frontmatter missing required fields: ${parsed.error.message}`,
    );
  }
  return parsed.data;
}

function parseSkillPurpose(skillMd: string, fallbackId: string): string {
  const match = skillMd.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (match) {
    try {
      const raw = yaml.load(match[1] ?? "") as { description?: unknown };
      if (typeof raw?.description === "string" && raw.description.trim()) {
        return raw.description.trim().replace(/\s+/g, " ");
      }
    } catch {
      // fall through
    }
  }
  const heading = skillMd.match(/^#\s+(.+)$/m);
  if (heading?.[1]?.trim()) {
    return heading[1].trim();
  }
  return fallbackId;
}

export function listPortableSkills(agentsRoot: string): { id: string; purpose: string }[] {
  if (!existsSync(agentsRoot)) {
    return [];
  }
  return readdirSync(agentsRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => existsSync(join(agentsRoot, name, "SKILL.md")))
    .sort()
    .map((id) => {
      const text = readFileSync(join(agentsRoot, id, "SKILL.md"), "utf8");
      return { id, purpose: parseSkillPurpose(text, id) };
    });
}

const DEFAULT_NEXT_STEPS = [
  {
    id: "intent-loop",
    hint: "Methodology intents («основа профиля…») → agents/intent-loop + clarify → plan → confirm → CLI/MCP",
  },
  {
    id: "quality-report",
    hint: "Corpus or summary ●○○: agents/quality-report → quality report / MCP quality_report (then HITL → intent-loop)",
  },
  {
    id: "init",
    hint: "Create a methodology project: sdm init [--with-examples]",
  },
  {
    id: "connect-mcp",
    hint: "Wire host: agents/connect-mcp → sdm mcp install --hosts … (skills by default; --no-skills to skip)",
  },
] as const;

/**
 * Product semver SSOT: root package.json `version` (name "sdm").
 */
export function getProductVersion(explicitHome?: string): string {
  const home = resolveSdmHome(explicitHome);
  const pkgPath = join(home, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version?: string };
  if (!pkg.version || typeof pkg.version !== "string") {
    throw new SdmError(
      "ABOUT_VERSION_MISSING",
      `package.json at ${pkgPath} has no version string`,
    );
  }
  return pkg.version;
}

/**
 * Build product-identity payload. Does not require a methodology project.
 */
export function buildAbout(options: BuildAboutOptions = {}): AboutPayload {
  const home = resolveSdmHome(options.sdmHome);
  const aboutPath = join(home, "ABOUT.md");
  const canon = parseAboutFrontmatter(readFileSync(aboutPath, "utf8"));
  const version = getProductVersion(home);

  const skills = listPortableSkills(join(home, "agents"));

  const payload: AboutPayload = {
    ok: true,
    version,
    name: canon.name,
    tagline: canon.tagline,
    positioning: {
      what: canon.what.trim(),
      whatNot: canon.whatNot.map((s) => s.trim()),
      model: canon.model.trim(),
    },
    capabilities: {
      cli: [...ABOUT_CLI_COMMANDS],
      mcp: [...ABOUT_MCP_TOOLS],
      skills,
    },
    nextSteps: DEFAULT_NEXT_STEPS.map((s) => ({ ...s })),
    pointers: {
      about: "ABOUT.md",
      agents: "AGENTS.md",
      changelog: "CHANGELOG.md",
    },
  };

  return AboutPayloadSchema.parse(payload);
}

/** Short human-readable summary from the same payload (CLI text mode). */
export function formatAboutText(payload: AboutPayload): string {
  const lines = [
    `${payload.name} ${payload.version}`,
    payload.tagline,
    "",
    payload.positioning.what,
    "",
    "Не является:",
    ...payload.positioning.whatNot.map((s) => `  - ${s}`),
    "",
    "Модель:",
    `  ${payload.positioning.model}`,
    "",
    `CLI commands: ${payload.capabilities.cli.length}`,
    `MCP tools: ${payload.capabilities.mcp.length}`,
    `Portable skills: ${payload.capabilities.skills.length}`,
    "",
    "Дальше:",
    ...payload.nextSteps.map((s) => `  - [${s.id}] ${s.hint}`),
    "",
    `См. ${payload.pointers.about}, ${payload.pointers.agents}, ${payload.pointers.changelog}`,
  ];
  return lines.join("\n");
}
