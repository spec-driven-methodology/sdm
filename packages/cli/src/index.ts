#!/usr/bin/env node
import { Command } from "commander";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  addQuestion,
  addSkill,
  appendActionLog,
  buildAbout,
  buildSuggest,
  createCertification,
  createProfile,
  patchCertification,
  reweightCertification,
  exportDocumentPayload,
  exportCourse,
  exportMatrix,
  exportMermaid,
  exportTest,
  exportConfluence,
  exportKit,
  findProjectRoot,
  formatAboutText,
  formatSuggestText,
  getProductVersion,
  initMethodologyProject,
  isMethodologyProject,
  hasLegacyRolesDirectory,
  syncPlayerAssets,
  linkSkill,
  listQuestions,
  listTerms,
  addTerm,
  generateQuestions,
  validateQuestion,
  validateQuestionLibraryDeep,
  inferEdgesForProject,
  healCourseWarnings,
  parseIntentPlanJson,
  parseSkillIdList,
  runCertCoverage,
  runCertGaps,
  runSkillGraph,
  runSkillImpact,
  runContentStale,
  runMethodologyAudit,
  buildQualityReport,
  formatQualityReportText,
  rebuildSemanticIndex,
  searchSemanticIndex,
  buildTopicRegistry,
  syncTopicRegistryFromSkills,
  addTopic,
  mergeRegistryLabelsIntoSkills,
  SdmError,
  type Question,
  type TermKind,
} from "@spec-driven-methodology/core";
import {
  installAgentSkills,
  listAgentHosts,
  type InstallAgentSkillsResult,
} from "./agent-hosts.js";
import { registerCompletion } from "./completion.js";
import { helpBannerText } from "./banner.js";
import {
  buildMcpConfig,
  DEFAULT_MCP_SERVER_NAME,
  formatSdmVersionOutput,
} from "./mcp-config.js";
import {
  hostConfigPath,
  installMcpHosts,
  listHosts,
  resolveHostsFromCli,
  type McpHostId,
} from "./mcp-hosts.js";

function parseRubricRows(
  raw: string[],
): { score: 0 | 1 | 2 | 3; description: string }[] {
  return raw.map((line) => {
    const idx = line.indexOf(":");
    if (idx <= 0) {
      throw new SdmError(
        "VALIDATION_FAILED",
        `Invalid --rubric "${line}". Expected score:description (score 0-3)`,
      );
    }
    const score = Number.parseInt(line.slice(0, idx), 10);
    const description = line.slice(idx + 1).trim();
    if (![0, 1, 2, 3].includes(score) || !description) {
      throw new SdmError(
        "VALIDATION_FAILED",
        `Invalid --rubric "${line}". Score must be 0-3 with non-empty description`,
      );
    }
    return { score: score as 0 | 1 | 2 | 3, description };
  });
}

const program = new Command();

program
  .name("sdm")
  .description("Spec-Driven Methodology")
  .version(formatSdmVersionOutput(getProductVersion()))
  .addHelpText("beforeAll", () => helpBannerText());

type LogMeta = {
  start: number;
  action: string;
  args: Record<string, unknown>;
  startDir: string;
};

const logMeta = new WeakMap<Command, LogMeta>();

function commandPath(cmd: Command): string {
  const parts: string[] = [];
  let current: Command | null = cmd;
  while (current && current.name() !== "sdm") {
    parts.unshift(current.name());
    current = current.parent;
  }
  return parts.join(".") || cmd.name();
}

function startDirFromOpts(opts: Record<string, unknown>): string {
  if (typeof opts.project === "string" && opts.project) {
    return resolve(opts.project);
  }
  if (typeof opts.dir === "string" && opts.dir) {
    return resolve(opts.dir);
  }
  return process.cwd();
}

program.hook("preAction", (_thisCommand, actionCommand) => {
  const opts = actionCommand.opts() as Record<string, unknown>;
  logMeta.set(actionCommand, {
    start: Date.now(),
    action: commandPath(actionCommand),
    args: opts,
    startDir: startDirFromOpts(opts),
  });
});

program.hook("postAction", (_thisCommand, actionCommand) => {
  const meta = logMeta.get(actionCommand);
  if (!meta) return;
  const ok = !process.exitCode;
  let projectRoot: string | null = null;
  try {
    projectRoot = findProjectRoot(meta.startDir);
  } catch {
    projectRoot = null;
  }
  // After init, project exists at startDir even if find failed before write
  if (!projectRoot && meta.action === "init" && isMethodologyProject(meta.startDir)) {
    projectRoot = meta.startDir;
  }
  appendActionLog({
    source: "cli",
    action: meta.action,
    args: meta.args,
    ok,
    code: ok ? undefined : (lastCliErrorCode ?? "FAILED"),
    durationMs: Date.now() - meta.start,
    startDir: meta.startDir,
    projectRoot,
    summary: { exitCode: process.exitCode ?? 0 },
  });
  lastCliErrorCode = undefined;
});

let lastCliErrorCode: string | undefined;

function emitError(err: unknown, asJson: boolean): void {
  if (err instanceof SdmError) {
    lastCliErrorCode = err.code;
    if (asJson) {
      console.error(JSON.stringify({ ok: false, code: err.code, message: err.message }));
    } else {
      console.error(`Error [${err.code}]: ${err.message}`);
    }
  } else if (err instanceof Error) {
    lastCliErrorCode = "UNEXPECTED";
    if (asJson) {
      console.error(JSON.stringify({ ok: false, code: "UNEXPECTED", message: err.message }));
    } else {
      console.error(`Error: ${err.message}`);
    }
  } else {
    lastCliErrorCode = "UNEXPECTED";
    if (asJson) {
      console.error(JSON.stringify({ ok: false, code: "UNEXPECTED", message: String(err) }));
    } else {
      console.error(`Error: ${String(err)}`);
    }
  }
  process.exitCode = 1;
}

program
  .command("init")
  .description("Initialize a SDM methodology project")
  .option("-n, --name <name>", "Project name", "my-methodology")
  .option(
    "--with-examples",
    "Seed example ontology, questions, and java-developer/middle certification",
  )
  .option("-f, --force", "Overwrite existing files", false)
  .option(
    "-d, --dir <path>",
    "Parent directory for the project (default: cwd)",
    process.cwd(),
  )
  .option(
    "--subdir <name>",
    "Create a new subdirectory with this name and init inside it",
  )
  .action((opts: { name: string; withExamples?: boolean; force: boolean; dir: string; subdir?: string }) => {
    const targetDir = resolve(opts.dir);

    if (isMethodologyProject(targetDir) && !opts.force) {
      console.error(
        `Already a SDM project (${targetDir}/sdm.yaml). Use --force to re-init.`,
      );
      process.exitCode = 1;
      return;
    }

    const result = initMethodologyProject({
      targetDir,
      name: opts.name,
      withExamples: Boolean(opts.withExamples),
      force: opts.force,
      subdir: opts.subdir,
    });

    console.log(`Initialized SDM methodology project in ${result.targetDir}`);
    console.log(`  created: ${result.created.length} paths`);
    if (result.skipped.length > 0) {
      console.log(`  skipped: ${result.skipped.length} existing paths`);
    }
    console.log("");
    console.log("Layers:");
    console.log("  ontology/         skill graph");
    console.log("  library/          questions");
    console.log("  certifications/   profiles, levels & thresholds");
    console.log("  player/           author preview for export test/learning JSON");
    console.log("  player/           author preview for export test/learning JSON");
    console.log("  .sdm/index/    optional vector index (search.provider)");
    console.log("");
    console.log("Next — wire the AI host (once per IDE workspace; not done by init):");
    console.log("  sdm mcp install --hosts gigacode --json");
    console.log(
      "  # Cursor: sdm mcp install --hosts cursor --cursor-root <ide-workspace> --json",
    );
    console.log(
      "  # Default: MCP + portable skills (intent-loop, …). Opt out: --no-skills",
    );
    console.log(
      "  # Omit --project; pass tool arg project=<this dir>. See GETTING_STARTED.md",
    );
    console.log("");
    console.log("Then (for humans): open an AI agent and describe an intent, e.g.");
    console.log('  "Основа профиля Java Middle, backend" → skill intent-loop');
    console.log("CLI is for agents/CI, not manual flag typing.");
  });

program
  .command("doctor")
  .description("Check whether the current directory is a SDM project")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { json: boolean }) => {
    const cwd = process.cwd();
    if (!isMethodologyProject(cwd)) {
      if (opts.json) {
        console.log(
          JSON.stringify({
            ok: false,
            code: "NOT_A_PROJECT",
            message: `Not a SDM project: ${cwd}`,
          }),
        );
      } else {
        console.error(`Not a SDM project. Run: sdm init`);
      }
      process.exitCode = 1;
      return;
    }
    const projectRoot = findProjectRoot(cwd);
    const legacyRoles = hasLegacyRolesDirectory(projectRoot);
    if (opts.json) {
      console.log(
        JSON.stringify({
          ok: true,
          projectRoot,
          ...(legacyRoles
            ? {
                warnings: [
                  "legacy certifications/roles/ present — migrate to certifications/profiles/",
                ],
              }
            : {}),
        }),
      );
    } else {
      console.log(`OK: SDM project at ${projectRoot}`);
      if (legacyRoles) {
        console.warn(
          "Warning: legacy certifications/roles/ present — migrate to certifications/profiles/",
        );
      }
    }
    process.exitCode = 0;
  });

