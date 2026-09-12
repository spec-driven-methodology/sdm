/**
 * SDM MCP server factory and callable tool handlers (no stdio transport).
 */
import { join, resolve } from "node:path";
import { readdirSync, readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
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
  exportConfluence,
  exportCourse,
  exportKit,
  exportMatrix,
  exportMermaid,
  exportTest,
  findProjectRoot,
  getProductVersion,
  initMethodologyProject,
  isMethodologyProject,
  hasLegacyRolesDirectory,
  locateProject,
  listMethodologyProjects,
  syncPlayerAssets,
  syncStudioAssets,
  pushStudioView,
  pushStudioCoverage,
  pullStudioAction,
  linkSkill,
  listQuestions,
  listTerms,
  addTerm,
  parseSkillIdList,
  rebuildSemanticIndex,
  searchSemanticIndex,
  runMethodologyAudit,
  buildQualityReport,
  runCertCoverage,
  runCertGaps,
  runSkillGraph,
  runSkillImpact,
  runContentStale,
  generateQuestions,
  validateQuestion,
  validateQuestionLibraryDeep,
  inferEdgesForProject,
  buildTopicRegistry,
  syncTopicRegistryFromSkills,
  healCourseWarnings,
  SdmError,
  type Question,
  type TermKind,
} from "@spec-driven-methodology/core";

export type ToolContent = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

/** Resolve methodology start dir: explicit project → SDM_PROJECT_ROOT → cwd. */
export function resolveStartDir(project?: string): string {
  const fromArg = project?.trim();
  if (fromArg) {
    return resolve(fromArg);
  }
  return process.env.SDM_PROJECT_ROOT?.trim() || process.cwd();
}

/** @deprecated Prefer resolveStartDir(project) for multi-project MCP. */
export function projectCwd(): string {
  return resolveStartDir();
}

export function okJson(payload: unknown): ToolContent {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
  };
}

export function errJson(err: unknown): ToolContent {
  if (err instanceof SdmError) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: JSON.stringify({ ok: false, code: err.code, message: err.message }),
        },
      ],
    };
  }
  const message = err instanceof Error ? err.message : String(err);
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: JSON.stringify({ ok: false, code: "UNEXPECTED", message }),
      },
    ],
  };
}

/** Parse JSON payload from a ToolContent result. */
export function parseToolJson(result: ToolContent): Record<string, unknown> {
  const text = result.content[0]?.text;
  if (!text) {
    throw new Error("Tool result missing text content");
  }
  return JSON.parse(text) as Record<string, unknown>;
}

/** Run a tool handler and append an action-log line (file only — never stdout). */
export async function loggedTool(
  name: string,
  args: unknown,
  fn: () => Promise<ToolContent>,
): Promise<ToolContent> {
  const started = Date.now();
  const projectArg =
    args && typeof args === "object" && args !== null && "project" in args
      ? (args as { project?: string }).project
      : undefined;
  const startDir = resolveStartDir(projectArg);
  try {
    const result = await fn();
    let ok = !result.isError;
    let code: string | undefined;
    let summary: unknown = undefined;
    try {
      const payload = parseToolJson(result);
      if (payload.ok === false) {
        ok = false;
        code = typeof payload.code === "string" ? payload.code : "FAILED";
      }
      summary = {
        ok: payload.ok,
        ...(typeof payload.code === "string" ? { code: payload.code } : {}),
        ...(typeof payload.projectRoot === "string"
          ? { projectRoot: payload.projectRoot }
          : {}),
        ...(typeof payload.count === "number" ? { count: payload.count } : {}),
        ...(typeof payload.hasMissing === "boolean"
          ? { hasMissing: payload.hasMissing }
          : {}),
        ...(typeof payload.hasThin === "boolean" ? { hasThin: payload.hasThin } : {}),
      };
    } catch {
      summary = { parseError: true };
    }
    appendActionLog({
      source: "mcp",
      action: name,
      args,
      ok,
      code,
      durationMs: Date.now() - started,
      startDir,
      summary,
    });
    return result;
  } catch (err) {
    const code =
      err instanceof SdmError
        ? err.code
        : "UNEXPECTED";
    const message = err instanceof Error ? err.message : String(err);
    appendActionLog({
      source: "mcp",
      action: name,
      args,
      ok: false,
      code,
      durationMs: Date.now() - started,
      startDir,
      summary: { message },
    });
    return errJson(err);
  }
}

export async function toolDoctor(args: { project?: string } = {}): Promise<ToolContent> {
  try {
    const start = resolveStartDir(args.project);
    if (!isMethodologyProject(start)) {
      return okJson({
        ok: false,
        code: "NOT_A_PROJECT",
        message: `Not a SDM project: ${start}`,
      });
    }
    const projectRoot = findProjectRoot(start);
    const legacyRoles = hasLegacyRolesDirectory(projectRoot);
    return okJson({
      ok: true,
      projectRoot,
      ...(legacyRoles
        ? {
            warnings: [
              "legacy certifications/roles/ present — migrate to certifications/profiles/",
            ],
          }
        : {}),
    });
  } catch (err) {
    return errJson(err);
  }
}

/** Product identity — no methodology project required. `project` is accepted but ignored. */
export async function toolAbout(
  _args: { project?: string } = {},
): Promise<ToolContent> {
  try {
    return okJson(buildAbout());
  } catch (err) {
    return errJson(err);
  }
}

/** Locate the nearest SDM methodology project from a given directory. */
export async function toolLocateProject(args: {
  dir: string;
}): Promise<ToolContent> {
  try {
    const found = locateProject(args.dir);
    if (!found) {
      return okJson({ ok: false, found: null, dir: args.dir });
    }
    return okJson({ ok: true, ...found });
  } catch (err) {
    return errJson(err);
  }
}

