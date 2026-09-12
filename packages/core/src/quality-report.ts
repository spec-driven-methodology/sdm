import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { z } from "zod";
import { runMethodologyAudit } from "./audit.js";
import { runCertGaps } from "./cert-gaps.js";
import {
  extractTopicCandidates,
  scanCorpusSources,
  type CorpusManifest,
} from "./corpus-scan.js";
import { SdmError } from "./errors.js";
import { resolveLocale, type SdmLocale } from "./locale.js";
import { isMethodologyProject } from "./init.js";
import { findProjectRoot } from "./project-root.js";
import { loadAllSkills } from "./skills.js";
import { loadQuestions } from "./loaders.js";

export const QUALITY_REPORT_SCHEMA = "sdm.quality.report/v1" as const;

export const DENSITY_LEVELS = ["full", "partial", "thin", "none"] as const;
export type DensityLevel = (typeof DENSITY_LEVELS)[number];

export const DENSITY_SYMBOL: Record<DensityLevel, string> = {
  full: "●●●",
  partial: "●●○",
  thin: "●○○",
  none: "○○○",
};

export const MATRIX_LEGEND_RU =
  "●●● плотное · ●●○ есть с дырами · ●○○ тонко · ○○○ почти нет";
export const MATRIX_LEGEND_EN =
  "●●● dense · ●●○ with gaps · ●○○ thin · ○○○ almost none";

export const BUILTIN_GLOSSARY_RU: { term: string; definition: string }[] = [
  {
    term: "SSOT",
    definition: "единый источник правды (single source of truth)",
  },
  {
    term: "HITL",
    definition: "человек утверждает решение до записи в канон",
  },
  {
    term: "coverage / gaps",
    definition: "покрытие требований вопросами / список пробелов",
  },
  {
    term: "quarry",
    definition: "карьер: сырьё для выборки, не канон «как есть»",
  },
  {
    term: "depth / difficulty",
    definition: "требуемая глубина навыка / сложность вопроса (0…1)",
  },
];

export const BUILTIN_GLOSSARY_EN: { term: string; definition: string }[] = [
  {
    term: "SSOT",
    definition: "single source of truth for methodology specs",
  },
  {
    term: "HITL",
    definition: "human confirms before writing to the canon",
  },
  {
    term: "coverage / gaps",
    definition: "requirement coverage by questions / gap list",
  },
  {
    term: "quarry",
    definition: "raw material to mine selectively, not import as-is",
  },
  {
    term: "depth / difficulty",
    definition: "required skill depth / question difficulty (0…1)",
  },
];

const DensitySchema = z.enum(DENSITY_LEVELS);

const MatrixCellSchema = z.object({
  row: z.string().min(1),
  col: z.string().min(1),
  density: DensitySchema,
  symbol: z.string().min(1),
});

const EntityRefSchema = z.object({
  kind: z.string().min(1),
  id: z.string().min(1),
});

const TopActionSchema = z.object({
  priority: z.enum(["high", "medium", "low"]),
  message: z.string().min(1),
  code: z.string().optional(),
  entityRefs: z.array(EntityRefSchema).default([]),
});

const GlossaryEntrySchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
});

const EntityScoreSchema = z.object({
  kind: z.string().min(1),
  id: z.string().min(1),
  score: z.number().min(1).max(5).optional(),
  density: DensitySchema.optional(),
  label: z.string().optional(),
});

const FindingSchema = z.object({
  code: z.string().min(1),
  severity: z.enum(["info", "warn", "error"]),
  message: z.string().min(1),
  entityRefs: z.array(EntityRefSchema).default([]),
});