program
  .command("about")
  .description(
    "Product identity: methodology-as-specs эталон (ontology→content→profiles→coverage/export), assessment+learning; not LMS / not agent harness; competency owners; version, capabilities (no project required)",
  )
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { json: boolean }) => {
    try {
      const payload = buildAbout();
      if (opts.json) {
        console.log(JSON.stringify(payload));
      } else {
        console.log(formatAboutText(payload));
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

program
  .command("suggest")
  .description(
    "Next methodology actions from project state (export / player / gaps) with Russian levers",
  )
  .option("--profile <profile>", "Profile id focus")
  .option("--level <level>", "Level id focus")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { profile?: string; level?: string; json: boolean }) => {
    try {
      const payload = buildSuggest({
        startDir: process.cwd(),
        profile: opts.profile,
        level: opts.level,
      });
      if (opts.json) {
        console.log(JSON.stringify(payload));
      } else {
        console.log(formatSuggestText(payload));
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

const player = program
  .command("player")
  .description("Export-test author preview player");

player
  .command("sync")
  .description(
    "Install or refresh player/ from SDM templates (does not touch methodology YAML)",
  )
  .option("--force", "Overwrite existing files under player/", false)
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { force: boolean; json: boolean }) => {
    try {
      const projectRoot = findProjectRoot(process.cwd());
      const result = syncPlayerAssets({
        projectRoot,
        force: opts.force,
      });
      if (opts.json) {
        console.log(
          JSON.stringify({
            ok: true,
            projectRoot: result.projectRoot,
            playerDir: result.playerDir,
            force: result.force,
            created: result.created,
            skipped: result.skipped,
          }),
        );
      } else {
        console.log(`Player sync → ${result.playerDir}`);
        console.log(`  created: ${result.created.length}`);
        console.log(`  skipped: ${result.skipped.length}`);
        if (!opts.force && result.skipped.length > 0) {
          console.log("  (use --force to overwrite existing player files)");
        }
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

program
  .command("audit")
  .description("Audit methodology quality (ontology, library duplicates, optional coverage)")
  .option("--profile <profile>", "Include coverage section for profile")
  .option("--level <level>", "Include coverage section for level")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { profile?: string; level?: string; json: boolean }) => {
    try {
      const run = runMethodologyAudit({
        startDir: process.cwd(),
        profile: opts.profile,
        level: opts.level,
      });
      if (opts.json) {
        console.log(
          JSON.stringify({
            ok: true,
            document: run.document,
            projectRoot: run.projectRoot,
          }),
        );
      } else {
        process.stdout.write(run.document.text);
      }
      const bad =
        run.document.coverage?.hasMissing ||
        (run.document.library.duplicates.length > 0 && Boolean(opts.profile));
      process.exitCode = run.document.coverage?.hasMissing ? 1 : bad ? 0 : 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

const quality = program.command("quality").description("Summary quality reports");

quality
  .command("report")
  .description(
    "Сводный отчёт качества (methodology / corpus / diff): вердикт, матрица ●○○, глоссарий",
  )
  .option("--sources <dir>", "Corpus mode: folder of markdown sources")
  .option("--profile <profile>", "Methodology focus: profile id")
  .option("--level <level>", "Methodology focus: level id")
  .option("--diff <reportId>", "Compare against a saved report id")
  .option("--save", "Persist under .sdm/reports/quality/", false)
  .option("--locale <locale>", "Human text locale: ru | en")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (opts: {
      sources?: string;
      profile?: string;
      level?: string;
      diff?: string;
      save: boolean;
      locale?: string;
      json: boolean;
    }) => {
      try {
        const run = buildQualityReport({
          startDir: process.cwd(),
          sourcesDir: opts.sources,
          profile: opts.profile,
          level: opts.level,
          diffReportId: opts.diff,
          save: opts.save,
          locale: opts.locale,
        });
        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              document: run.document,
              projectRoot: run.projectRoot,
              reportsRoot: run.reportsRoot,
            }),
          );
        } else {
          process.stdout.write(formatQualityReportText(run.document));
        }
        process.exitCode = run.document.readiness === "low" ? 1 : 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

const index = program.command("index").description("Local semantic index commands");

index
  .command("rebuild")
  .description("Rebuild the offline semantic-search PoC index")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { json: boolean }) => {
    try {
      const run = rebuildSemanticIndex(process.cwd());
      console.log(opts.json ? JSON.stringify({ ok: true, projectRoot: run.projectRoot, documentCount: run.index.documents.length }) : `Indexed ${run.index.documents.length} documents`);
    } catch (err) { emitError(err, opts.json); }
  });

program
  .command("search <query>")
  .description("Search the offline semantic-search PoC index")
  .option("--kind <kind>", "Limit to skill or question")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((query: string, opts: { kind?: "skill" | "question"; json: boolean }) => {
    try {
      if (opts.kind && opts.kind !== "skill" && opts.kind !== "question") throw new SdmError("VALIDATION_FAILED", "--kind must be skill or question");
      const run = searchSemanticIndex(process.cwd(), query, opts.kind);
      if (opts.json) {
        console.log(
          JSON.stringify({
            ok: true,
            projectRoot: run.projectRoot,
            count: run.hits.length,
            hits: run.hits,
          }),
        );
      } else {
        console.log(
          run.hits.map((hit) => `${hit.score}\t${hit.kind}\t${hit.id}`).join("\n"),
        );
      }
      process.exitCode = 0;
    } catch (err) { emitError(err, opts.json); }
  });

const cert = program.command("cert").description("Certification commands");

const profile = program.command("profile").description("Profile commands");

profile
  .command("create <id>")
  .description("Create a certification profile (empty levels; agent-friendly)")
  .requiredOption("--title <title>", "Human-readable profile title")
  .option("--force", "Overwrite existing profile file", false)
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (id: string, opts: { title: string; force: boolean; json: boolean }) => {
      try {
        const projectRoot = findProjectRoot(process.cwd());
        const result = createProfile(projectRoot, {
          profile: id,
          title: opts.title,
          force: opts.force,
        });

        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              action: result.action,
              profile: result.profile,
              path: result.path,
            }),
          );
        } else {
          console.log(`Created profile ${result.profile.profile}`);
          console.log(`  path: ${result.path}`);
          console.log("");
          console.log(
            `Next: sdm skill add … then sdm cert create --profile ${result.profile.profile} --level …`,
          );
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

cert
  .command("create")
  .description("Create a certification level for an existing profile (agent-friendly)")
  .requiredOption("--profile <id>", "Profile id (e.g. java-developer)")
  .requiredOption("--level <id>", "Level id (globally unique in project, e.g. qa-middle)")
  .requiredOption("--level-title <title>", "Human-readable level title")
  .option("--desc <text>", "Level description")
      .option(
        "--requirement <skill:depth[:weight]>",
        "Requirement: skill:depth or skill:depth:weight (repeatable). Depth can be 0..1 or junior/middle/senior/expert.",
        (value: string, prev: string[]) => [...prev, value],
        [] as string[],
      )
  .option("--threshold <n>", "Pass threshold 0..1", (v) => Number.parseFloat(v))
  .option("--force", "Overwrite existing level file", false)
  .option(
    "--no-normalize-weights",
    "Fail if requirement weights do not already sum to 1",
  )
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (opts: {
      profile: string;
      level: string;
      levelTitle: string;
      desc?: string;
      requirement: string[];
      threshold?: number;
      force: boolean;
      normalizeWeights?: boolean;
      json: boolean;
    }) => {
      try {
        const projectRoot = findProjectRoot(process.cwd());
        // Commander negates --no-normalize-weights into normalizeWeights: false
        const noNormalizeWeights = opts.normalizeWeights === false;
        const result = createCertification(projectRoot, {
          profile: opts.profile,
          level: opts.level,
          levelTitle: opts.levelTitle,
          description: opts.desc,
          requirementTriples: opts.requirement,
          threshold: opts.threshold,
          force: opts.force,
          noNormalizeWeights,
        });

        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              action: result.action,
              profile: result.profile,
              level: result.level,
              paths: result.paths,
              weightsNormalized: result.weightsNormalized,
            }),
          );
        } else {
          console.log(`Created certification ${result.profile.profile} / ${result.level.level}`);
          console.log(`  profile: ${result.paths.profile}`);
          console.log(`  level: ${result.paths.level}`);
          console.log(`  requirements: ${result.level.requirements.length}`);
          if (result.weightsNormalized) {
            console.log("  weights: normalized to sum = 1");
          }
          console.log("");
          console.log(
            `Next: sdm cert coverage --profile ${result.profile.profile} --level ${result.level.level}`,
          );
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

cert
  .command("patch")
  .description(
    "Patch an existing certification level (add/set/remove requirements, metadata)",
  )
  .requiredOption("--level <id>", "Level id to patch")
  .option("--profile <id>", "Optional profile id (consistency check against level.profile)")
  .option(
    "--add-requirement <skill:depth:weight>",
    "Add requirement (fails if skill already present; repeatable)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--set-requirement <skill:depth:weight>",
    "Upsert requirement by skill id (repeatable)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--remove-requirement <skill>",
    "Remove requirement by skill id (repeatable)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--from <skill:amount>",
    "Transfer weight from donor when adding (repeatable)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--absorb-into <skill>",
    "When removing, add removed weight onto this skill",
  )
  .option("--title <title>", "Update level title")
  .option("--desc <text>", "Update level description")
  .option("--threshold <n>", "Update pass threshold 0..1", (v) => Number.parseFloat(v))
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (opts: {
      level: string;
      profile?: string;
      addRequirement: string[];
      setRequirement: string[];
      removeRequirement: string[];
      from: string[];
      absorbInto?: string;
      title?: string;
      desc?: string;
      threshold?: number;
      json: boolean;
    }) => {
      try {
        const projectRoot = findProjectRoot(process.cwd());
        const result = patchCertification(projectRoot, {
          level: opts.level,
          profile: opts.profile,
          addTriples: opts.addRequirement,
          setTriples: opts.setRequirement,
          removeSkills: opts.removeRequirement,
          fromTransfers: opts.from,
          absorbInto: opts.absorbInto,
          title: opts.title,
          description: opts.desc,
          threshold: opts.threshold,
        });

        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              action: result.action,
              level: result.level,
              path: result.path,
              added: result.added,
              updated: result.updated,
              removed: result.removed,
            }),
          );
        } else {
          console.log(`Patched level ${result.level.level}`);
          console.log(`  path: ${result.path}`);
          console.log(`  added: ${result.added.join(", ") || "—"}`);
          console.log(`  updated: ${result.updated.join(", ") || "—"}`);
          console.log(`  removed: ${result.removed.join(", ") || "—"}`);
          console.log(`  requirements: ${result.level.requirements.length}`);
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

cert
  .command("reweight")
  .description(
    "Adjust requirement weights on a level (transfer or full --set map; sum must stay 1)",
  )
  .requiredOption("--level <id>", "Level id")
  .option("--profile <id>", "Optional profile id (consistency check)")
  .option("--skill <id>", "Transfer target skill (already on level)")
  .option("--delta <n>", "Weight to transfer onto --skill", (v) => Number.parseFloat(v))
  .option(
    "--from <skill[:amount]>",
    "Donor skill (skill or skill:amount; repeatable)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--set <skill=weight>",
    "Full weight map entry (repeatable; must cover every skill)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (opts: {
      level: string;
      profile?: string;
      skill?: string;
      delta?: number;
      from: string[];
      set: string[];
      json: boolean;
    }) => {
      try {
        const projectRoot = findProjectRoot(process.cwd());
        const result = reweightCertification(projectRoot, {
          level: opts.level,
          profile: opts.profile,
          skill: opts.skill,
          delta: opts.delta,
          from: opts.from,
          set: opts.set,
        });

        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              action: result.action,
              level: result.level.level,
              path: result.path,
              before: result.before,
              after: result.after,
              transfers: result.transfers,
            }),
          );
        } else {
          console.log(`Reweighted level ${result.level.level}`);
          console.log(`  path: ${result.path}`);
          for (const skill of Object.keys(result.after)) {
            const b = result.before[skill];
            const a = result.after[skill];
            console.log(`  ${skill}: ${b} → ${a}`);
          }
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

cert
  .command("coverage")
  .description(
    "Report how well the question library covers a certification level (profile + level)",
  )
  .requiredOption("--profile <profile>", "Profile id (e.g. java-developer)")
  .requiredOption("--level <level>", "Level id (e.g. middle)")
  .option("--team <team>", "Optional team id (requirement overlays)")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { profile: string; level: string; team?: string; json: boolean }) => {
    try {
      const { projectRoot, result, warnings, team } = runCertCoverage({
        startDir: process.cwd(),
        profile: opts.profile,
        level: opts.level,
        team: opts.team,
      });

      if (opts.json) {
        console.log(
          JSON.stringify({
            ok: true,
            projectRoot,
            profile: result.profile,
            level: result.level,
            title: result.title,
            minOkQuestions: result.minOkQuestions,
            hasMissing: result.hasMissing,
            hasThin: result.hasThin,
            coverageMode: result.coverageMode,
            workItems: result.workItems,
            team: team ?? null,
            skills: result.skills,
            warnings,
          }),
        );
      } else {
        console.log(`=== Coverage: ${result.title} ===`);
        console.log(`Project: ${projectRoot}`);
        console.log(`Profile: ${result.profile ?? "—"}  Level: ${result.level}`);
        if (team) console.log(`Team: ${team}`);
        console.log(
          `Mode: ${result.coverageMode} — ok ≥ ${result.minOkQuestions} questions/skill AND depthRatio≥0.9` +
            (result.coverageMode === "blueprint" ? " (+ topics/types blueprint)" : ""),
        );
        console.log("");

        for (const skill of result.skills) {
          console.log(
            `${skill.statusSymbol} ${skill.skill}` +
              `  depth=${skill.achievedDepth}/${skill.depth} ratio=${skill.depthRatio}` +
              `  questions=${skill.questionCount} (${skill.status})`,
          );
        }

        if (warnings.length > 0) {
          console.log("");
          console.log(`Warnings (${warnings.length} invalid question files):`);
          for (const w of warnings) {
            console.log(`  - ${w.path}: ${w.message}`);
          }
        }

        console.log("");
        if (result.hasMissing) {
          console.log("Result: FAIL — one or more skills have 0 questions");
        } else if (result.hasThin) {
          console.log("Result: FAIL — one or more skills are thin (count or depth)");
        } else {
          console.log("Result: OK — every required skill meets count and depth");
        }
      }

      process.exitCode = result.hasMissing || result.hasThin ? 1 : 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

cert
  .command("gaps")
  .description(
    "List certification skills that are missing or thin (agent-friendly subset of coverage)",
  )
  .requiredOption("--profile <profile>", "Profile id (e.g. java-developer)")
  .requiredOption("--level <level>", "Level id (e.g. middle)")
  .option("--team <team>", "Optional team id (requirement overlays)")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { profile: string; level: string; team?: string; json: boolean }) => {
    try {
      const { projectRoot, result, warnings, gaps, workItems, team } = runCertGaps({
        startDir: process.cwd(),
        profile: opts.profile,
        level: opts.level,
        team: opts.team,
      });

      if (opts.json) {
        console.log(
          JSON.stringify({
            ok: true,
            projectRoot,
            profile: result.profile,
            level: result.level,
            title: result.title,
            minOkQuestions: result.minOkQuestions,
            hasMissing: result.hasMissing,
            hasThin: result.hasThin,
            coverageMode: result.coverageMode,
            workItems,
            team: team ?? null,
            gaps,
            warnings,
          }),
        );
      } else {
        console.log(`=== Gaps: ${result.title} ===`);
        console.log(`Project: ${projectRoot}`);
        console.log(`Profile: ${result.profile ?? "—"}  Level: ${result.level}`);
        if (team) console.log(`Team: ${team}`);
        console.log(`Heuristic: ok ≥ ${result.minOkQuestions} questions/skill AND depthRatio≥0.9`);
        console.log("");

        if (gaps.length === 0) {
          console.log("No gaps — every required skill is ok");
        } else {
          for (const skill of gaps) {
            console.log(
              `${skill.statusSymbol} ${skill.skill}` +
                `  depth=${skill.achievedDepth}/${skill.depth} ratio=${skill.depthRatio}` +
                `  questions=${skill.questionCount} (${skill.status})`,
            );
          }
        }

        if (warnings.length > 0) {
          console.log("");
          console.log(`Warnings (${warnings.length} invalid question files):`);
          for (const w of warnings) {
            console.log(`  - ${w.path}: ${w.message}`);
          }
        }
      }

      process.exitCode = result.hasMissing || result.hasThin ? 1 : 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

const question = program.command("question").description("Question library commands");

question
  .command("list")
  .description("List questions in the library (optional skill filter)")
  .option("--skill <skill>", "Filter by skill id")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { skill?: string; json: boolean }) => {
    try {
      const { projectRoot, questions, warnings, skill } = listQuestions({
        startDir: process.cwd(),
        skill: opts.skill,
      });

      const summary = questions.map((q) => ({
        id: q.id,
        skill: q.skill,
        type: q.type,
        difficulty: q.difficulty,
      }));

      if (opts.json) {
        console.log(
          JSON.stringify({
            ok: true,
            projectRoot,
            skill: skill ?? null,
            count: summary.length,
            questions: summary,
            warnings,
          }),
        );
      } else {
        console.log(`=== Questions${skill ? ` (skill=${skill})` : ""} ===`);
        console.log(`Project: ${projectRoot}`);
        console.log(`Count: ${summary.length}`);
        console.log("");
        for (const q of summary) {
          console.log(
            `- ${q.id}  skill=${q.skill}  type=${q.type}  difficulty=${q.difficulty}`,
          );
        }
        if (warnings.length > 0) {
          console.log("");
          console.log(`Warnings (${warnings.length}):`);
          for (const w of warnings) {
            console.log(`  - ${w.path}: ${w.message}`);
          }
        }
      }
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

question
  .command("generate")
  .description(
    "Build agent-facing draft shells + context for a skill (does not write files)",
  )
  .requiredOption("--to-skill <skill>", "Skill id to generate drafts for")
  .option("--count <n>", "Number of draft stubs (1..20)", (v) => Number.parseInt(v, 10), 3)
  .option("--difficulty-min <n>", "Min difficulty 0..1", parseFloat)
  .option("--difficulty-max <n>", "Max difficulty 0..1", parseFloat)
  .option(
    "--type <type>",
    "Homogeneous draft type: single_choice | multi_choice | code | open (mutually exclusive with --mix)",
  )
  .option(
    "--mix <preset>",
    "Type-mix preset: single | mixed | full (mutually exclusive with --type)",
  )
  .option("--profile <profile>", "Optional profile id to attach gap status")
  .option("--level <level>", "Optional level id to attach gap status")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (opts: {
      toSkill: string;
      count: number;
      difficultyMin?: number;
      difficultyMax?: number;
      type?: string;
      mix?: string;
      profile?: string;
      level?: string;
      json: boolean;
    }) => {
      try {
        const result = generateQuestions({
          startDir: process.cwd(),
          skill: opts.toSkill,
          count: opts.count,
          difficultyMin: opts.difficultyMin,
          difficultyMax: opts.difficultyMax,
          type: opts.type as Question["type"] | undefined,
          mix: opts.mix,
          profile: opts.profile,
          level: opts.level,
        });

        if (opts.json) {
          console.log(JSON.stringify({ ok: true, ...result }));
        } else {
          console.log(`=== Generate drafts: ${result.context.skill.id} ===`);
          console.log(`Project: ${result.projectRoot}`);
          console.log(`Type mix: ${result.typeMix}`);
          console.log(`Existing: ${result.context.existingCount}`);
          if (result.context.gap) {
            console.log(
              `Gap: ${result.context.gap.status} (${result.context.gap.questionCount} questions)`,
            );
          }
          console.log("");
          console.log("--- Agent prompt ---");
          console.log(result.context.agentPrompt);
          console.log("");
          console.log(`Drafts (${result.drafts.length}):`);
          for (const d of result.drafts) {
            console.log(
              `- #${d.index} type=${d.type} difficulty=${d.difficulty} text=${d.text}`,
            );
          }
          console.log("");
          console.log(`Next: ${result.nextStep}`);
        }
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

question
  .command("add")
  .description("Add a question bound to a skill (agent-friendly, non-interactive)")
  .requiredOption("--to-skill <skill>", "Skill id to bind the question to")
  .requiredOption(
    "--type <type>",
    "Question type: single_choice | multi_choice | code | open",
  )
  .requiredOption("--difficulty <n>", "Difficulty 0..1", parseFloat)
  .requiredOption("--text <text>", "Question text")
  .option(
    "--option <text>",
    "Answer option (repeatable; required for choice types)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--correct <n>",
    "Correct option index, 1-based (repeatable for multi_choice)",
    (value: string, prev: number[]) => [...prev, Number.parseInt(value, 10)],
    [] as number[],
  )
  .option("--explanation <text>", "Explanation shown after answering")
  .option("--code-template <text>", "Code template for type=code")
  .option(
    "--expected <text>",
    "Expected short answer for type=open (repeatable)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--topic <topic>",
    "Topic tag (repeatable)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--evidence <kind>",
    "Probe evidence: knowledge | skill | artifact (open/code)",
  )
  .option("--min-depth <n>", "Probe min_depth 0..1 (open/code)", parseFloat)
  .option(
    "--red-flag <text>",
    "Probe red flag (repeatable)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--rubric <score:text>",
    "Rubric row score:description (repeatable, score 0-3)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option("--id <id>", "Question id (generated if omitted)")
  .option("--force", "Overwrite existing question file", false)
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (opts: {
      toSkill: string;
      type: string;
      difficulty: number;
      text: string;
      option: string[];
      correct: number[];
      explanation?: string;
      codeTemplate?: string;
      expected: string[];
      topic: string[];
      evidence?: string;
      minDepth?: number;
      redFlag: string[];
      rubric: string[];
      id?: string;
      force: boolean;
      json: boolean;
    }) => {
      try {
        const allowed: Question["type"][] = [
          "single_choice",
          "multi_choice",
          "code",
          "open",
        ];
        if (!allowed.includes(opts.type as Question["type"])) {
          throw new SdmError(
            "VALIDATION_FAILED",
            `Invalid --type "${opts.type}". Expected: ${allowed.join(", ")}`,
          );
        }

        let correct: number | number[] | undefined;
        if (opts.correct.length === 1) {
          correct = opts.correct[0];
        } else if (opts.correct.length > 1) {
          correct = opts.correct;
        }

        let expected: string | string[] | undefined;
        if (opts.expected.length === 1) {
          expected = opts.expected[0];
        } else if (opts.expected.length > 1) {
          expected = opts.expected;
        }

        const projectRoot = findProjectRoot(process.cwd());
        const evidenceKinds = ["knowledge", "skill", "artifact"] as const;
        if (
          opts.evidence &&
          !evidenceKinds.includes(opts.evidence as (typeof evidenceKinds)[number])
        ) {
          throw new SdmError(
            "VALIDATION_FAILED",
            `Invalid --evidence "${opts.evidence}". Expected: ${evidenceKinds.join(", ")}`,
          );
        }
        const result = addQuestion(projectRoot, {
          skill: opts.toSkill,
          type: opts.type as Question["type"],
          difficulty: opts.difficulty,
          text: opts.text,
          options: opts.option.length > 0 ? opts.option : undefined,
          correct,
          expected,
          explanation: opts.explanation,
          code_template: opts.codeTemplate,
          topics: opts.topic.length > 0 ? opts.topic : undefined,
          evidence: opts.evidence as Question["evidence"] | undefined,
          min_depth: opts.minDepth,
          red_flags: opts.redFlag.length > 0 ? opts.redFlag : undefined,
          rubric: opts.rubric.length > 0 ? parseRubricRows(opts.rubric) : undefined,
          id: opts.id,
          force: opts.force,
        });

        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              question: result.question,
              path: result.path,
              skill: result.skill,
              warnings: result.warnings ?? [],
            }),
          );
        } else {
          console.log(`Added question ${result.question.id}`);
          console.log(`  skill: ${result.skill}`);
          console.log(`  path:  ${result.path}`);
          if (result.warnings?.length) {
            console.log(`  warnings: ${result.warnings.length}`);
          }
          console.log("");
          console.log("Next: sdm cert coverage --profile <profile> --level <level>");
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

question
  .command("validate")
  .description("Dry-run validate a question draft (no writes; agent rewrite loop)")
  .requiredOption("--to-skill <skill>", "Skill id to bind the question to")
  .requiredOption(
    "--type <type>",
    "Question type: single_choice | multi_choice | code | open",
  )
  .requiredOption("--difficulty <n>", "Difficulty 0..1", parseFloat)
  .requiredOption("--text <text>", "Question text")
  .option(
    "--option <text>",
    "Answer option (repeatable; required for choice types)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--correct <n>",
    "Correct option index, 1-based (repeatable for multi_choice)",
    (value: string, prev: number[]) => [...prev, Number.parseInt(value, 10)],
    [] as number[],
  )
  .option("--explanation <text>", "Explanation shown after answering")
  .option("--code-template <text>", "Code template for type=code")
  .option(
    "--expected <text>",
    "Expected short answer for type=open (repeatable)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--topic <topic>",
    "Topic tag (repeatable)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option("--id <id>", "Optional question id (for near-dup exclude on overwrite)")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (opts: {
      toSkill: string;
      type: string;
      difficulty: number;
      text: string;
      option: string[];
      correct: number[];
      explanation?: string;
      codeTemplate?: string;
      expected: string[];
      topic: string[];
      id?: string;
      json: boolean;
    }) => {
      try {
        const allowed: Question["type"][] = [
          "single_choice",
          "multi_choice",
          "code",
          "open",
        ];
        if (!allowed.includes(opts.type as Question["type"])) {
          throw new SdmError(
            "VALIDATION_FAILED",
            `Invalid --type "${opts.type}". Expected: ${allowed.join(", ")}`,
          );
        }

        let correct: number | number[] | undefined;
        if (opts.correct.length === 1) {
          correct = opts.correct[0];
        } else if (opts.correct.length > 1) {
          correct = opts.correct;
        }

        let expected: string | string[] | undefined;
        if (opts.expected.length === 1) {
          expected = opts.expected[0];
        } else if (opts.expected.length > 1) {
          expected = opts.expected;
        }

        const result = validateQuestion({
          startDir: process.cwd(),
          input: {
            skill: opts.toSkill,
            type: opts.type as Question["type"],
            difficulty: opts.difficulty,
            text: opts.text,
            options: opts.option.length > 0 ? opts.option : undefined,
            correct,
            expected,
            explanation: opts.explanation,
            code_template: opts.codeTemplate,
            topics: opts.topic.length > 0 ? opts.topic : undefined,
            id: opts.id,
          },
        });

        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: result.ok,
              projectRoot: result.projectRoot,
              skill: result.skill.id,
              errors: result.errors,
              findings: result.findings,
              question: result.question ?? null,
            }),
          );
        } else {
          console.log(result.ok ? "OK — draft passes validation" : "FAIL — draft has errors");
          for (const e of result.errors) {
            console.log(`  error [${e.code}]: ${e.message}`);
          }
          for (const f of result.findings) {
            console.log(`  finding [${f.code}]: ${f.message}`);
          }
        }
        process.exitCode = result.ok ? 0 : 1;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

const term = program.command("term").description("Glossary term library commands");

term
  .command("list")
  .description("List terms in library/terms (optional skill filter)")
  .option("--skill <skill>", "Filter by linked skill id")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { skill?: string; json: boolean }) => {
    try {
      const { projectRoot, terms, warnings, skill } = listTerms({
        startDir: process.cwd(),
        skill: opts.skill,
      });
      const summary = terms.map((t) => ({
        id: t.id,
        term: t.term,
        kind: t.kind,
        skills: t.skills,
      }));
      if (opts.json) {
        console.log(
          JSON.stringify({
            ok: true,
            projectRoot,
            skill: skill ?? null,
            count: summary.length,
            terms: summary,
            warnings,
          }),
        );
      } else {
        console.log(`=== Terms${skill ? ` (skill=${skill})` : ""} ===`);
        console.log(`Project: ${projectRoot}`);
        console.log(`Count: ${summary.length}`);
        for (const t of summary) {
          console.log(
            `- ${t.id}  ${t.term}  kind=${t.kind}  skills=${t.skills.join(",") || "—"}`,
          );
        }
      }
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

term
  .command("add")
  .description("Add a glossary term to library/terms")
  .argument("<id>", "Term id (filename stem)")
  .requiredOption("--term <label>", "Display term label")
  .requiredOption("--definition <text>", "Definition prose")
  .option(
    "--alias <text>",
    "Alias (repeatable)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--skill <skillId>",
    "Linked skill id (repeatable)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option("--kind <kind>", "concept | product", "concept")
  .option("--force", "Overwrite existing term file", false)
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (
      id: string,
      opts: {
        term: string;
        definition: string;
        alias: string[];
        skill: string[];
        kind: string;
        force: boolean;
        json: boolean;
      },
    ) => {
      try {
        const kinds = ["concept", "product"] as const;
        if (!kinds.includes(opts.kind as (typeof kinds)[number])) {
          throw new SdmError(
            "VALIDATION_FAILED",
            `Invalid --kind "${opts.kind}". Expected: concept, product`,
          );
        }
        const projectRoot = findProjectRoot(process.cwd());
        const result = addTerm(projectRoot, {
          id,
          term: opts.term,
          definition: opts.definition,
          aliases: opts.alias.length > 0 ? opts.alias : undefined,
          skills: opts.skill.length > 0 ? opts.skill : undefined,
          kind: opts.kind as TermKind,
          force: opts.force,
        });
        if (opts.json) {
          console.log(JSON.stringify({ ok: true, ...result }));
        } else {
          console.log(`Added term ${result.term.id}`);
          console.log(`  path: ${result.path}`);
        }
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

const topic = program
  .command("topic")
  .description("Project-wide topic registry (library/topics)");

topic
  .command("registry")
  .description(
    "Report topic registry status: registered topics, slugs from skills/questions/courses missing from registry, orphans, unused",
  )
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { json: boolean }) => {
    try {
      const projectRoot = findProjectRoot(process.cwd());
      const idx = buildTopicRegistry(projectRoot);
      const payload = {
        ok: true,
        projectRoot,
        registered: idx.registered.size,
        unregisteredFromSkills: idx.unregisteredFromSkills,
        orphanQuestionTopics: idx.orphanQuestionTopics,
        unregisteredFromCourses: idx.unregisteredFromCourses,
        unused: idx.unused,
      };
      if (opts.json) {
        console.log(JSON.stringify(payload));
      } else {
        console.log(`=== Topic registry (${idx.registered.size} topics) ===`);
        console.log(`Project: ${projectRoot}`);
        console.log("");
        console.log(`Unregistered from skill.topics: ${idx.unregisteredFromSkills.length}`);
        for (const t of idx.unregisteredFromSkills) console.log(`  - ${t}`);
        console.log("");
        console.log(`Orphan question topics (no skill, no registry): ${idx.orphanQuestionTopics.length}`);
        for (const t of idx.orphanQuestionTopics) console.log(`  - ${t}`);
        console.log("");
        console.log(`Unregistered from course lessons: ${idx.unregisteredFromCourses.length}`);
        for (const t of idx.unregisteredFromCourses) console.log(`  - ${t}`);
        console.log("");
        console.log(`Unused registered topics: ${idx.unused.length}`);
        for (const t of idx.unused) console.log(`  - ${t}`);
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

topic
  .command("sync")
  .description(
    "Back-fill library/topics YAML for every slug in skill.topics (idempotent)",
  )
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { json: boolean }) => {
    try {
      const projectRoot = findProjectRoot(process.cwd());
      const created = syncTopicRegistryFromSkills(projectRoot);
      if (opts.json) {
        console.log(JSON.stringify({ ok: true, projectRoot, created }));
      } else {
        console.log(`Topic registry sync → created ${created.length}:`);
        for (const c of created) console.log(`  + ${c}`);
        if (created.length === 0) console.log("  (nothing to create)");
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

topic
  .command("apply")
  .description(
    "Merge registry labels into skill.topic_labels (one-shot enrichment)",
  )
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { json: boolean }) => {
    try {
      const projectRoot = findProjectRoot(process.cwd());
      const updated = mergeRegistryLabelsIntoSkills(projectRoot);
      if (opts.json) {
        console.log(JSON.stringify({ ok: true, projectRoot, updatedSkills: updated }));
      } else {
        console.log(`Applied registry labels to ${updated} skill(s)`);
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

topic
  .command("add")
  .description("Add a topic to library/topics")
  .argument("<id>", "Topic slug (identity)")
  .option("--label <text>", "Learner-facing label (default: slug)")
  .option("--definition <text>", "Optional definition for glossary")
  .option("--alias <text>", "Alias (repeatable)")
  .option("--skill <skillId>", "Associated skill (repeatable)")
  .option("--force", "Overwrite existing topic file", false)
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (
      id: string,
      opts: {
        label?: string;
        definition?: string;
        alias: string[];
        skill: string[];
        force: boolean;
        json: boolean;
      },
    ) => {
      try {
        const projectRoot = findProjectRoot(process.cwd());
        const topic = addTopic(projectRoot, {
          id,
          label: opts.label,
          definition: opts.definition,
          aliases: opts.alias.length > 0 ? opts.alias : undefined,
          skills: opts.skill.length > 0 ? opts.skill : undefined,
          force: opts.force,
        });
        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              topic,
              path: join(projectRoot, "library", "topics", `${topic.id}.yaml`),
            }),
          );
        } else {
          console.log(`Added topic ${topic.id}`);
          console.log(`  label: ${topic.label}`);
          console.log(`  path:  ${join(projectRoot, "library", "topics", `${topic.id}.yaml`)}`);
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

const course = program
  .command("course")
  .description("Course healing commands (auto-fix warnings)");

course
  .command("heal")
  .description(
    "Auto-fill topic registry, back-fill skill topics from lessons, suggest descriptions from lesson content. Run after filling lesson bodies but before re-export.",
  )
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(async (opts: { json: boolean }) => {
    try {
      const projectRoot = findProjectRoot(process.cwd());
      // Load the most recent course export (first course file in exports/)
      const exportsDir = join(projectRoot, "exports");
      const files = readdirSync(exportsDir).filter((f: string) => f.startsWith("course-") && f.endsWith(".json")).sort();
      if (files.length === 0) {
        throw new SdmError(
          "COURSE_HEAL_NO_EXPORT",
          "No course export file found under exports/. Export a filled course pack first via export learning.",
        );
      }
      const latestFile = files[files.length - 1];
      const raw = readFileSync(join(exportsDir, latestFile), "utf8");
      const doc = JSON.parse(raw);
      const modules = doc.document?.modules ?? doc.modules ?? [];
      const warnings = doc.document?.warnings ?? doc.warnings ?? [];
      const result = healCourseWarnings({ projectRoot, modules, warnings });
      if (opts.json) {
        console.log(JSON.stringify({ ok: true, ...result }));
      } else {
        console.log(`Course heal completed:`);
        console.log(`  registry topics created: ${result.registryCreated.length}`);
        console.log(`  skill topics back-filled: ${result.backfilledTopics.length}`);
        console.log(`  descriptions suggested: ${result.suggestedDescriptions.length}`);
        if (result.backfilledTopics.length > 0) {
          console.log("  skills updated:", result.backfilledTopics.join(", "));
        }
        if (result.registryCreated.length > 0) {
          console.log("  new topics:", result.registryCreated.slice(0, 10).join(", "));
        }
        console.log("");
        console.log("Re-run export learning to confirm warnings shrank.");
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

const skill = program.command("skill").description("Ontology skill commands");

skill
  .command("add")
  .description("Add a skill to the ontology (agent-friendly, non-interactive)")
  .argument("<id>", "Skill id (filename stem)")
  .requiredOption("--name <name>", "Human-readable skill name")
  .option("--kind <kind>", "Node kind (skill, concept, topic, talk...)", "skill")
  .option("--category <category>", "Category id (e.g. backend)")
  .option("--desc <text>", "Short description")
  .option("--description <text>", "Alias for --desc")
  .option(
    "--topic <topic>",
    "Expected topic tag (repeatable)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option("--force", "Overwrite existing skill file", false)
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (
      id: string,
      opts: {
        name: string;
        kind?: string;
        category?: string;
        desc?: string;
        description?: string;
        topic: string[];
        force: boolean;
        json: boolean;
      },
    ) => {
      try {
        const projectRoot = findProjectRoot(process.cwd());
        const result = addSkill(projectRoot, {
          id,
          name: opts.name,
          kind: opts.kind,
          category: opts.category,
          description: opts.desc ?? opts.description,
          topics: opts.topic.length > 0 ? opts.topic : undefined,
          force: opts.force,
        });

        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              action: result.action,
              skill: result.skill,
              path: result.path,
              warnings: result.warnings ?? [],
            }),
          );
        } else {
          console.log(`Added skill ${result.skill.id}`);
          console.log(`  name: ${result.skill.name}`);
          console.log(`  path: ${result.path}`);
          if (result.warnings?.length) {
            for (const w of result.warnings) {
              console.log(`  warning [${w.code}]: ${w.message}`);
            }
          }
          console.log("");
          console.log("Next: sdm skill link <id> --depends-on <a,b>");
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

skill
  .command("link")
  .description("Link depends_on / related_to edges on an existing skill")
  .argument("<id>", "Skill id to update")
  .option("--depends-on <ids>", "Comma-separated skill ids (merged into depends_on)")
  .option("--related-to <ids>", "Comma-separated skill ids (merged into related_to)")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (
      id: string,
      opts: { dependsOn?: string; relatedTo?: string; json: boolean },
    ) => {
      try {
        const projectRoot = findProjectRoot(process.cwd());
        const result = linkSkill(projectRoot, id, {
          dependsOn: parseSkillIdList(opts.dependsOn),
          relatedTo: parseSkillIdList(opts.relatedTo),
        });

        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              action: result.action,
              skill: result.skill,
              path: result.path,
            }),
          );
        } else {
          console.log(`Linked skill ${result.skill.id}`);
          console.log(`  depends_on: ${result.skill.depends_on.join(", ") || "—"}`);
          console.log(`  related_to: ${result.skill.related_to.join(", ") || "—"}`);
          console.log(`  path: ${result.path}`);
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

skill
  .command("graph")
  .description("Show skill dependency tree for a profile/level (optional coverage bars)")
  .requiredOption("--profile <profile>", "Profile id")
  .requiredOption("--level <level>", "Level id")
  .option("--coverage", "Include coverage bars/status (default)", true)
  .option("--no-coverage", "Omit coverage indicators")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (opts: {
      profile: string;
      level: string;
      coverage: boolean;
      json: boolean;
    }) => {
      try {
        const run = runSkillGraph({
          startDir: process.cwd(),
          profile: opts.profile,
          level: opts.level,
          coverage: opts.coverage,
        });
        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              document: run.document,
              projectRoot: run.projectRoot,
              warnings: run.warnings,
            }),
          );
        } else {
          console.log(`${run.document.title} (${opts.profile}/${opts.level})`);
          console.log(run.document.text || "(no required skills)");
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

skill
  .command("impact")
  .description(
    "Show skills/profiles/levels/questions/exports affected by changing a skill",
  )
  .requiredOption("--skill <id>", "Skill id")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { skill: string; json: boolean }) => {
    try {
      const run = runSkillImpact({
        startDir: process.cwd(),
        skill: opts.skill,
      });
      if (opts.json) {
        console.log(
          JSON.stringify({
            ok: true,
            document: run.document,
            projectRoot: run.projectRoot,
          }),
        );
      } else {
        const d = run.document;
        console.log(`Impact of skill ${d.skill}`);
        console.log(
          `  downstream skills: ${d.downstreamSkills.join(", ") || "—"}`,
        );
        console.log(`  profiles: ${d.profiles.join(", ") || "—"}`);
        console.log(
          `  levels: ${d.levels.map((l) => l.level).join(", ") || "—"}`,
        );
        console.log(
          `  questions: ${d.questions.length} (${d.questions.map((q) => q.id).slice(0, 8).join(", ")}${d.questions.length > 8 ? ", …" : ""})`,
        );
        console.log(
          `  exports: ${d.exports.length}${
            d.exports.length
              ? ` (${d.exports.map((e) => e.path).slice(0, 5).join(", ")}${d.exports.length > 5 ? ", …" : ""})`
              : ""
          }`,
        );
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

const content = program
  .command("content")
  .description("Content freshness / basis against ontology");

content
  .command("stale")
  .description(
    "List questions/exports with missing or mismatched meta.basis (content freshness)",
  )
  .option("--skill <id>", "Skill id scope (questions bound to this skill)")
  .option("--profile <profile>", "Profile id (with --level)")
  .option("--level <level>", "Level id (with --profile)")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    (opts: {
      skill?: string;
      profile?: string;
      level?: string;
      json: boolean;
    }) => {
      try {
        const run = runContentStale({
          startDir: process.cwd(),
          skill: opts.skill,
          profile: opts.profile,
          level: opts.level,
        });
        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              document: run.document,
              projectRoot: run.projectRoot,
            }),
          );
        } else {
          const d = run.document;
          console.log("Content stale");
          if (d.skill) console.log(`  skill: ${d.skill}`);
          if (d.profile) console.log(`  profile: ${d.profile}`);
          if (d.level) console.log(`  level: ${d.level}`);
          if (d.stale.length === 0) {
            console.log("  (no stale items)");
          } else {
            for (const item of d.stale) {
              const key = item.id ?? item.path ?? "?";
              console.log(
                `  [${item.severity}] ${item.kind} ${key} — ${item.reason}`,
              );
            }
          }
          console.log(`  workItems: ${d.workItems.length}`);
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

const exportCmd = program
  .command("export")
  .description("Export methodology packages for external consumers");

exportCmd
  .command("test")
  .description("Export a certification test package (questions + requirements)")
  .requiredOption("--profile <profile>", "Profile id (e.g. java-developer)")
  .requiredOption("--level <level>", "Level id (e.g. middle)")
  .option("--format <format>", "Consumer format: json|csv", "json")
  .option("--team <team>", "Optional team id (requirement overlays)")
  .option("--adaptive", "Sample questions per skill by depth proximity", false)
  .option(
    "--seed <n>",
    "RNG seed for adaptive sampling and/or --shuffle-options",
    (v) => Number.parseInt(v, 10),
    42,
  )
  .option("--per-skill <n>", "Questions per skill when adaptive", (v) => Number.parseInt(v, 10), 3)
  .option(
    "--shuffle-options",
    "Permute choice options and remap correct (deterministic with --seed)",
    false,
  )
  .option(
    "--include-type <type>",
    "Allowlist question type (repeatable; mutually exclusive with --exclude-type)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--exclude-type <type>",
    "Denylist question type (repeatable; mutually exclusive with --include-type)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--include-skill <id>",
    "Allowlist skill id (repeatable; mutually exclusive with --exclude-skill)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--exclude-skill <id>",
    "Denylist skill id (repeatable; mutually exclusive with --include-skill)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option(
    "--include-question <id>",
    "Allowlist question id (repeatable; after skill/type filters)",
    (value: string, prev: string[]) => [...prev, value],
    [] as string[],
  )
  .option("--json", "Agent envelope { ok, format, document }", false)
  .option(
    "--raw",
    "Print the bare consumer document (schemaVersion at top level), no envelope",
    false,
  )
  .action(
    (opts: {
      profile: string;
      level: string;
      format: string;
      team?: string;
      adaptive: boolean;
      seed: number;
      perSkill: number;
      shuffleOptions: boolean;
      includeType: string[];
      excludeType: string[];
      includeSkill: string[];
      excludeSkill: string[];
      includeQuestion: string[];
      json: boolean;
      raw: boolean;
    }) => {
      try {
        const run = exportTest({
          startDir: process.cwd(),
          profile: opts.profile,
          level: opts.level,
          format: opts.format,
          team: opts.team,
          adaptive: opts.adaptive,
          seed: opts.seed,
          perSkill: opts.perSkill,
          shuffleOptions: opts.shuffleOptions,
          includeTypes: opts.includeType.length ? opts.includeType : undefined,
          excludeTypes: opts.excludeType.length ? opts.excludeType : undefined,
          includeSkills: opts.includeSkill.length ? opts.includeSkill : undefined,
          excludeSkills: opts.excludeSkill.length ? opts.excludeSkill : undefined,
          includeQuestions: opts.includeQuestion.length
            ? opts.includeQuestion
            : undefined,
        });
        if (opts.raw) {
          if (run.format === "csv") {
            process.stdout.write(run.csv ?? "");
          } else {
            console.log(JSON.stringify(run.document, null, 2));
          }
        } else if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              format: run.format,
              document: exportDocumentPayload(run.format, run.document, run.csv),
              projectRoot: run.projectRoot,
              warnings: run.warnings,
            }),
          );
        } else if (run.format === "csv") {
          process.stdout.write(run.csv ?? "");
        } else {
          console.log(JSON.stringify(run.document, null, 2));
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

exportCmd
  .command("matrix")
  .description("Export a role competency matrix (levels × skills)")
  .requiredOption("--profile <profile>", "Profile id (e.g. java-developer)")
  .option("--format <format>", "Consumer format: csv|json", "csv")
  .option("--json", "Agent envelope { ok, format, document }", false)
  .option(
    "--raw",
    "Print the bare consumer document (schemaVersion at top level), no envelope",
    false,
  )
  .action((opts: { profile: string; format: string; json: boolean; raw: boolean }) => {
    try {
      const run = exportMatrix({
        startDir: process.cwd(),
        profile: opts.profile,
        format: opts.format,
      });
      if (opts.raw) {
        if (run.format === "csv") {
          process.stdout.write(run.csv ?? "");
        } else {
          console.log(JSON.stringify(run.document, null, 2));
        }
      } else if (opts.json) {
        console.log(
          JSON.stringify({
            ok: true,
            format: run.format,
            document: exportDocumentPayload(run.format, run.document, run.csv),
            projectRoot: run.projectRoot,
          }),
        );
      } else if (run.format === "csv") {
        process.stdout.write(run.csv ?? "");
      } else {
        console.log(JSON.stringify(run.document, null, 2));
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

type ExportLearningCliOpts = {
  profile?: string;
  level?: string;
  fromGaps: boolean;
  skill?: string;
  topic?: string;
  fromQuestions?: string;
  depth: string;
  format: string;
  practice: boolean;
  locale?: string;
  strictContext: boolean;
  json: boolean;
  raw: boolean;
};

function registerExportLearningCommand(
  name: string,
  description: string,
): void {
  exportCmd
    .command(name)
    .description(description)
    .option("--profile <profile>", "Profile id (with --level)")
    .option("--level <level>", "Level id (with --profile)")
    .option(
      "--from-gaps",
      "Modules only for missing/thin skills (needs profile/level)",
      false,
    )
    .option("--skill <id>", "Single skill pack")
    .option("--topic <topic>", "Filter by skill/question topic tag")
    .option(
      "--from-questions <ids>",
      "Comma-separated question ids (teach under these anchors)",
    )
    .option(
      "--depth <depth>",
      "Content depth: brief|standard|detailed",
      "standard",
    )
    .option(
      "--format <format>",
      "Artifact format: howto|notes|cheatsheet|course (concept→notes deprecated)",
      "howto",
    )
    .option("--no-practice", "Omit practiceQuestionIds")
    .option("--locale <locale>", "Optional locale hint for agent prose (e.g. ru)")
    .option(
      "--strict-context",
      "Fail when depth=detailed and critical TeachingContext warnings exist",
      false,
    )
    .option("--json", "Agent envelope { ok, document, warnings }", false)
    .option(
      "--raw",
      "Print the bare consumer document (schemaVersion at top level), no envelope",
      false,
    )
    .action((opts: ExportLearningCliOpts) => {
      try {
        const fromQuestions = opts.fromQuestions
          ? opts.fromQuestions
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;
        const run = exportCourse({
          startDir: process.cwd(),
          profile: opts.profile,
          level: opts.level,
          fromGaps: opts.fromGaps,
          skill: opts.skill,
          topic: opts.topic,
          fromQuestions,
          depth: opts.depth,
          format: opts.format,
          includePractice: opts.practice,
          locale: opts.locale,
          strictContext: opts.strictContext,
        });
        if (opts.raw) {
          console.log(JSON.stringify(run.document, null, 2));
        } else if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              document: run.document,
              projectRoot: run.projectRoot,
              warnings: run.document.warnings,
              loadWarnings: run.loadWarnings,
            }),
          );
        } else {
          console.log(JSON.stringify(run.document, null, 2));
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    });
}

registerExportLearningCommand(
  "learning",
  "Export educational materials (TeachingContext + modules + practice ids; not an LMS)",
);
registerExportLearningCommand(
  "course",
  "Alias of export learning (TeachingContext + modules + practice ids; not an LMS)",
);

exportCmd
  .command("kit")
  .description(
    "Export expert interview kit (skill cards + open/code probes + glossary; HTML is render only)",
  )
  .requiredOption("--profile <profile>", "Profile id")
  .requiredOption("--level <level>", "Level id")
  .option("--format <format>", "Output format: json|html", "json")
  .option(
    "--strict",
    "Fail when kit-readiness warnings exist (missing probes, explanations)",
    false,
  )
  .option(
    "--out <path>",
    "Write output to file (creates parent dirs). Default: stdout. Convention: exports/kit-<profile>-<level>.html",
  )
  .option("--json", "Agent envelope { ok, document, warnings }", false)
  .option(
    "--raw",
    "Print the bare consumer document (schemaVersion at top level), no envelope",
    false,
  )
  .action(
    (opts: {
      profile: string;
      level: string;
      format: string;
      strict: boolean;
      out?: string;
      json: boolean;
      raw: boolean;
    }) => {
      try {
        const run = exportKit({
          startDir: process.cwd(),
          profile: opts.profile,
          level: opts.level,
          format: opts.format,
          strict: opts.strict,
        });
        const writeOut = (content: string): string => {
          const outPath = resolve(process.cwd(), opts.out!);
          mkdirSync(dirname(outPath), { recursive: true });
          writeFileSync(outPath, content, "utf8");
          return outPath;
        };
        const fileBody =
          run.format === "html" && run.html
            ? run.html
            : JSON.stringify(run.document, null, 2);
        const outPath = opts.out ? writeOut(fileBody) : undefined;
        if (opts.raw) {
          if (run.format === "html" && run.html) {
            process.stdout.write(run.html);
          } else {
            console.log(JSON.stringify(run.document, null, 2));
          }
        } else if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              format: run.format,
              document: run.document,
              ...(run.html !== undefined ? { html: run.html } : {}),
              projectRoot: run.projectRoot,
              warnings: run.document.warnings,
              loadWarnings: run.loadWarnings,
              ...(outPath ? { outPath } : {}),
            }),
          );
        } else if (run.format === "html" && run.html) {
          if (outPath) {
            console.error(`Wrote ${outPath}`);
          } else {
            process.stdout.write(run.html);
          }
        } else if (outPath) {
          console.error(`Wrote ${outPath}`);
        } else {
          console.log(JSON.stringify(run.document, null, 2));
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

exportCmd
  .command("mermaid")
  .description("Export a Mermaid skill graph (coverage-colored) for Confluence paste")
  .requiredOption("--profile <profile>", "Profile id (e.g. java-developer)")
  .requiredOption("--level <level>", "Level id (e.g. middle)")
  .option("--no-coverage", "Disable coverage coloring on nodes")
  .option("--json", "Agent envelope { ok, format, document }", false)
  .action((opts: { profile: string; level: string; coverage?: boolean; json: boolean }) => {
    try {
      const run = exportMermaid({
        startDir: process.cwd(),
        profile: opts.profile,
        level: opts.level,
        coverage: opts.coverage !== false,
      });
      if (opts.json) {
        console.log(
          JSON.stringify({
            ok: true,
            format: run.format,
            document: run.document,
            projectRoot: run.projectRoot,
            warnings: run.warnings,
          }),
        );
      } else {
        process.stdout.write(run.document.markdown);
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

exportCmd
  .command("confluence")
  .description("Export a Confluence-ready Markdown page (coverage + mermaid + matrix)")
  .requiredOption("--profile <profile>", "Profile id")
  .option("--level <level>", "Level id (includes coverage + mermaid when set)")
  .option("--team <team>", "Optional team id")
  .option("--json", "Agent envelope { ok, document }", false)
  .action((opts: { profile: string; level?: string; team?: string; json: boolean }) => {
    try {
      const run = exportConfluence({
        startDir: process.cwd(),
        profile: opts.profile,
        level: opts.level,
        team: opts.team,
      });
      if (opts.json) {
        console.log(
          JSON.stringify({
            ok: true,
            document: run.document,
            projectRoot: run.projectRoot,
          }),
        );
      } else {
        process.stdout.write(run.document.markdown);
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

const mcp = program.command("mcp").description("MCP server setup for AI hosts");

mcp
  .command("hosts")
  .description("List supported MCP host adapters")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { json: boolean }) => {
    try {
      const hosts = listHosts();
      if (opts.json) {
        console.log(JSON.stringify({ ok: true, hosts }));
      } else {
        console.log("Supported MCP hosts:");
        for (const h of hosts) {
          const tag = h.experimental ? " (experimental)" : "";
          console.log(`  ${h.id}${tag} — ${h.title}`);
        }
        console.log("");
        console.log("Install: sdm mcp install --hosts <csv>|all");
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

mcp
  .command("config")
  .description(
    "Print MCP config with resolved absolute paths (no hand-edited paths)",
  )
  .option("--host <id>", "Target host id (default: cursor)", "cursor")
  .option("--json", "Machine-readable JSON output for agents", false)
  .option("--name <name>", "MCP server key (host sidebar label)", DEFAULT_MCP_SERVER_NAME)
  .option(
    "--cursor-root <dir>",
    "Directory that owns .cursor/ (for host=cursor)",
  )
  .option(
    "--gigacode-home <dir>",
    "Directory for GigaCode settings.json (default: ~/.gigacode)",
  )
  .option("--config <file>", "Override recommended config path")
  .action(
    (opts: {
      host: string;
      json: boolean;
      name: string;
      cursorRoot?: string;
      gigacodeHome?: string;
      config?: string;
    }) => {
      try {
        const host = opts.host as McpHostId;
        if (!listHosts().some((h) => h.id === host)) {
          throw new SdmError(
            "UNKNOWN_HOST",
            `Unknown MCP host "${opts.host}". Run: sdm mcp hosts`,
          );
        }
        const result = buildMcpConfig({
          serverName: opts.name,
          projectRoot: null,
        });
        const path = hostConfigPath(host, {
          cursorRoot: opts.cursorRoot ?? process.cwd(),
          gigacodeHome: opts.gigacodeHome,
          configPath: opts.config,
        });
        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              host,
              path,
              ...result,
            }),
          );
        } else {
          console.log("=== SDM MCP config ===");
          console.log(`host: ${host}`);
          console.log(`path: ${path}`);
          console.log(`mcpEntry: ${result.mcpEntry}`);
          console.log(
            "projectRoot: (none — one MCP for many projects; pass tool arg `project`)",
          );
          console.log("");
          console.log(JSON.stringify(result.snippet, null, 2));
          console.log("");
          console.log("Install:");
          console.log(`  sdm mcp install --hosts ${host}`);
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

mcp
  .command("install")
  .description(
    "Write/merge SDM MCP into host configs; also install portable skills by default",
  )
  .option(
    "--hosts <list>",
    "Host ids: comma-separated or all (e.g. cursor,gigacode,multitool)",
  )
  .option("--cursor", "Alias for --hosts cursor", false)
  .option(
    "--cursor-root <dir>",
    "Directory that owns .cursor/ (default: cwd; use workspace root in monorepos)",
  )
  .option(
    "--gigacode-home <dir>",
    "Directory for GigaCode settings.json (default: ~/.gigacode)",
  )
  .option("--config <file>", "Override config path for selected host(s)")
  .option(
    "--project <dir>",
    "Optional default SDM_PROJECT_ROOT (omit for multi-project; prefer tool arg `project`)",
  )
  .option("--name <name>", "MCP server key (host sidebar label)", DEFAULT_MCP_SERVER_NAME)
  .option("--no-skills", "Skip portable skills install (MCP config only)")
  .option(
    "--agents-root <dir>",
    "Override path to SDM agents/ when installing skills",
  )
  .option("--force", "Overwrite existing skill directories when installing skills", false)
  .option("--link", "Symlink skill dirs instead of copying (dev)", false)
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    async (opts: {
      hosts?: string;
      cursor: boolean;
      cursorRoot?: string;
      gigacodeHome?: string;
      config?: string;
      project?: string;
      name: string;
      skills?: boolean;
      agentsRoot?: string;
      force: boolean;
      link: boolean;
      json: boolean;
    }) => {
      try {
        const hosts = await resolveHostsFromCli({
          hosts: opts.hosts,
          cursor: opts.cursor,
        });
        const cursorRoot = opts.cursorRoot ?? process.cwd();
        // MCP first so skills failures can still report written paths
        const mcp = installMcpHosts({
          hosts,
          cursorRoot,
          gigacodeHome: opts.gigacodeHome,
          configPath: opts.config,
          projectDir: opts.project,
          serverName: opts.name,
        });

        let skills: (InstallAgentSkillsResult & { ok: true }) | null = null;
        if (opts.skills !== false) {
          try {
            const skillsResult = installAgentSkills({
              hosts,
              cursorRoot,
              gigacodeHome: opts.gigacodeHome,
              agentsRoot: opts.agentsRoot,
              link: opts.link,
              force: opts.force,
            });
skills = { ok: true, ...skillsResult };
          } catch (skillsErr) {
            if (opts.json) {
              const code =
                skillsErr instanceof SdmError ? skillsErr.code : "UNEXPECTED";
              const message =
                skillsErr instanceof Error
                  ? skillsErr.message
                  : String(skillsErr);
              console.log(
                JSON.stringify({
                  ok: false,
                  code,
                  message,
                  hosts,
                  installs: mcp.installs,
                  ...mcp.config,
                  skills: { ok: false, code, message },
                }),
              );
            } else {
              console.error(
                `Wrote SDM MCP, but skills install failed.`,
              );
              for (const item of mcp.installs) {
                console.error(`  MCP ${item.host}: ${item.path}`);
              }
              emitError(skillsErr, false);
            }
            process.exitCode = 1;
            return;
          }
        }

        if (opts.json) {
          console.log(
            JSON.stringify({
              ok: true,
              hosts,
              installs: mcp.installs,
              ...mcp.config,
              skills,
            }),
          );
        } else {
          console.log(`Wrote SDM MCP server "${mcp.config.serverName}"`);
          for (const item of mcp.installs) {
            console.log(`  ${item.host}: ${item.path}`);
          }
          console.log(`  mcpEntry: ${mcp.config.mcpEntry}`);
          console.log(
            `  SDM_PROJECT_ROOT: ${mcp.config.projectRoot ?? "(not set — pass tool arg project per methodology)"}`,
          );
          if (skills) {
            console.log(
              `  skills: ${skills.skillIds.join(", ")} (${skills.installs.filter((i) => i.mode !== "skipped").length} wrote, ${skills.installs.filter((i) => i.mode === "skipped").length} skipped)`,
            );
          } else {
            console.log("  skills: (skipped — --no-skills)");
          }
          console.log("");
          console.log(
            "Reload MCP and skills / restart agent host, then try tool: doctor (pass project per methodology)",
          );
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

const agent = program.command("agent").description("Install portable SDM skills into AI hosts");

agent
  .command("hosts")
  .description("List supported agent skill hosts")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { json: boolean }) => {
    try {
      const hosts = listAgentHosts();
      if (opts.json) {
        console.log(JSON.stringify({ ok: true, hosts }));
      } else {
        console.log("Supported agent skill hosts:");
        for (const h of hosts) {
          const tag = h.experimental ? " (experimental)" : "";
          console.log(`  ${h.id}${tag} — ${h.title}`);
        }
        console.log("");
        console.log("Install: sdm agent install --hosts <csv>|all");
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

agent
  .command("install")
  .description(
    "Mirror SDM agents/*/SKILL.md into host skill folders (Cursor, GigaCode, …)",
  )
  .option(
    "--hosts <list>",
    "Host ids: comma-separated or all (e.g. cursor,gigacode,multitool)",
  )
  .option(
    "--cursor-root <dir>",
    "Directory that owns .cursor/skills (default: cwd)",
  )
  .option(
    "--gigacode-home <dir>",
    "Directory for GigaCode skills (default: ~/.gigacode)",
  )
  .option(
    "--agents-root <dir>",
    "Override path to SDM agents/ (default: package / SDM_HOME)",
  )
  .option("--link", "Symlink skill dirs instead of copying (dev)", false)
  .option("--force", "Overwrite existing skill directories", false)
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    async (opts: {
      hosts?: string;
      cursorRoot?: string;
      gigacodeHome?: string;
      agentsRoot?: string;
      link: boolean;
      force: boolean;
      json: boolean;
    }) => {
      try {
        const hosts = await resolveHostsFromCli({
          hosts: opts.hosts,
          isTty: Boolean(process.stdin.isTTY && process.stdout.isTTY),
        });
        const result = installAgentSkills({
          hosts,
          cursorRoot: opts.cursorRoot ?? process.cwd(),
          gigacodeHome: opts.gigacodeHome,
          agentsRoot: opts.agentsRoot,
          link: opts.link,
          force: opts.force,
        });
        if (opts.json) {
          console.log(JSON.stringify({ ok: true, hosts, ...result }));
        } else {
          console.log("Installed SDM portable skills");
          console.log(`  agentsRoot: ${result.agentsRoot}`);
          console.log(`  skills: ${result.skillIds.join(", ")}`);
          for (const root of result.skillsRoots) {
            console.log(`  ${root.host}: ${root.path}`);
          }
          const copied = result.installs.filter((i) => i.mode !== "skipped").length;
          const skipped = result.installs.filter((i) => i.mode === "skipped").length;
          console.log(`  wrote: ${copied}  skipped: ${skipped}`);
          console.log("");
          console.log("Reload the agent host so skills are discovered.");
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

program
  .command("update")
  .description(
    "Update the SDM CLI (npm) and refresh MCP config + portable skills in all hosts",
  )
  .option(
    "--hosts <list>",
    "Host ids to refresh skills/MCP (default: all; e.g. cursor,gigacode,multitool)",
    "all",
  )
  .option("--skip-npm", "Skip npm update; only re-install skills and MCP config", false)
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(
    async (opts: { hosts: string; skipNpm: boolean; json: boolean }) => {
      const report: Record<string, unknown> = {
        ok: true,
        action: "update",
        hosts: opts.hosts,
        steps: [] as string[],
      };
      try {
        if (!opts.skipNpm) {
          const npm = spawnSync(
            "npm",
            ["install", "-g", "@spec-driven-methodology/cli@latest"],
            { stdio: opts.json ? "pipe" : "inherit", shell: false },
          );
          if (npm.status !== 0) {
            throw new SdmError(
              "UPDATE_NPM_FAILED",
              `npm install -g @spec-driven-methodology/cli@latest failed (exit ${npm.status ?? "?"}). Run it manually.`,
            );
          }
          (report.steps as string[]).push("npm update");
        }

        const hosts = await resolveHostsFromCli({ hosts: opts.hosts });

        const skills = installAgentSkills({
          hosts,
          cursorRoot: process.cwd(),
          force: true,
        });
        (report.steps as string[]).push(
          `skills refreshed (${skills.skillIds.length} skills, ${hosts.join(", ")})`,
        );

        const mcp = installMcpHosts({
          hosts,
          cursorRoot: process.cwd(),
        });
        (report.steps as string[]).push(
          `MCP config refreshed (${mcp.installs.map((i) => i.host).join(", ")})`,
        );

        if (opts.json) {
          report.skills = skills.skillIds;
          report.mcp = mcp.installs.map((i) => ({ host: i.host, path: i.path }));
          console.log(JSON.stringify(report));
        } else {
          console.log("SDM update complete.");
          for (const step of report.steps as string[]) {
            console.log(`  ✓ ${step}`);
          }
          console.log("");
          console.log("Restart your agent host / reload MCP and skills.");
        }
        process.exitCode = 0;
      } catch (err) {
        emitError(err, Boolean(opts.json));
      }
    },
  );

const intent = program.command("intent").description("Intent-loop helpers for AI agents");

intent
  .command("validate-plan")
  .description("Validate intent-loop plan JSON (no methodology writes)")
  .option("-f, --file <path>", "Read plan from file (default: stdin)")
  .option("--json", "Machine-readable JSON output for agents", false)
  .action(async (opts: { file?: string; json?: boolean }) => {
    try {
      let raw: string;
      if (opts.file) {
        raw = readFileSync(resolve(opts.file), "utf8");
      } else {
        raw = await readStdin();
      }
      const result = parseIntentPlanJson(raw);
      if (opts.json) {
        console.log(JSON.stringify({ ok: true, plan: result.plan }, null, 2));
      } else {
        console.log(
          `OK: intent plan kind=${result.plan.kind} profile=${result.plan.profile.id} level=${result.plan.level.id}`,
        );
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

registerCompletion(program);

skill
  .command("suggest-links")
  .description(
    "Suggest related_to/depends_on edges from skill descriptions and topics (dry-run; confirm via skill link)",
  )
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { json: boolean }) => {
    try {
      const projectRoot = findProjectRoot(process.cwd());
      const edges = inferEdgesForProject(projectRoot);
      if (opts.json) {
        console.log(
          JSON.stringify({
            ok: true,
            projectRoot,
            count: edges.length,
            suggestions: edges,
          }),
        );
      } else {
        console.log(`Edge suggestions (${edges.length}):`);
        for (const e of edges) {
          console.log(
            `  ${e.from} ~ ${e.to}  (${e.kind}, conf=${e.confidence})  — ${e.reason}`,
          );
        }
        if (edges.length > 0) {
          console.log("");
          console.log("Apply with: sdm skill link <id> --related-to <a,b>");
        } else {
          console.log("  (none)");
        }
      }
      process.exitCode = 0;
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

question
  .command("deep-validate")
  .description(
    "Validate the whole question library for type/payload consistency (options, correct, expected)",
  )
  .option("--json", "Machine-readable JSON output for agents", false)
  .action((opts: { json: boolean }) => {
    try {
      const projectRoot = findProjectRoot(process.cwd());
      const result = validateQuestionLibraryDeep(projectRoot);
      if (opts.json) {
        console.log(
          JSON.stringify({
            ok: result.ok,
            projectRoot: result.projectRoot,
            total: result.total,
            issues: result.issues,
            errorCount: result.issues.filter((i) => i.severity === "error").length,
            findingCount: result.issues.filter((i) => i.severity === "finding").length,
            difficultySummary: result.difficultySummary,
            rubricMissingCount: result.rubricMissingCount,
          }),
        );
      } else {
        console.log(`=== Deep validate (${result.total} questions) ===`);
        console.log(`Difficulty: ${JSON.stringify(result.difficultySummary)}`);
        console.log(`Rubric missing: ${result.rubricMissingCount}`);
        if (result.issues.length === 0) {
          console.log("No issues.");
        } else {
          for (const i of result.issues) {
            console.log(`  [${i.severity}] ${i.code} ${i.questionId}: ${i.message}`);
          }
        }
        process.exitCode = result.ok ? 0 : 1;
      }
    } catch (err) {
      emitError(err, Boolean(opts.json));
    }
  });

program.parseAsync(process.argv);

function readStdin(): Promise<string> {
  return readStdinWithCode(
    "INTENT_PLAN_INVALID",
    "No plan on stdin. Pass --file <path> or pipe JSON.",
  );
}

function readStdinWithCode(code: string, emptyMessage: string): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const chunks: Buffer[] = [];
    if (process.stdin.isTTY) {
      reject(new SdmError(code, emptyMessage));
      return;
    }
    process.stdin.on("data", (c) => chunks.push(Buffer.from(c)));
    process.stdin.on("end", () =>
      resolvePromise(Buffer.concat(chunks).toString("utf8")),
    );
    process.stdin.on("error", reject);
  });
}