/** List SDM methodology projects under a workspace directory. */
export async function toolListProjects(args: {
  workspaceDir: string;
  maxDepth?: number;
}): Promise<ToolContent> {
  try {
    const list = listMethodologyProjects(args.workspaceDir, args.maxDepth ?? 2);
    return okJson({ ok: true, count: list.length, projects: list });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolSuggest(args: {
  project?: string;
  profile?: string;
  level?: string;
} = {}): Promise<ToolContent> {
  try {
    return okJson(
      buildSuggest({
        startDir: resolveStartDir(args.project),
        profile: args.profile,
        level: args.level,
      }),
    );
  } catch (err) {
    return errJson(err);
  }
}

export async function toolInit(args: {
  targetDir?: string;
  project?: string;
  name?: string;
  withExamples?: boolean;
  force?: boolean;
}): Promise<ToolContent> {
  try {
    const result = initMethodologyProject({
      targetDir: args.targetDir ?? resolveStartDir(args.project),
      name: args.name,
      withExamples: args.withExamples,
      force: args.force,
    });
    return okJson({ ok: true, ...result });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolPlayerSync(args: {
  project?: string;
  force?: boolean;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = syncPlayerAssets({
      projectRoot,
      force: args.force,
    });
    return okJson({ ok: true, ...result });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolStudioSync(args: {
  project?: string;
  force?: boolean;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = syncStudioAssets({
      projectRoot,
      force: args.force,
    });
    return okJson({ ok: true, ...result });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolStudioPushView(args: {
  project?: string;
  viewJson: string;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = pushStudioView({
      projectRoot,
      raw: args.viewJson,
    });
    return okJson({ ok: true, ...result });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolStudioPushCoverage(args: {
  project?: string;
  profile: string;
  level: string;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = pushStudioCoverage({
      projectRoot,
      profile: args.profile,
      level: args.level,
    });
    return okJson({ ok: true, ...result });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolStudioPullAction(args: {
  project?: string;
  consume?: boolean;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = pullStudioAction({
      projectRoot,
      consume: args.consume,
    });
    return okJson({ ok: true, ...result });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolSkillAdd(args: {
  project?: string;
  id: string;
  name: string;
  category?: string;
  description?: string;
  topics?: string[];
  force?: boolean;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = addSkill(projectRoot, args);
    return okJson({ ok: true, ...result });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolSkillLink(args: {
  project?: string;
  id: string;
  dependsOn?: string;
  relatedTo?: string;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = linkSkill(projectRoot, args.id, {
      dependsOn: parseSkillIdList(args.dependsOn),
      relatedTo: parseSkillIdList(args.relatedTo),
    });
    return okJson({ ok: true, ...result });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolSkillSuggestLinks(args: {
  project?: string;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const suggestions = inferEdgesForProject(projectRoot);
    return okJson({
      ok: true,
      projectRoot,
      count: suggestions.length,
      suggestions,
      note: "Dry-run suggestions — apply via skill_link.",
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolQuestionDeepValidate(args: {
  project?: string;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = validateQuestionLibraryDeep(projectRoot);
    return okJson({
      ok: result.ok,
      projectRoot: result.projectRoot,
      total: result.total,
      issues: result.issues,
      errorCount: result.issues.filter((i) => i.severity === "error").length,
      findingCount: result.issues.filter((i) => i.severity === "finding").length,
      difficultySummary: result.difficultySummary,
      rubricMissingCount: result.rubricMissingCount,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolTopicRegistry(args: {
  project?: string;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const idx = buildTopicRegistry(projectRoot);
    return okJson({
      ok: true,
      projectRoot,
      registered: idx.registered.size,
      registeredTopics: [...idx.registered.values()].map((t) => ({
        id: t.id,
        label: t.label,
        skills: t.skills,
      })),
      unregisteredFromSkills: idx.unregisteredFromSkills,
      orphanQuestionTopics: idx.orphanQuestionTopics,
      unregisteredFromCourses: idx.unregisteredFromCourses,
      unused: idx.unused,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolTopicSync(args: {
  project?: string;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const created = syncTopicRegistryFromSkills(projectRoot);
    return okJson({
      ok: true,
      projectRoot,
      created,
      count: created.length,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolCourseHeal(args: {
  project?: string;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    // Load the most recent course export under exports/ (filled pack).
    const exportsDir = join(projectRoot, "exports");
    let modules: any[] = [];
    let warnings: any[] = [];
    if (readdirSync(exportsDir).some((f: string) => f.startsWith("course-") && f.endsWith(".json"))) {
      const files = readdirSync(exportsDir)
        .filter((f: string) => f.startsWith("course-") && f.endsWith(".json"))
        .sort();
      const latest = files[files.length - 1]!;
      const doc = JSON.parse(readFileSync(join(exportsDir, latest), "utf8"));
      modules = (doc.document?.modules ?? doc.modules ?? []) as any;
      warnings = (doc.document?.warnings ?? doc.warnings ?? []) as any;
    }
    const result = healCourseWarnings({ projectRoot, modules, warnings });
    return okJson({
      ok: true,
      projectRoot,
      backfilledTopics: result.backfilledTopics,
      suggestedDescriptions: result.suggestedDescriptions,
      registryCreated: result.registryCreated,
      note: "Run export_learning again to confirm warnings shrank.",
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolProfileCreate(args: {
  project?: string;
  profile: string;
  title: string;
  force?: boolean;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = createProfile(projectRoot, {
      profile: args.profile,
      title: args.title,
      force: args.force,
    });
    return okJson({ ok: true, ...result });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolCertCreate(args: {
  project?: string;
  profile: string;
  level: string;
  levelTitle: string;
  requirements: string[];
  description?: string;
  threshold?: number;
  force?: boolean;
  noNormalizeWeights?: boolean;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = createCertification(projectRoot, {
      profile: args.profile,
      level: args.level,
      levelTitle: args.levelTitle,
      description: args.description,
      requirementTriples: args.requirements,
      threshold: args.threshold,
      force: args.force,
      noNormalizeWeights: args.noNormalizeWeights,
    });
    return okJson({ ok: true, ...result });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolCertPatch(args: {
  project?: string;
  level: string;
  profile?: string;
  addRequirements?: string[];
  setRequirements?: string[];
  removeRequirements?: string[];
  from?: string[];
  absorbInto?: string;
  title?: string;
  description?: string;
  threshold?: number;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = patchCertification(projectRoot, {
      level: args.level,
      profile: args.profile,
      addTriples: args.addRequirements,
      setTriples: args.setRequirements,
      removeSkills: args.removeRequirements,
      fromTransfers: args.from,
      absorbInto: args.absorbInto,
      title: args.title,
      description: args.description,
      threshold: args.threshold,
    });
    return okJson({ ok: true, ...result });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolCertReweight(args: {
  project?: string;
  level: string;
  profile?: string;
  skill?: string;
  delta?: number;
  from?: string[];
  set?: string[];
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = reweightCertification(projectRoot, {
      level: args.level,
      profile: args.profile,
      skill: args.skill,
      delta: args.delta,
      from: args.from,
      set: args.set,
    });
    return okJson({
      ok: true,
      action: result.action,
      level: result.level.level,
      path: result.path,
      before: result.before,
      after: result.after,
      transfers: result.transfers,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolCertCoverage(args: {
  project?: string;
  profile: string;
  level: string;
  team?: string;
}): Promise<ToolContent> {
  try {
    const { projectRoot, result, warnings, team } = runCertCoverage({
      startDir: resolveStartDir(args.project),
      profile: args.profile,
      level: args.level,
      team: args.team,
    });
    return okJson({
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
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolAudit(args: {
  project?: string;
  profile?: string;
  level?: string;
}): Promise<ToolContent> {
  try {
    const run = runMethodologyAudit({
      startDir: resolveStartDir(args.project),
      profile: args.profile,
      level: args.level,
    });
    return okJson({ ok: true, projectRoot: run.projectRoot, document: run.document });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolQualityReport(args: {
  project?: string;
  sources?: string;
  profile?: string;
  level?: string;
  diff?: string;
  save?: boolean;
  locale?: string;
}): Promise<ToolContent> {
  try {
    const run = buildQualityReport({
      startDir: resolveStartDir(args.project),
      sourcesDir: args.sources,
      profile: args.profile,
      level: args.level,
      diffReportId: args.diff,
      save: args.save !== false,
      locale: args.locale,
    });
    return okJson({
      ok: true,
      projectRoot: run.projectRoot,
      reportsRoot: run.reportsRoot,
      document: run.document,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolCertGaps(args: {
  project?: string;
  profile: string;
  level: string;
  team?: string;
}): Promise<ToolContent> {
  try {
    const { projectRoot, result, warnings, gaps, workItems, team } = runCertGaps({
      startDir: resolveStartDir(args.project),
      profile: args.profile,
      level: args.level,
      team: args.team,
    });
    return okJson({
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
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolQuestionAdd(args: {
  project?: string;
  skill: string;
  type: Question["type"];
  difficulty: number;
  text: string;
  options?: string[];
  correct?: number | number[];
  expected?: string | string[];
  explanation?: string;
  code_template?: string;
  topics?: string[];
  evidence?: Question["evidence"];
  min_depth?: number;
  red_flags?: string[];
  rubric?: { score: 0 | 1 | 2 | 3; description: string }[];
  id?: string;
  force?: boolean;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = addQuestion(projectRoot, {
      skill: args.skill,
      type: args.type,
      difficulty: args.difficulty,
      text: args.text,
      options: args.options,
      correct: args.correct,
      expected: args.expected,
      explanation: args.explanation,
      code_template: args.code_template,
      topics: args.topics,
      evidence: args.evidence,
      min_depth: args.min_depth,
      red_flags: args.red_flags,
      rubric: args.rubric,
      id: args.id,
      force: args.force,
    });
    return okJson({
      ok: true,
      question: result.question,
      path: result.path,
      skill: result.skill,
      warnings: result.warnings ?? [],
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolQuestionValidate(args: {
  project?: string;
  skill: string;
  type: Question["type"];
  difficulty: number;
  text: string;
  options?: string[];
  correct?: number | number[];
  expected?: string | string[];
  explanation?: string;
  code_template?: string;
  topics?: string[];
  id?: string;
}): Promise<ToolContent> {
  try {
    const result = validateQuestion({
      startDir: resolveStartDir(args.project),
      input: {
        skill: args.skill,
        type: args.type,
        difficulty: args.difficulty,
        text: args.text,
        options: args.options,
        correct: args.correct,
        expected: args.expected,
        explanation: args.explanation,
        code_template: args.code_template,
        topics: args.topics,
        id: args.id,
      },
    });
    return okJson({
      ok: result.ok,
      projectRoot: result.projectRoot,
      skill: result.skill.id,
      errors: result.errors,
      findings: result.findings,
      question: result.question ?? null,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolQuestionList(args: {
  project?: string;
  skill?: string;
}): Promise<ToolContent> {
  try {
    const { projectRoot, questions, warnings, skill } = listQuestions({
      startDir: resolveStartDir(args.project),
      skill: args.skill,
    });
    const summary = questions.map((q) => ({
      id: q.id,
      skill: q.skill,
      type: q.type,
      difficulty: q.difficulty,
    }));
    return okJson({
      ok: true,
      projectRoot,
      skill: skill ?? null,
      count: summary.length,
      questions: summary,
      warnings,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolTermAdd(args: {
  project?: string;
  id: string;
  term: string;
  definition: string;
  aliases?: string[];
  skills?: string[];
  kind?: TermKind;
  force?: boolean;
}): Promise<ToolContent> {
  try {
    const projectRoot = findProjectRoot(resolveStartDir(args.project));
    const result = addTerm(projectRoot, {
      id: args.id,
      term: args.term,
      definition: args.definition,
      aliases: args.aliases,
      skills: args.skills,
      kind: args.kind,
      force: args.force,
    });
    return okJson({ ok: true, ...result });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolTermList(args: {
  project?: string;
  skill?: string;
}): Promise<ToolContent> {
  try {
    const { projectRoot, terms, warnings, skill } = listTerms({
      startDir: resolveStartDir(args.project),
      skill: args.skill,
    });
    return okJson({
      ok: true,
      projectRoot,
      skill: skill ?? null,
      count: terms.length,
      terms: terms.map((t) => ({
        id: t.id,
        term: t.term,
        kind: t.kind,
        skills: t.skills,
      })),
      warnings,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolQuestionGenerate(args: {
  project?: string;
  skill: string;
  count?: number;
  difficultyMin?: number;
  difficultyMax?: number;
  type?: Question["type"];
  mix?: string;
  profile?: string;
  level?: string;
}): Promise<ToolContent> {
  try {
    const result = generateQuestions({
      startDir: resolveStartDir(args.project),
      skill: args.skill,
      count: args.count,
      difficultyMin: args.difficultyMin,
      difficultyMax: args.difficultyMax,
      type: args.type,
      mix: args.mix,
      profile: args.profile,
      level: args.level,
    });
    return okJson({ ok: true, ...result });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolExportTest(args: {
  project?: string;
  profile: string;
  level: string;
  format?: "json" | "csv";
  team?: string;
  adaptive?: boolean;
  seed?: number;
  perSkill?: number;
  shuffleOptions?: boolean;
  includeTypes?: string[];
  excludeTypes?: string[];
  includeSkills?: string[];
  excludeSkills?: string[];
  includeQuestions?: string[];
}): Promise<ToolContent> {
  try {
    const run = exportTest({
      startDir: resolveStartDir(args.project),
      profile: args.profile,
      level: args.level,
      format: args.format,
      team: args.team,
      adaptive: args.adaptive,
      seed: args.seed,
      perSkill: args.perSkill,
      shuffleOptions: args.shuffleOptions,
      includeTypes: args.includeTypes,
      excludeTypes: args.excludeTypes,
      includeSkills: args.includeSkills,
      excludeSkills: args.excludeSkills,
      includeQuestions: args.includeQuestions,
    });
    return okJson({
      ok: true,
      format: run.format,
      document: exportDocumentPayload(run.format, run.document, run.csv),
      projectRoot: run.projectRoot,
      warnings: run.warnings,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolExportCourse(args: {
  project?: string;
  profile?: string;
  level?: string;
  fromGaps?: boolean;
  skill?: string;
  topic?: string;
  fromQuestions?: string[];
  depth?: string;
  format?: string;
  includePractice?: boolean;
  locale?: string;
  strictContext?: boolean;
}): Promise<ToolContent> {
  try {
    const run = exportCourse({
      startDir: resolveStartDir(args.project),
      profile: args.profile,
      level: args.level,
      fromGaps: args.fromGaps,
      skill: args.skill,
      topic: args.topic,
      fromQuestions: args.fromQuestions,
      depth: args.depth,
      format: args.format,
      includePractice: args.includePractice,
      locale: args.locale,
      strictContext: args.strictContext,
    });
    return okJson({
      ok: true,
      document: run.document,
      projectRoot: run.projectRoot,
      warnings: run.document.warnings,
      loadWarnings: run.loadWarnings,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolExportKit(args: {
  project?: string;
  profile: string;
  level: string;
  format?: string;
  strict?: boolean;
}): Promise<ToolContent> {
  try {
    const run = exportKit({
      startDir: resolveStartDir(args.project),
      profile: args.profile,
      level: args.level,
      format: args.format,
      strict: args.strict,
    });
    return okJson({
      ok: true,
      format: run.format,
      document: run.document,
      ...(run.html !== undefined ? { html: run.html } : {}),
      projectRoot: run.projectRoot,
      warnings: run.document.warnings,
      loadWarnings: run.loadWarnings,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolExportConfluence(args: {
  project?: string;
  profile: string;
  level?: string;
  team?: string;
}): Promise<ToolContent> {
  try {
    const run = exportConfluence({
      startDir: resolveStartDir(args.project),
      profile: args.profile,
      level: args.level,
      team: args.team,
    });
    return okJson({
      ok: true,
      document: run.document,
      projectRoot: run.projectRoot,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolIndexRebuild(args: { project?: string } = {}): Promise<ToolContent> {
  try {
    const run = rebuildSemanticIndex(resolveStartDir(args.project));
    return okJson({
      ok: true,
      projectRoot: run.projectRoot,
      documentCount: run.index.documents.length,
      schemaVersion: run.index.schemaVersion,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolSearch(args: {
  project?: string;
  query: string;
  kind?: "skill" | "question";
}): Promise<ToolContent> {
  try {
    const run = searchSemanticIndex(resolveStartDir(args.project), args.query, args.kind);
    return okJson({
      ok: true,
      projectRoot: run.projectRoot,
      count: run.hits.length,
      hits: run.hits,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolExportMatrix(args: {
  project?: string;
  profile: string;
  format?: "csv" | "json";
}): Promise<ToolContent> {
  try {
    const run = exportMatrix({
      startDir: resolveStartDir(args.project),
      profile: args.profile,
      format: args.format,
    });
    return okJson({
      ok: true,
      format: run.format,
      document: exportDocumentPayload(run.format, run.document, run.csv),
      projectRoot: run.projectRoot,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolExportMermaid(args: {
  project?: string;
  profile: string;
  level: string;
  coverage?: boolean;
}): Promise<ToolContent> {
  try {
    const run = exportMermaid({
      startDir: resolveStartDir(args.project),
      profile: args.profile,
      level: args.level,
      coverage: args.coverage,
    });
    return okJson({
      ok: true,
      format: run.format,
      document: run.document,
      projectRoot: run.projectRoot,
      warnings: run.warnings,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolSkillGraph(args: {
  project?: string;
  profile: string;
  level: string;
  coverage?: boolean;
}): Promise<ToolContent> {
  try {
    const run = runSkillGraph({
      startDir: resolveStartDir(args.project),
      profile: args.profile,
      level: args.level,
      coverage: args.coverage,
    });
    return okJson({
      ok: true,
      document: run.document,
      projectRoot: run.projectRoot,
      warnings: run.warnings,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolSkillImpact(args: {
  project?: string;
  skill: string;
}): Promise<ToolContent> {
  try {
    const run = runSkillImpact({
      startDir: resolveStartDir(args.project),
      skill: args.skill,
    });
    return okJson({
      ok: true,
      document: run.document,
      projectRoot: run.projectRoot,
    });
  } catch (err) {
    return errJson(err);
  }
}

export async function toolContentStale(args: {
  project?: string;
  skill?: string;
  profile?: string;
  level?: string;
}): Promise<ToolContent> {
  try {
    const run = runContentStale({
      startDir: resolveStartDir(args.project),
      skill: args.skill,
      profile: args.profile,
      level: args.level,
    });
    return okJson({
      ok: true,
      document: run.document,
      projectRoot: run.projectRoot,
    });
  } catch (err) {
    return errJson(err);
  }
}

export const TOOL_NAMES = [
  "about",
  "suggest",
  "doctor",
  "audit",
  "quality_report",
  "init",
  "locate_project",
  "list_projects",
  "player_sync",
  "studio_sync",
  "studio_push_view",
  "studio_push_coverage",
  "studio_pull_action",
  "skill_add",
  "skill_link",
  "skill_graph",
  "skill_impact",
  "skill_suggest_links",
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
  "question_deep_validate",
  "term_add",
  "term_list",
  "question_generate",
  "export_test",
  "export_matrix",
  "export_learning",
  "export_course",
  "export_mermaid",
  "export_confluence",
  "export_kit",
  "index_rebuild",
  "search",
  "topic_registry",
  "topic_sync",
  "course_heal",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

/**
 * Invoke a tool handler by name (for tests). Does not start stdio.
 */
export async function runTool(
  name: ToolName,
  args: Record<string, unknown> = {},
): Promise<ToolContent> {
  switch (name) {
    case "about":
      return toolAbout(args as Parameters<typeof toolAbout>[0]);
    case "suggest":
      return toolSuggest(args as Parameters<typeof toolSuggest>[0]);
    case "doctor":
      return toolDoctor(args as Parameters<typeof toolDoctor>[0]);
    case "audit":
      return toolAudit(args as Parameters<typeof toolAudit>[0]);
    case "quality_report":
      return toolQualityReport(args as Parameters<typeof toolQualityReport>[0]);
    case "init":
      return toolInit(args as Parameters<typeof toolInit>[0]);
    case "locate_project":
      return toolLocateProject(args as Parameters<typeof toolLocateProject>[0]);
    case "list_projects":
      return toolListProjects(args as Parameters<typeof toolListProjects>[0]);
    case "player_sync":
      return toolPlayerSync(args as Parameters<typeof toolPlayerSync>[0]);
    case "studio_sync":
      return toolStudioSync(args as Parameters<typeof toolStudioSync>[0]);
    case "studio_push_view":
      return toolStudioPushView(args as Parameters<typeof toolStudioPushView>[0]);
    case "studio_push_coverage":
      return toolStudioPushCoverage(
        args as Parameters<typeof toolStudioPushCoverage>[0],
      );
    case "studio_pull_action":
      return toolStudioPullAction(
        args as Parameters<typeof toolStudioPullAction>[0],
      );
    case "skill_add":
      return toolSkillAdd(args as Parameters<typeof toolSkillAdd>[0]);
    case "skill_link":
      return toolSkillLink(args as Parameters<typeof toolSkillLink>[0]);
    case "skill_graph":
      return toolSkillGraph(args as Parameters<typeof toolSkillGraph>[0]);
    case "skill_impact":
      return toolSkillImpact(args as Parameters<typeof toolSkillImpact>[0]);
    case "skill_suggest_links":
      return toolSkillSuggestLinks(args as Parameters<typeof toolSkillSuggestLinks>[0]);
    case "content_stale":
      return toolContentStale(args as Parameters<typeof toolContentStale>[0]);
    case "profile_create":
      return toolProfileCreate(args as Parameters<typeof toolProfileCreate>[0]);
    case "cert_create":
      return toolCertCreate(args as Parameters<typeof toolCertCreate>[0]);
    case "cert_patch":
      return toolCertPatch(args as Parameters<typeof toolCertPatch>[0]);
    case "cert_reweight":
      return toolCertReweight(args as Parameters<typeof toolCertReweight>[0]);
    case "cert_coverage":
      return toolCertCoverage(args as Parameters<typeof toolCertCoverage>[0]);
    case "cert_gaps":
      return toolCertGaps(args as Parameters<typeof toolCertGaps>[0]);
    case "question_add":
      return toolQuestionAdd(args as Parameters<typeof toolQuestionAdd>[0]);
    case "question_validate":
      return toolQuestionValidate(args as Parameters<typeof toolQuestionValidate>[0]);
    case "question_list":
      return toolQuestionList(args as Parameters<typeof toolQuestionList>[0]);
    case "question_deep_validate":
      return toolQuestionDeepValidate(args as Parameters<typeof toolQuestionDeepValidate>[0]);
    case "term_add":
      return toolTermAdd(args as Parameters<typeof toolTermAdd>[0]);
    case "term_list":
      return toolTermList(args as Parameters<typeof toolTermList>[0]);
    case "question_generate":
      return toolQuestionGenerate(args as Parameters<typeof toolQuestionGenerate>[0]);
    case "export_test":
      return toolExportTest(args as Parameters<typeof toolExportTest>[0]);
    case "export_matrix":
      return toolExportMatrix(args as Parameters<typeof toolExportMatrix>[0]);
    case "export_learning":
    case "export_course":
      return toolExportCourse(args as Parameters<typeof toolExportCourse>[0]);
    case "export_mermaid":
      return toolExportMermaid(args as Parameters<typeof toolExportMermaid>[0]);
    case "export_confluence":
      return toolExportConfluence(args as Parameters<typeof toolExportConfluence>[0]);
    case "export_kit":
      return toolExportKit(args as Parameters<typeof toolExportKit>[0]);
    case "index_rebuild":
      return toolIndexRebuild(args as Parameters<typeof toolIndexRebuild>[0]);
    case "search":
      return toolSearch(args as Parameters<typeof toolSearch>[0]);
    case "topic_registry":
      return toolTopicRegistry(args as Parameters<typeof toolTopicRegistry>[0]);
    case "topic_sync":
      return toolTopicSync(args as Parameters<typeof toolTopicSync>[0]);
    case "course_heal":
      return toolCourseHeal(args as Parameters<typeof toolCourseHeal>[0]);
    default: {
      const _exhaustive: never = name;
      return errJson(new Error(`Unknown tool: ${_exhaustive}`));
    }
  }
}

const projectParam = z
  .string()
  .optional()
  .describe(
    "Methodology project directory (multi-project). Default: SDM_PROJECT_ROOT or cwd.",
  );
const profileParam = z.string().describe("Certification profile id");
const profileOptParam = z
  .string()
  .optional()
  .describe("Certification profile id");
const levelParam = z.string().describe("Certification level id");
const levelOptParam = z
  .string()
  .optional()
  .describe("Certification level id");
const forceParam = z
  .boolean()
  .optional()
  .describe("Overwrite existing artifact if present");
const teamOptParam = z
  .string()
  .optional()
  .describe("Optional team id to scope coverage/export");
const skillIdParam = z.string().describe("Ontology skill id");
const skillIdOptParam = z.string().optional().describe("Ontology skill id");
const coverageFlagParam = z
  .boolean()
  .optional()
  .describe("Include coverage coloring when profile/level context applies");
const questionTypeParam = z
  .enum(["single_choice", "multi_choice", "code", "open"])
  .describe("Question type");
const difficultyParam = z
  .number()
  .min(0)
  .max(1)
  .describe("Difficulty 0..1");
const questionOptionsParam = z
  .array(z.string())
  .optional()
  .describe("Choice options (required for single_choice / multi_choice)");
const questionCorrectParam = z
  .union([z.number(), z.array(z.number())])
  .optional()
  .describe("1-based correct option index or indexes (choice types)");
const questionExpectedParam = z
  .union([z.string().min(1), z.array(z.string().min(1)).min(1)])
  .optional()
  .describe("Expected answer or aliases (open type)");
const questionTopicsParam = z
  .array(z.string())
  .optional()
  .describe("Topic tags on the skill (optional)");
const localeParam = z
  .string()
  .optional()
  .describe("Human text locale: ru | en");
const questionTypeFilterParam = z
  .array(z.enum(["single_choice", "multi_choice", "open", "code"]))
  .optional();

const exportLearningParams = {
  project: projectParam,
  profile: profileOptParam,
  level: levelOptParam,
  fromGaps: z
    .boolean()
    .optional()
    .describe("Seed modules from cert gaps for profile/level"),
  skill: skillIdOptParam,
  topic: z.string().optional().describe("Focus topic title/id within skill"),
  fromQuestions: z
    .array(z.string())
    .optional()
    .describe("Seed from question ids"),
  depth: z
    .enum(["brief", "standard", "detailed"])
    .optional()
    .describe("Teaching depth (default standard)"),
  format: z
    .enum(["howto", "notes", "cheatsheet", "course", "concept"])
    .optional()
    .describe(
      "howto=Инструкция, notes=Конспект, cheatsheet=Шпаргалка, course=Курс; concept→notes deprecated",
    ),
  includePractice: z
    .boolean()
    .optional()
    .describe("Include practiceQuestionIds (default true)"),
  locale: localeParam,
  strictContext: z
    .boolean()
    .optional()
    .describe("Stricter TeachingContext validation"),
};

const exportKitParams = {
  project: projectParam,
  profile: profileParam,
  level: levelParam,
  format: z
    .enum(["json", "html"])
    .optional()
    .describe(
      "json=kit document in document field (default); html=also returns html field with self-contained page",
    ),
  strict: z
    .boolean()
    .optional()
    .describe("Fail when kit-readiness warnings exist"),
};

/** Zod input shapes for each tool (SSOT for registerTools + description tests). */
export const TOOL_INPUT_SHAPES = {
  about: { project: projectParam },
  suggest: {
    project: projectParam,
    profile: profileOptParam,
    level: levelOptParam,
  },
  doctor: { project: projectParam },
  audit: {
    project: projectParam,
    profile: profileOptParam,
    level: levelOptParam,
  },
  quality_report: {
    project: projectParam,
    sources: z
      .string()
      .optional()
      .describe("Corpus mode: directory of markdown sources"),
    profile: profileOptParam,
    level: levelOptParam,
    diff: z.string().optional().describe("Baseline saved report id"),
    save: z
      .boolean()
      .optional()
      .describe("Persist under .sdm/reports/quality/ (default true)"),
    locale: localeParam,
  },
  init: {
    project: projectParam,
    targetDir: z
      .string()
      .optional()
      .describe(
        "Target directory (default: project / SDM_PROJECT_ROOT / cwd)",
      ),
    name: z.string().optional().describe("Project name in sdm.yaml"),
    withExamples: z
      .boolean()
      .optional()
      .describe("Seed example ontology/library/cert content"),
    force: forceParam,
  },
  locate_project: {
    dir: z
      .string()
      .describe(
        "Directory to start from (workdir). Walks up to the nearest sdm.yaml.",
      ),
  },
  list_projects: {
    workspaceDir: z
      .string()
      .describe("Workspace / folder to scan for methodology projects"),
    maxDepth: z
      .number()
      .int()
      .min(1)
      .max(5)
      .optional()
      .describe("Scan depth below workspaceDir (default 2)"),
  },
  player_sync: { project: projectParam, force: forceParam },
  studio_sync: { project: projectParam, force: forceParam },
  studio_push_view: {
    project: projectParam,
    viewJson: z.string().describe("Full studio view document as JSON string"),
  },
  studio_push_coverage: {
    project: projectParam,
    profile: profileParam,
    level: levelParam,
  },
  studio_pull_action: {
    project: projectParam,
    consume: z
      .boolean()
      .optional()
      .describe("Remove action file after successful read"),
  },
  skill_add: {
    project: projectParam,
    id: z.string().describe("New skill id (filename stem)"),
    name: z.string().describe("Human-readable skill title"),
    category: z.string().optional().describe("Skill category label"),
    description: z.string().optional().describe("Skill description prose"),
    topics: z.array(z.string()).optional().describe("Initial topic titles"),
    force: forceParam,
  },
  skill_link: {
    project: projectParam,
    id: z.string().describe("Existing skill id to patch links on"),
    dependsOn: z
      .string()
      .optional()
      .describe("Comma-separated skill ids for depends_on"),
    relatedTo: z
      .string()
      .optional()
      .describe("Comma-separated skill ids for related_to"),
  },
  skill_graph: {
    project: projectParam,
    profile: profileParam,
    level: levelParam,
    coverage: coverageFlagParam,
  },
  skill_impact: {
    project: projectParam,
    skill: skillIdParam,
  },
  content_stale: {
    project: projectParam,
    skill: z.string().optional().describe("Skill id scope"),
    profile: profileParam.optional(),
    level: levelParam.optional(),
  },
  profile_create: {
    project: projectParam,
    profile: profileParam,
    title: z.string().describe("Profile display title"),
    force: forceParam,
  },
  cert_create: {
    project: projectParam,
    profile: profileParam,
    level: levelParam,
    levelTitle: z.string().describe("Level display title"),
    requirements: z
      .array(z.string())
      .min(1)
      .describe("skill:depth:weight triples"),
    description: z.string().optional().describe("Level description"),
    threshold: z
      .number()
      .optional()
      .describe("Pass threshold 0..1 (optional)"),
    force: forceParam,
    noNormalizeWeights: z
      .boolean()
      .optional()
      .describe("Fail if weights do not already sum to 1"),
  },
  cert_patch: {
    project: projectParam,
    level: levelParam,
    profile: profileOptParam,
    addRequirements: z
      .array(z.string())
      .optional()
      .describe("Add skill:depth:weight triples (use from for weight donors)"),
    setRequirements: z
      .array(z.string())
      .optional()
      .describe("Replace matching requirements with skill:depth:weight"),
    removeRequirements: z
      .array(z.string())
      .optional()
      .describe("Skill ids to remove (use absorbInto for weight)"),
    from: z
      .array(z.string())
      .optional()
      .describe("Donor transfers skill:amount when adding"),
    absorbInto: z
      .string()
      .optional()
      .describe("Skill that absorbs weight when removing"),
    title: z.string().optional().describe("New level title"),
    description: z.string().optional().describe("New level description"),
    threshold: z.number().optional().describe("New pass threshold 0..1"),
  },
  cert_reweight: {
    project: projectParam,
    level: levelParam,
    profile: profileOptParam,
    skill: z.string().optional().describe("Transfer target skill"),
    delta: z.number().optional().describe("Weight to add to target"),
    from: z
      .array(z.string())
      .optional()
      .describe("Donors: skill or skill:amount"),
    set: z
      .array(z.string())
      .optional()
      .describe("Full map entries skill=weight"),
  },
  cert_coverage: {
    project: projectParam,
    profile: profileParam,
    level: levelParam,
    team: teamOptParam,
  },
  cert_gaps: {
    project: projectParam,
    profile: profileParam,
    level: levelParam,
    team: teamOptParam,
  },
  question_add: {
    project: projectParam,
    skill: skillIdParam,
    type: questionTypeParam,
    difficulty: difficultyParam,
    text: z.string().describe("Question stem text"),
    options: questionOptionsParam,
    correct: questionCorrectParam,
    expected: questionExpectedParam,
    explanation: z.string().optional().describe("Optional explanation prose"),
    code_template: z
      .string()
      .optional()
      .describe("Code scaffold for code-type questions"),
    topics: questionTopicsParam,
    evidence: z
      .enum(["knowledge", "skill", "artifact"])
      .optional()
      .describe("Probe evidence type (open/code)"),
    min_depth: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe("Minimum mastery depth this probe attests"),
    red_flags: z
      .array(z.string())
      .optional()
      .describe("Interview red flags / anti-patterns"),
    rubric: z
      .array(
        z.object({
          score: z.union([
            z.literal(0),
            z.literal(1),
            z.literal(2),
            z.literal(3),
          ]),
          description: z.string(),
        }),
      )
      .optional()
      .describe("Scored rubric rows for interviewer"),
    id: z.string().optional().describe("Optional question id (auto if omitted)"),
    force: forceParam,
  },
  question_validate: {
    project: projectParam,
    skill: skillIdParam,
    type: questionTypeParam,
    difficulty: difficultyParam,
    text: z.string().describe("Question stem text"),
    options: questionOptionsParam,
    correct: questionCorrectParam,
    expected: questionExpectedParam,
    explanation: z.string().optional().describe("Optional explanation prose"),
    code_template: z
      .string()
      .optional()
      .describe("Code scaffold for code-type questions"),
    topics: questionTopicsParam,
    id: z
      .string()
      .optional()
      .describe("Optional draft id for validation context"),
  },
  question_list: {
    project: projectParam,
    skill: skillIdOptParam,
  },
  term_add: {
    project: projectParam,
    id: z.string().describe("Term id (filename stem)"),
    term: z.string().describe("Display label"),
    definition: z.string().describe("Definition prose"),
    aliases: z.array(z.string()).optional().describe("Optional aliases"),
    skills: z
      .array(z.string())
      .optional()
      .describe("Linked skill ids for kit glossary filter"),
    kind: z
      .enum(["concept", "product"])
      .optional()
      .describe("concept (default) or product adapter"),
    force: forceParam,
  },
  term_list: {
    project: projectParam,
    skill: skillIdOptParam,
  },
  question_generate: {
    project: projectParam,
    skill: skillIdParam,
    count: z
      .number()
      .int()
      .min(1)
      .max(20)
      .optional()
      .describe("Number of draft shells (default 3)"),
    difficultyMin: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe("Min difficulty 0..1"),
    difficultyMax: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe("Max difficulty 0..1"),
    type: questionTypeParam
      .optional()
      .describe("Homogeneous draft type (mutually exclusive with mix)"),
    mix: z
      .enum(["single", "mixed", "full"])
      .optional()
      .describe(
        "Type rotation: single|mixed|full (mutually exclusive with type)",
      ),
    profile: profileOptParam,
    level: levelOptParam,
  },
  export_test: {
    project: projectParam,
    profile: profileParam,
    level: levelParam,
    format: z
      .enum(["json", "csv"])
      .optional()
      .describe("Export format (default json)"),
    team: teamOptParam,
    adaptive: z
      .boolean()
      .optional()
      .describe("Adaptive sampling per skill (use with seed/perSkill)"),
    seed: z
      .number()
      .int()
      .optional()
      .describe("RNG seed for adaptive sampling and/or shuffleOptions"),
    perSkill: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Questions per skill when adaptive"),
    shuffleOptions: z
      .boolean()
      .optional()
      .describe("Permute choice options and remap correct"),
    includeTypes: questionTypeFilterParam.describe(
      "Allowlist question types (mutually exclusive with excludeTypes)",
    ),
    excludeTypes: questionTypeFilterParam.describe(
      "Denylist question types (mutually exclusive with includeTypes)",
    ),
    includeSkills: z
      .array(z.string())
      .optional()
      .describe("Allowlist skill ids (mutually exclusive with excludeSkills)"),
    excludeSkills: z
      .array(z.string())
      .optional()
      .describe("Denylist skill ids (mutually exclusive with includeSkills)"),
    includeQuestions: z
      .array(z.string())
      .optional()
      .describe("Allowlist question ids (after skill/type filters)"),
  },
  export_matrix: {
    project: projectParam,
    profile: profileParam,
    format: z
      .enum(["csv", "json"])
      .optional()
      .describe("Matrix format (default csv)"),
  },
  export_learning: exportLearningParams,
  export_course: exportLearningParams,
  export_mermaid: {
    project: projectParam,
    profile: profileParam,
    level: levelParam,
    coverage: coverageFlagParam,
  },
  export_confluence: {
    project: projectParam,
    profile: profileParam,
    level: levelOptParam,
    team: teamOptParam,
  },
  export_kit: exportKitParams,
  index_rebuild: { project: projectParam },
  search: {
    project: projectParam,
    query: z.string().describe("Search query text"),
    kind: z
      .enum(["skill", "question"])
      .optional()
      .describe("Limit hits to skills or questions"),
  },
  skill_suggest_links: { project: projectParam },
  question_deep_validate: { project: projectParam },
  topic_registry: {
    project: projectParam,
  },
  topic_sync: {
    project: projectParam,
  },
  course_heal: {
    project: projectParam,
  },
} satisfies Record<ToolName, Record<string, z.ZodTypeAny>>;

/** Tool-level MCP descriptions (SSOT for registerTools). */
export const TOOL_DESCRIPTIONS: Record<ToolName, string> = {
  about:
    "Product identity: methodology-as-specs эталон (ontology→content→profiles→coverage/export), assessment+learning; not LMS / not agent harness; competency owners; version, capabilities (no project required)",
  suggest:
    "Next methodology actions from project state (export / player / gaps / quality) with Russian levers",
  doctor:
    "Confirm a SDM methodology project (pass project for multi-project MCP)",
  audit:
    "Detailed live audit: ontology, library duplicates, optional coverage (sibling of quality_report summary)",
  quality_report:
    "Summary quality report (methodology or corpus): verdict, ●○○ matrix, glossary; optional save/diff. save defaults true.",
  init: "Initialize a SDM methodology project in the target directory",
  locate_project:
    "Locate the nearest SDM methodology project from a directory (walk up to sdm.yaml). Returns root + name. Multi-project: use this to resolve which project a path belongs to, then pass project to other tools.",
  list_projects:
    "List SDM methodology projects (sdm.yaml) under a workspace directory. Multi-project: discover candidates to operate on.",
  player_sync:
    "Install or refresh player/ author preview assets (methodology YAML untouched)",
  studio_sync:
    "Install or refresh studio/ Methodology Studio assets (methodology YAML untouched)",
  studio_push_view:
    "Write sdm.studio.view/v1 JSON into .sdm/studio/current-view.json (bridge)",
  studio_push_coverage:
    "Build coverage/пробелы studio view from cert gaps (+ suggest) into bridge",
  studio_pull_action:
    "Read latest studio action from bridge (.sdm/studio/last-action.json)",
  skill_add:
    "Create an ontology skill YAML (id, name, optional category/topics); use skill_link for depends_on/related_to",
  skill_link: "Link depends_on / related_to on an existing skill",
  skill_graph:
    "Show skill dependency tree for a profile/level with optional coverage",
  skill_impact:
    "List skills/profiles/levels/questions/exports affected by changing a skill",
  content_stale:
    "List questions/exports with missing or mismatched meta.basis (content freshness)",
  profile_create: "Create a certification profile with empty levels[]",
  cert_create:
    "Create level certification for an existing profile with requirement triples",
  cert_patch:
    "Patch an existing certification level requirements/metadata (add/set/remove + weight transfer)",
  cert_reweight:
    "Transfer or replace requirement weights on a level (sum must stay 1)",
  cert_coverage:
    "Full certification coverage report (status per skill; optional team; blueprint workItems when enabled)",
  cert_gaps:
    "Certification gaps only (missing/thin skills + workItems in blueprint mode)",
  question_add:
    "Add a validated question bound to a skill (choice: options+correct; open: expected); honors writeGate",
  question_validate:
    "Dry-run validate a question draft (no writes; agent rewrite loop before question_add)",
  question_list: "List library questions, optionally filtered by skill",
  term_add: "Add a glossary term to library/terms (concept or product kind)",
  term_list: "List library/terms, optionally filtered by linked skill",
  question_generate:
    "Build draft question shells + agent context for a skill (does not write; use type XOR mix)",
  export_test:
    "Export a certification test package (json/csv); optional adaptive, shuffle, type/skill/question filters",
  export_matrix: "Export a profile competency matrix (levels × skills)",
  export_learning:
    "Export educational materials (TeachingContext + modules + practice ids; not an LMS). Formats: howto|notes|cheatsheet|course. Agent fills lesson prose.",
  export_course:
    "Alias of export_learning — educational materials pack (not an LMS). Prefer export_learning.",
  export_mermaid:
    "Export a Mermaid skill graph with optional coverage coloring",
  export_confluence:
    "Export a Confluence-ready Markdown page (coverage + mermaid + matrix)",
  export_kit:
    "Expert interview kit (sdm.export.kit/v1): open/code probes, glossary, checklist for profile+level. format=json (default) returns document; format=html returns self-contained page in html field — write to exports/kit-{profile}-{level}.html, do not hand-edit. Not learner cheatsheet (use export_learning). HTML is render only — SSOT is YAML.",
  index_rebuild:
    "Rebuild offline semantic index (requires search.provider=lancedb in sdm.yaml)",
  search:
    "Search the offline semantic index (requires prior index_rebuild with lancedb provider)",
  skill_suggest_links:
    "Suggest related_to/depends_on edges from skill descriptions + topics (dry-run; apply via skill_link)",
  question_deep_validate:
    "Validate the whole question library for type/payload consistency (choice options+correct, open expected/rubric) + difficulty summary; errors block, findings advisory",
  topic_registry:
    "Report project-wide topic registry: registered topics (library/topics), slugs from skills/questions/courses missing from registry, orphans, unused",
  topic_sync:
    "Back-fill library/topics YAML for every slug in skill.topics (idempotent; closes SKILL_TOPICS_EMPTY source)",
  course_heal:
    "Auto-heal course warnings: registry sync + back-fill skill topics from lesson topics + suggest descriptions from lesson content (no LLM; closest SKILL_TOPICS_EMPTY/SKILL_DESCRIPTION_THIN); re-run export_learning after",
};

/** Non-empty Zod `.description` for a field (tests / hygiene). */
export function zodFieldDescription(
  schema: z.ZodTypeAny,
): string | undefined {
  let cur: z.ZodTypeAny | undefined = schema;
  const seen = new Set<z.ZodTypeAny>();
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const d = cur.description;
    if (typeof d === "string" && d.trim().length > 0) {
      return d;
    }
    const def = cur._def as {
      innerType?: z.ZodTypeAny;
      type?: z.ZodTypeAny;
      schema?: z.ZodTypeAny;
    };
    cur = def.innerType ?? def.type ?? def.schema;
  }
  return undefined;
}

export function registerTools(server: McpServer): void {
  server.tool(
    "about",
    TOOL_DESCRIPTIONS.about,
    TOOL_INPUT_SHAPES.about,
    async (args) => loggedTool("about", args, () => toolAbout(args)),
  );

  server.tool(
    "suggest",
    TOOL_DESCRIPTIONS.suggest,
    TOOL_INPUT_SHAPES.suggest,
    async (args) => loggedTool("suggest", args, () => toolSuggest(args)),
  );

  server.tool(
    "doctor",
    TOOL_DESCRIPTIONS.doctor,
    TOOL_INPUT_SHAPES.doctor,
    async (args) => loggedTool("doctor", args, () => toolDoctor(args)),
  );

  server.tool(
    "player_sync",
    TOOL_DESCRIPTIONS.player_sync,
    TOOL_INPUT_SHAPES.player_sync,
    async (args) => loggedTool("player_sync", args, () => toolPlayerSync(args)),
  );

  server.tool(
    "studio_sync",
    TOOL_DESCRIPTIONS.studio_sync,
    TOOL_INPUT_SHAPES.studio_sync,
    async (args) => loggedTool("studio_sync", args, () => toolStudioSync(args)),
  );

  server.tool(
    "studio_push_view",
    TOOL_DESCRIPTIONS.studio_push_view,
    TOOL_INPUT_SHAPES.studio_push_view,
    async (args) =>
      loggedTool("studio_push_view", args, () => toolStudioPushView(args)),
  );

  server.tool(
    "studio_push_coverage",
    TOOL_DESCRIPTIONS.studio_push_coverage,
    TOOL_INPUT_SHAPES.studio_push_coverage,
    async (args) =>
      loggedTool("studio_push_coverage", args, () =>
        toolStudioPushCoverage(args),
      ),
  );

  server.tool(
    "studio_pull_action",
    TOOL_DESCRIPTIONS.studio_pull_action,
    TOOL_INPUT_SHAPES.studio_pull_action,
    async (args) =>
      loggedTool("studio_pull_action", args, () => toolStudioPullAction(args)),
  );

  server.tool(
    "audit",
    TOOL_DESCRIPTIONS.audit,
    TOOL_INPUT_SHAPES.audit,
    async (args) => loggedTool("audit", args, () => toolAudit(args)),
  );

  server.tool(
    "quality_report",
    TOOL_DESCRIPTIONS.quality_report,
    TOOL_INPUT_SHAPES.quality_report,
    async (args) =>
      loggedTool("quality_report", args, () => toolQualityReport(args)),
  );

  server.tool(
    "init",
    TOOL_DESCRIPTIONS.init,
    TOOL_INPUT_SHAPES.init,
    async (args) => loggedTool("init", args, () => toolInit(args)),
  );

  server.tool(
    "locate_project",
    TOOL_DESCRIPTIONS.locate_project,
    TOOL_INPUT_SHAPES.locate_project,
    async (args) => loggedTool("locate_project", args, () => toolLocateProject(args)),
  );

  server.tool(
    "list_projects",
    TOOL_DESCRIPTIONS.list_projects,
    TOOL_INPUT_SHAPES.list_projects,
    async (args) => loggedTool("list_projects", args, () => toolListProjects(args)),
  );

  server.tool(
    "skill_add",
    TOOL_DESCRIPTIONS.skill_add,
    TOOL_INPUT_SHAPES.skill_add,
    async (args) => loggedTool("skill_add", args, () => toolSkillAdd(args)),
  );

  server.tool(
    "skill_link",
    TOOL_DESCRIPTIONS.skill_link,
    TOOL_INPUT_SHAPES.skill_link,
    async (args) => loggedTool("skill_link", args, () => toolSkillLink(args)),
  );

  server.tool(
    "skill_graph",
    TOOL_DESCRIPTIONS.skill_graph,
    TOOL_INPUT_SHAPES.skill_graph,
    async (args) => loggedTool("skill_graph", args, () => toolSkillGraph(args)),
  );

  server.tool(
    "skill_impact",
    TOOL_DESCRIPTIONS.skill_impact,
    TOOL_INPUT_SHAPES.skill_impact,
    async (args) =>
      loggedTool("skill_impact", args, () => toolSkillImpact(args)),
  );

  server.tool(
    "content_stale",
    TOOL_DESCRIPTIONS.content_stale,
    TOOL_INPUT_SHAPES.content_stale,
    async (args) =>
      loggedTool("content_stale", args, () => toolContentStale(args)),
  );

  server.tool(
    "profile_create",
    TOOL_DESCRIPTIONS.profile_create,
    TOOL_INPUT_SHAPES.profile_create,
    async (args) =>
      loggedTool("profile_create", args, () => toolProfileCreate(args)),
  );

  server.tool(
    "cert_create",
    TOOL_DESCRIPTIONS.cert_create,
    TOOL_INPUT_SHAPES.cert_create,
    async (args) => loggedTool("cert_create", args, () => toolCertCreate(args)),
  );

  server.tool(
    "cert_patch",
    TOOL_DESCRIPTIONS.cert_patch,
    TOOL_INPUT_SHAPES.cert_patch,
    async (args) => loggedTool("cert_patch", args, () => toolCertPatch(args)),
  );

  server.tool(
    "cert_reweight",
    TOOL_DESCRIPTIONS.cert_reweight,
    TOOL_INPUT_SHAPES.cert_reweight,
    async (args) =>
      loggedTool("cert_reweight", args, () => toolCertReweight(args)),
  );

  server.tool(
    "cert_coverage",
    TOOL_DESCRIPTIONS.cert_coverage,
    TOOL_INPUT_SHAPES.cert_coverage,
    async (args) =>
      loggedTool("cert_coverage", args, () => toolCertCoverage(args)),
  );

  server.tool(
    "cert_gaps",
    TOOL_DESCRIPTIONS.cert_gaps,
    TOOL_INPUT_SHAPES.cert_gaps,
    async (args) => loggedTool("cert_gaps", args, () => toolCertGaps(args)),
  );

  server.tool(
    "question_add",
    TOOL_DESCRIPTIONS.question_add,
    TOOL_INPUT_SHAPES.question_add,
    async (args) =>
      loggedTool("question_add", args, () =>
        toolQuestionAdd({
          ...args,
          type: args.type as Question["type"],
        }),
      ),
  );

  server.tool(
    "question_validate",
    TOOL_DESCRIPTIONS.question_validate,
    TOOL_INPUT_SHAPES.question_validate,
    async (args) =>
      loggedTool("question_validate", args, () =>
        toolQuestionValidate({
          ...args,
          type: args.type as Question["type"],
        }),
      ),
  );

  server.tool(
    "question_list",
    TOOL_DESCRIPTIONS.question_list,
    TOOL_INPUT_SHAPES.question_list,
    async (args) =>
      loggedTool("question_list", args, () => toolQuestionList(args)),
  );

  server.tool(
    "term_add",
    TOOL_DESCRIPTIONS.term_add,
    TOOL_INPUT_SHAPES.term_add,
    async (args) => loggedTool("term_add", args, () => toolTermAdd(args)),
  );

  server.tool(
    "term_list",
    TOOL_DESCRIPTIONS.term_list,
    TOOL_INPUT_SHAPES.term_list,
    async (args) => loggedTool("term_list", args, () => toolTermList(args)),
  );

  server.tool(
    "question_generate",
    TOOL_DESCRIPTIONS.question_generate,
    TOOL_INPUT_SHAPES.question_generate,
    async (args) =>
      loggedTool("question_generate", args, () =>
        toolQuestionGenerate({
          ...args,
          type: args.type as Question["type"] | undefined,
          mix: args.mix,
        }),
      ),
  );

  server.tool(
    "export_test",
    TOOL_DESCRIPTIONS.export_test,
    TOOL_INPUT_SHAPES.export_test,
    async (args) => loggedTool("export_test", args, () => toolExportTest(args)),
  );

  server.tool(
    "export_matrix",
    TOOL_DESCRIPTIONS.export_matrix,
    TOOL_INPUT_SHAPES.export_matrix,
    async (args) =>
      loggedTool("export_matrix", args, () => toolExportMatrix(args)),
  );

  server.tool(
    "export_learning",
    TOOL_DESCRIPTIONS.export_learning,
    TOOL_INPUT_SHAPES.export_learning,
    async (args) =>
      loggedTool("export_learning", args, () => toolExportCourse(args)),
  );

  server.tool(
    "export_course",
    TOOL_DESCRIPTIONS.export_course,
    TOOL_INPUT_SHAPES.export_course,
    async (args) =>
      loggedTool("export_course", args, () => toolExportCourse(args)),
  );

  server.tool(
    "export_mermaid",
    TOOL_DESCRIPTIONS.export_mermaid,
    TOOL_INPUT_SHAPES.export_mermaid,
    async (args) =>
      loggedTool("export_mermaid", args, () => toolExportMermaid(args)),
  );

  server.tool(
    "export_confluence",
    TOOL_DESCRIPTIONS.export_confluence,
    TOOL_INPUT_SHAPES.export_confluence,
    async (args) =>
      loggedTool("export_confluence", args, () => toolExportConfluence(args)),
  );

  server.tool(
    "export_kit",
    TOOL_DESCRIPTIONS.export_kit,
    TOOL_INPUT_SHAPES.export_kit,
    async (args) => loggedTool("export_kit", args, () => toolExportKit(args)),
  );

  server.tool(
    "index_rebuild",
    TOOL_DESCRIPTIONS.index_rebuild,
    TOOL_INPUT_SHAPES.index_rebuild,
    async (args) =>
      loggedTool("index_rebuild", args, () => toolIndexRebuild(args)),
  );

  server.tool(
    "search",
    TOOL_DESCRIPTIONS.search,
    TOOL_INPUT_SHAPES.search,
    async (args) => loggedTool("search", args, () => toolSearch(args)),
  );

  server.tool(
    "skill_suggest_links",
    TOOL_DESCRIPTIONS.skill_suggest_links,
    TOOL_INPUT_SHAPES.skill_suggest_links,
    async (args) =>
      loggedTool("skill_suggest_links", args, () => toolSkillSuggestLinks(args)),
  );

  server.tool(
    "question_deep_validate",
    TOOL_DESCRIPTIONS.question_deep_validate,
    TOOL_INPUT_SHAPES.question_deep_validate,
    async (args) =>
      loggedTool("question_deep_validate", args, () => toolQuestionDeepValidate(args)),
  );

  server.tool(
    "topic_registry",
    TOOL_DESCRIPTIONS.topic_registry,
    TOOL_INPUT_SHAPES.topic_registry,
    async (args) => loggedTool("topic_registry", args, () => toolTopicRegistry(args)),
  );

  server.tool(
    "topic_sync",
    TOOL_DESCRIPTIONS.topic_sync,
    TOOL_INPUT_SHAPES.topic_sync,
    async (args) => loggedTool("topic_sync", args, () => toolTopicSync(args)),
  );

  server.tool(
    "course_heal",
    TOOL_DESCRIPTIONS.course_heal,
    TOOL_INPUT_SHAPES.course_heal,
    async (args) => loggedTool("course_heal", args, () => toolCourseHeal(args)),
  );
}

/** Product display strings for MCP initialize (UI title/description). */
export const MCP_SERVER_TITLE = "SDM";
export const MCP_SERVER_DESCRIPTION = "Methodology-as-Specs Framework";

export function createServer(version = getProductVersion()): McpServer {
  const server = new McpServer({
    name: "sdm",
    title: MCP_SERVER_TITLE,
    description: `${MCP_SERVER_DESCRIPTION} · v${version}`,
    version,
  });
  registerTools(server);
  return server;
}