export const QualityReportDocumentSchema = z.object({
  schemaVersion: z.literal(QUALITY_REPORT_SCHEMA),
  id: z.string().min(1),
  createdAt: z.string().min(1),
  mode: z.enum(["methodology", "corpus", "diff"]),
  locale: z.enum(["ru", "en"]),
  scope: z.record(z.unknown()),
  verdict: z.string().min(1),
  score: z.number().int().min(1).max(5),
  readiness: z.enum(["high", "medium", "low"]),
  summaryRu: z.string().min(1),
  summaryEn: z.string().optional(),
  matrix: z.object({
    rows: z.array(z.string()),
    cols: z.array(z.string()),
    cells: z.array(MatrixCellSchema),
    legend: z.string().min(1),
  }),
  topActions: z.array(TopActionSchema).max(5),
  glossary: z.array(GlossaryEntrySchema),
  entityScores: z.array(EntityScoreSchema),
  findings: z.array(FindingSchema),
  contentHash: z.string().min(1),
  auditRef: z
    .object({
      schemaVersion: z.string(),
      hasMissing: z.boolean().optional(),
      hasThin: z.boolean().optional(),
      duplicateCount: z.number().int().optional(),
    })
    .optional(),
  corpusManifest: z.unknown().optional(),
  diff: z
    .object({
      baselineId: z.string(),
      scoreDelta: z.number(),
      matrixChanges: z.array(
        z.object({
          row: z.string(),
          col: z.string(),
          from: DensitySchema,
          to: DensitySchema,
          fromSymbol: z.string(),
          toSymbol: z.string(),
        }),
      ),
      newFindingCodes: z.array(z.string()),
      resolvedFindingCodes: z.array(z.string()),
    })
    .optional(),
  savedPath: z.string().optional(),
});

export type QualityReportDocument = z.infer<typeof QualityReportDocumentSchema>;

export interface BuildQualityReportOptions {
  startDir?: string;
  sourcesDir?: string;
  profile?: string;
  level?: string;
  locale?: string;
  /** When set, build fresh report then attach diff against saved baseline. */
  diffReportId?: string;
  save?: boolean;
}

export interface QualityReportRun {
  document: QualityReportDocument;
  projectRoot: string | null;
  reportsRoot: string;
  manifest?: CorpusManifest;
}

function cell(
  row: string,
  col: string,
  density: DensityLevel,
): z.infer<typeof MatrixCellSchema> {
  return { row, col, density, symbol: DENSITY_SYMBOL[density] };
}

function hashDoc(parts: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(parts), "utf8")
    .digest("hex")
    .slice(0, 16);
}

function slugPart(s: string | undefined): string {
  if (!s) return "";
  return s.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 40);
}

function makeReportId(mode: string, scope: Record<string, unknown>): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const bits = [ts, mode];
  if (typeof scope.profile === "string") bits.push(slugPart(scope.profile));
  if (typeof scope.level === "string") bits.push(slugPart(scope.level));
  if (typeof scope.sourcesDir === "string") bits.push("corpus");
  return bits.filter(Boolean).join("_");
}

function scoreToReadiness(score: number): "high" | "medium" | "low" {
  if (score >= 4) return "high";
  if (score >= 3) return "medium";
  return "low";
}

function coverageStatusToDensity(
  status: "ok" | "thin" | "missing" | string,
): DensityLevel {
  if (status === "ok") return "full";
  if (status === "thin") return "partial";
  if (status === "missing") return "none";
  return "thin";
}

function questionCountToDensity(n: number): DensityLevel {
  if (n >= 5) return "full";
  if (n >= 3) return "partial";
  if (n >= 1) return "thin";
  return "none";
}

function resolveReportsRoot(startDir: string, sourcesDir?: string): {
  projectRoot: string | null;
  reportsRoot: string;
} {
  const start = resolve(startDir);
  try {
    const projectRoot = findProjectRoot(start);
    if (isMethodologyProject(projectRoot)) {
      return {
        projectRoot,
        reportsRoot: join(projectRoot, ".sdm", "reports", "quality"),
      };
    }
  } catch {
    /* not a project */
  }
  if (sourcesDir) {
    const root = resolve(sourcesDir);
    return {
      projectRoot: null,
      reportsRoot: join(root, ".sdm", "reports", "quality"),
    };
  }
  throw new SdmError(
    "NOT_A_PROJECT",
    `Not a SDM methodology project: ${start}. Run: sdm init (or pass --sources for corpus mode)`,
  );
}

export function qualityReportsDir(reportsRoot: string): string {
  return reportsRoot;
}

export function loadQualityReport(
  reportsRoot: string,
  reportId: string,
): QualityReportDocument {
  if (!existsSync(reportsRoot)) {
    throw new SdmError(
      "QUALITY_REPORT_NOT_FOUND",
      `Quality report not found: ${reportId}`,
    );
  }
  const exact = join(reportsRoot, `${reportId}.json`);
  if (existsSync(exact)) {
    return QualityReportDocumentSchema.parse(
      JSON.parse(readFileSync(exact, "utf8")),
    );
  }
  const match = readdirSync(reportsRoot)
    .filter((f) => f.endsWith(".json"))
    .find((f) => f === `${reportId}.json` || f.startsWith(`${reportId}`));
  if (!match) {
    throw new SdmError(
      "QUALITY_REPORT_NOT_FOUND",
      `Quality report not found: ${reportId}`,
    );
  }
  return QualityReportDocumentSchema.parse(
    JSON.parse(readFileSync(join(reportsRoot, match), "utf8")),
  );
}

export function saveQualityReport(
  reportsRoot: string,
  document: QualityReportDocument,
): string {
  mkdirSync(reportsRoot, { recursive: true });
  const path = join(reportsRoot, `${document.id}.json`);
  writeFileSync(path, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  return path;
}

function buildMethodologyReport(
  projectRoot: string,
  options: BuildQualityReportOptions,
  locale: SdmLocale,
): QualityReportDocument {
  const profile = options.profile;
  const level = options.level;
  const audit = runMethodologyAudit({
    startDir: projectRoot,
    profile,
    level,
  });
  const skills = loadAllSkills(projectRoot);
  const { questions } = loadQuestions(projectRoot);
  const bySkill = new Map<string, number>();
  for (const q of questions) {
    bySkill.set(q.skill, (bySkill.get(q.skill) ?? 0) + 1);
  }

  const cols = ["library", ...(profile && level ? ["coverage"] : [])];
  const rows: string[] = [];
  const cells: z.infer<typeof MatrixCellSchema>[] = [];
  const entityScores: z.infer<typeof EntityScoreSchema>[] = [];
  const findings: z.infer<typeof FindingSchema>[] = [];
  const topActions: z.infer<typeof TopActionSchema>[] = [];

  let gapsSkills:
    | { id: string; status: string }[]
    | undefined;
  if (profile && level) {
    const gaps = runCertGaps({
      startDir: projectRoot,
      profile,
      level,
    });
    gapsSkills = gaps.result.skills.map((s) => ({
      id: s.skill,
      status: s.status,
    }));
    for (const s of gaps.result.skills) {
      rows.push(s.skill);
      cells.push(cell(s.skill, "library", questionCountToDensity(bySkill.get(s.skill) ?? 0)));
      cells.push(cell(s.skill, "coverage", coverageStatusToDensity(s.status)));
      entityScores.push({
        kind: "skill",
        id: s.skill,
        density: coverageStatusToDensity(s.status),
        label: s.status,
      });
    }
  } else {
    for (const s of skills) {
      rows.push(s.id);
      const d = questionCountToDensity(bySkill.get(s.id) ?? 0);
      cells.push(cell(s.id, "library", d));
      entityScores.push({ kind: "skill", id: s.id, density: d });
    }
  }

  for (const id of audit.document.ontology.isolatedSkills) {
    findings.push({
      code: "ISOLATED_SKILL",
      severity: "warn",
      message:
        locale === "ru"
          ? `Навык «${id}» изолирован в графе`
          : `Skill "${id}" is isolated in the graph`,
      entityRefs: [{ kind: "skill", id }],
    });
  }
  for (const d of audit.document.library.duplicates.slice(0, 10)) {
    findings.push({
      code: "LEXICAL_DUPLICATE",
      severity: "warn",
      message:
        locale === "ru"
          ? `Похожие вопросы ${d.leftId} ~ ${d.rightId} (${d.similarity})`
          : `Near-duplicate questions ${d.leftId} ~ ${d.rightId} (${d.similarity})`,
      entityRefs: [
        { kind: "question", id: d.leftId },
        { kind: "question", id: d.rightId },
      ],
    });
  }

  const missing = gapsSkills?.filter((s) => s.status === "missing").length ?? 0;
  const thin = gapsSkills?.filter((s) => s.status === "thin").length ?? 0;
  const dupCount = audit.document.library.duplicates.length;
  let score = 5;
  if (missing > 0) score -= Math.min(2, missing);
  if (thin > 0) score -= 1;
  if (dupCount > 0) score -= 1;
  if (audit.document.ontology.isolatedSkills.length > 2) score -= 1;
  score = Math.max(1, Math.min(5, score));

  if (missing + thin > 0) {
    topActions.push({
      priority: "high",
      message:
        locale === "ru"
          ? `Закрыть пробелы покрытия (не покрыто=${missing}, слабо=${thin})`
          : `Close coverage gaps (missing=${missing}, thin=${thin})`,
      code: "CLOSE_GAPS",
      entityRefs: profile && level
        ? [
            { kind: "profile", id: profile },
            { kind: "level", id: level },
          ]
        : [],
    });
  }
  if (dupCount > 0) {
    topActions.push({
      priority: "medium",
      message:
        locale === "ru"
          ? `Разобрать дубликаты вопросов (${dupCount})`
          : `Resolve question duplicates (${dupCount})`,
      code: "RESOLVE_DUPLICATES",
      entityRefs: [],
    });
  }
  if (topActions.length < 5) {
    topActions.push({
      priority: "low",
      message:
        locale === "ru"
          ? "Сверить детальный audit при необходимости"
          : "Run detailed audit if needed",
      code: "RUN_AUDIT",
      entityRefs: [],
    });
  }

  const readiness = scoreToReadiness(score);
  const verdictRu =
    readiness === "high"
      ? "Канон в хорошей форме для пилота; точечные доработки."
      : readiness === "medium"
        ? "Канон рабочий, но есть заметные пробелы или риски качества."
        : "Канон сырой: много пробелов или дефектов библиотеки.";
  const verdictEn =
    readiness === "high"
      ? "Canon is in good shape for a pilot; minor follow-ups."
      : readiness === "medium"
        ? "Canon is usable but has notable gaps or quality risks."
        : "Canon is raw: many gaps or library defects.";

  const summaryRu = [
    verdictRu,
    `Оценка ${score}/5, готовность пилота: ${readiness}.`,
    profile && level
      ? `Фокус: профиль ${profile}, уровень ${level}; не покрыто=${missing}, слабо покрыто=${thin}, дубликатов=${dupCount}.`
      : `Навыков=${skills.length}, вопросов=${questions.length}, дубликатов=${dupCount}.`,
    "Матрица ниже — обзор плотности library/coverage по навыкам.",
  ].join(" ");

  const summaryEn = [
    verdictEn,
    `Score ${score}/5, pilot readiness: ${readiness}.`,
    profile && level
      ? `Focus: profile ${profile}, level ${level}; missing=${missing}, thin=${thin}, duplicates=${dupCount}.`
      : `Skills=${skills.length}, questions=${questions.length}, duplicates=${dupCount}.`,
  ].join(" ");

  const scope: Record<string, unknown> = {
    projectRoot,
    profile: profile ?? null,
    level: level ?? null,
  };
  const id = makeReportId("methodology", {
    profile,
    level,
  });

  return QualityReportDocumentSchema.parse({
    schemaVersion: QUALITY_REPORT_SCHEMA,
    id,
    createdAt: new Date().toISOString(),
    mode: "methodology",
    locale,
    scope,
    verdict: locale === "ru" ? verdictRu : verdictEn,
    score,
    readiness,
    summaryRu,
    summaryEn,
    matrix: {
      rows: rows.length ? rows : ["(empty)"],
      cols: cols.length ? cols : ["library"],
      cells:
        cells.length > 0
          ? cells
          : [cell("(empty)", "library", "none")],
      legend: locale === "ru" ? MATRIX_LEGEND_RU : MATRIX_LEGEND_EN,
    },
    topActions: topActions.slice(0, 5),
    glossary: locale === "ru" ? BUILTIN_GLOSSARY_RU : BUILTIN_GLOSSARY_EN,
    entityScores,
    findings,
    contentHash: hashDoc({
      score,
      cells,
      missing,
      thin,
      dupCount,
    }),
    auditRef: {
      schemaVersion: audit.document.schemaVersion,
      hasMissing: audit.document.coverage?.hasMissing,
      hasThin: audit.document.coverage?.hasThin,
      duplicateCount: dupCount,
    },
  });
}

function topicDensityForCol(
  topic: string,
  col: string,
  manifest: CorpusManifest,
): DensityLevel {
  const topicRe = new RegExp(
    topic.split(/\s+/)[0]!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i",
  );
  const relevant = manifest.entries.filter((e) => {
    if (col === "banks" && e.artifactType !== "question_bank") return false;
    if (col === "matrices" && e.artifactType !== "matrix" && e.artifactType !== "rubric")
      return false;
    if (col === "program" && e.artifactType !== "program") return false;
    if (
      col === "all" &&
      e.artifactType === "stub"
    )
      return false;
    const hit =
      topicRe.test(e.path) ||
      e.headings.some((h) => topicRe.test(h) || h.toLowerCase().includes(topic.toLowerCase()));
    return hit;
  });
  if (relevant.length === 0) return "none";
  const lines = relevant.reduce((a, e) => a + e.lineCount, 0);
  const hasBank = relevant.some((e) => e.artifactType === "question_bank");
  const multi = relevant.some((e) => e.signals.includes("multi_correct_mcq"));
  if (hasBank && lines >= 120 && !multi) return "full";
  if (hasBank && lines >= 40) return multi ? "partial" : "partial";
  if (lines >= 20 || relevant.length >= 1) return "thin";
  return "none";
}

function buildCorpusReport(
  sourcesDir: string,
  locale: SdmLocale,
): { document: QualityReportDocument; manifest: CorpusManifest } {
  const manifest = scanCorpusSources({ sourcesDir });
  const topics = extractTopicCandidates(manifest);
  const cols = ["banks", "matrices", "program"];
  const cells: z.infer<typeof MatrixCellSchema>[] = [];
  for (const topic of topics) {
    for (const col of cols) {
      cells.push(cell(topic, col, topicDensityForCol(topic, col, manifest)));
    }
  }

  const banks = manifest.entries.filter((e) => e.artifactType === "question_bank");
  const stubs = manifest.entries.filter((e) => e.artifactType === "stub");
  const multi = manifest.entries.filter((e) =>
    e.signals.includes("multi_correct_mcq"),
  );
  const quarry = manifest.entries.filter((e) => e.status === "quarry");

  let score = 4;
  if (banks.length === 0) score -= 2;
  if (multi.length > 0) score -= 1;
  if (stubs.length > manifest.entries.length / 3) score -= 1;
  if (manifest.entries.filter((e) => e.artifactType === "matrix").length === 0)
    score -= 1;
  score = Math.max(1, Math.min(5, score));
  const readiness = scoreToReadiness(score);

  const findings: z.infer<typeof FindingSchema>[] = [];
  for (const e of multi.slice(0, 8)) {
    findings.push({
      code: "MULTI_CORRECT_MCQ",
      severity: "warn",
      message:
        locale === "ru"
          ? `Возможны несколько ✅ в одном блоке: ${e.path}`
          : `Possible multi-correct MCQ markers in ${e.path}`,
      entityRefs: [{ kind: "source", id: e.path }],
    });
  }
  for (const e of stubs.slice(0, 5)) {
    findings.push({
      code: "STUB_SHORT",
      severity: "info",
      message:
        locale === "ru"
          ? `Короткий/stub файл: ${e.path}`
          : `Short/stub file: ${e.path}`,
      entityRefs: [{ kind: "source", id: e.path }],
    });
  }

  const topActions: z.infer<typeof TopActionSchema>[] = [
    {
      priority: "high",
      message:
        locale === "ru"
          ? "Утвердить HITL: SSOT уровней и пилотный профиль (не импорт dump целиком)"
          : "Confirm HITL: level SSOT and pilot profile (do not import dump as-is)",
      code: "HITL_CANON",
      entityRefs: [],
    },
  ];
  if (quarry.length > 0) {
    topActions.push({
      priority: "high",
      message:
        locale === "ru"
          ? `Использовать quarry-файлы (${quarry.length}) выборочно, не как SSOT`
          : `Treat quarry files (${quarry.length}) as selective source, not SSOT`,
      code: "QUARRY_SELECTIVE",
      entityRefs: quarry.slice(0, 3).map((e) => ({ kind: "source", id: e.path })),
    });
  }
  if (multi.length > 0) {
    topActions.push({
      priority: "medium",
      message:
        locale === "ru"
          ? "Исправить multi-✅ MCQ до question add"
          : "Fix multi-correct MCQ before question add",
      code: "FIX_MCQ",
      entityRefs: [],
    });
  }
  topActions.push({
    priority: "medium",
    message:
      locale === "ru"
        ? "Пилот одной специальности → intent-loop / bootstrap profile pack"
        : "Pilot one specialty → intent-loop / bootstrap profile pack",
    code: "PILOT_BOOTSTRAP",
    entityRefs: [],
  });

  const verdictRu =
    readiness === "high"
      ? "Корпус достаточен для пилота после лёгкой нормализации."
      : readiness === "medium"
        ? "Корпус смешанный: рамка есть, assessment нужно нормализовать."
        : "Корпус сырой: импорт «как есть» не рекомендуется.";
  const verdictEn =
    readiness === "high"
      ? "Corpus is enough for a pilot after light normalization."
      : readiness === "medium"
        ? "Mixed corpus: frame is OK, assessment needs normalization."
        : "Raw corpus: import as-is is not recommended.";

  const summaryRu = [
    verdictRu,
    `Оценка ${score}/5 (${readiness}). Файлов .md: ${manifest.entries.length}, банков: ${banks.length}, stub: ${stubs.length}, quarry: ${quarry.length}.`,
    "Матрица тем × срезы — эвристика по заголовкам/путям (без LLM).",
    "Дальше: HITL → скелет профиля, не слепой импорт.",
  ].join(" ");

  const summaryEn = [
    verdictEn,
    `Score ${score}/5 (${readiness}). Markdown files: ${manifest.entries.length}, banks: ${banks.length}, stubs: ${stubs.length}, quarry: ${quarry.length}.`,
    "Topic × slice matrix uses path/heading heuristics (no LLM).",
  ].join(" ");

  const scope = { sourcesDir: resolve(sourcesDir) };
  const id = makeReportId("corpus", scope);

  const entityScores = manifest.entries.slice(0, 40).map((e) => ({
    kind: "source",
    id: e.path,
    label: `${e.artifactType}/${e.status}`,
    density:
      e.artifactType === "stub"
        ? ("none" as const)
        : e.status === "quarry"
          ? ("thin" as const)
          : e.lineCount > 100
            ? ("partial" as const)
            : ("thin" as const),
  }));

  const document = QualityReportDocumentSchema.parse({
    schemaVersion: QUALITY_REPORT_SCHEMA,
    id,
    createdAt: new Date().toISOString(),
    mode: "corpus",
    locale,
    scope,
    verdict: locale === "ru" ? verdictRu : verdictEn,
    score,
    readiness,
    summaryRu,
    summaryEn,
    matrix: {
      rows: topics,
      cols,
      cells,
      legend: locale === "ru" ? MATRIX_LEGEND_RU : MATRIX_LEGEND_EN,
    },
    topActions: topActions.slice(0, 5),
    glossary: locale === "ru" ? BUILTIN_GLOSSARY_RU : BUILTIN_GLOSSARY_EN,
    entityScores,
    findings,
    contentHash: hashDoc({
      score,
      entries: manifest.entries.map((e) => e.contentHash),
      cells,
    }),
    corpusManifest: manifest,
  });

  return { document, manifest };
}

export function diffQualityReports(
  baseline: QualityReportDocument,
  current: QualityReportDocument,
): NonNullable<QualityReportDocument["diff"]> {
  const baseMap = new Map(
    baseline.matrix.cells.map((c) => [`${c.row}\0${c.col}`, c]),
  );
  const matrixChanges: NonNullable<QualityReportDocument["diff"]>["matrixChanges"] =
    [];
  for (const c of current.matrix.cells) {
    const prev = baseMap.get(`${c.row}\0${c.col}`);
    if (prev && prev.density !== c.density) {
      matrixChanges.push({
        row: c.row,
        col: c.col,
        from: prev.density,
        to: c.density,
        fromSymbol: prev.symbol,
        toSymbol: c.symbol,
      });
    }
  }
  const baseCodes = new Set(baseline.findings.map((f) => f.code));
  const curCodes = new Set(current.findings.map((f) => f.code));
  return {
    baselineId: baseline.id,
    scoreDelta: current.score - baseline.score,
    matrixChanges,
    newFindingCodes: [...curCodes].filter((c) => !baseCodes.has(c)),
    resolvedFindingCodes: [...baseCodes].filter((c) => !curCodes.has(c)),
  };
}

export function buildQualityReport(
  options: BuildQualityReportOptions = {},
): QualityReportRun {
  const startDir = resolve(options.startDir ?? process.cwd());
  const locale = resolveLocale(options.locale);
  const sourcesDir = options.sourcesDir
    ? resolve(options.sourcesDir)
    : undefined;

  const { projectRoot, reportsRoot } = resolveReportsRoot(startDir, sourcesDir);

  let document: QualityReportDocument;
  let manifest: CorpusManifest | undefined;

  if (sourcesDir) {
    const built = buildCorpusReport(sourcesDir, locale);
    document = built.document;
    manifest = built.manifest;
  } else {
    if (!projectRoot) {
      throw new SdmError(
        "NOT_A_PROJECT",
        `Not a SDM methodology project: ${startDir}. Run: sdm init`,
      );
    }
    document = buildMethodologyReport(projectRoot, options, locale);
  }

  if (options.diffReportId) {
    const baseline = loadQualityReport(reportsRoot, options.diffReportId);
    const diff = diffQualityReports(baseline, document);
    const verdictRu = `Сравнение с ${baseline.id}: Δ оценки ${diff.scoreDelta >= 0 ? "+" : ""}${diff.scoreDelta}, изменений матрицы: ${diff.matrixChanges.length}.`;
    const verdictEn = `Diff vs ${baseline.id}: score Δ ${diff.scoreDelta >= 0 ? "+" : ""}${diff.scoreDelta}, matrix changes: ${diff.matrixChanges.length}.`;
    document = QualityReportDocumentSchema.parse({
      ...document,
      id: makeReportId("diff", {
        ...document.scope,
        baseline: baseline.id,
      }),
      mode: "diff",
      verdict: locale === "ru" ? verdictRu : verdictEn,
      summaryRu: `${verdictRu} ${document.summaryRu}`,
      summaryEn: `${verdictEn} ${document.summaryEn ?? ""}`,
      diff,
      topActions: [
        {
          priority: diff.scoreDelta < 0 ? "high" : "medium",
          message:
            locale === "ru"
              ? diff.scoreDelta < 0
                ? "Качество снизилось — разобрать изменения матрицы и findings"
                : "Зафиксировать улучшения или закрыть оставшиеся пробелы"
              : diff.scoreDelta < 0
                ? "Quality dropped — review matrix changes and findings"
                : "Lock in improvements or close remaining gaps",
          code: "DIFF_FOLLOWUP",
          entityRefs: [],
        },
        ...document.topActions,
      ].slice(0, 5),
    });
  }

  if (options.save) {
    const path = saveQualityReport(reportsRoot, document);
    document = QualityReportDocumentSchema.parse({
      ...document,
      savedPath: path,
    });
    // rewrite with savedPath
    writeFileSync(path, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  }

  return {
    document,
    projectRoot,
    reportsRoot,
    manifest,
  };
}

export function formatQualityReportText(
  document: QualityReportDocument,
  locale?: SdmLocale,
): string {
  const loc = locale ?? document.locale;
  const lines: string[] = [];
  const title =
    loc === "ru" ? "Сводный отчёт качества SDM" : "SDM quality report";
  lines.push(`=== ${title} ===`);
  lines.push(`${document.verdict}`);
  lines.push(
    loc === "ru"
      ? `Оценка: ${document.score}/5 · готовность: ${document.readiness} · режим: ${document.mode}`
      : `Score: ${document.score}/5 · readiness: ${document.readiness} · mode: ${document.mode}`,
  );
  lines.push("");
  lines.push(loc === "ru" ? document.summaryRu : document.summaryEn ?? document.summaryRu);
  lines.push("");
  lines.push(loc === "ru" ? "Матрица:" : "Matrix:");
  lines.push(document.matrix.legend);
  const header = ["", ...document.matrix.cols].join(" | ");
  lines.push(header);
  for (const row of document.matrix.rows) {
    const symbols = document.matrix.cols.map((col) => {
      const c = document.matrix.cells.find((x) => x.row === row && x.col === col);
      return c?.symbol ?? "○○○";
    });
    lines.push([row, ...symbols].join(" | "));
  }
  lines.push("");
  lines.push(loc === "ru" ? "Топ действий:" : "Top actions:");
  for (const [i, a] of document.topActions.entries()) {
    lines.push(`${i + 1}. [${a.priority}] ${a.message}`);
  }
  if (document.diff) {
    lines.push("");
    lines.push(
      loc === "ru"
        ? `Diff vs ${document.diff.baselineId}: Δ=${document.diff.scoreDelta}`
        : `Diff vs ${document.diff.baselineId}: Δ=${document.diff.scoreDelta}`,
    );
    for (const ch of document.diff.matrixChanges.slice(0, 12)) {
      lines.push(
        `  ${ch.row} × ${ch.col}: ${ch.fromSymbol} → ${ch.toSymbol}`,
      );
    }
  }
  lines.push("");
  lines.push(loc === "ru" ? "Глоссарий:" : "Glossary:");
  for (const g of document.glossary) {
    lines.push(`- ${g.term}: ${g.definition}`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}
