import { computeCoverage } from "./coverage.js";
import { exportKit } from "./export-kit.js";
import {
  DEFAULT_DISTRACTOR_QUALITY,
  evaluateOptionLengthQuality,
  evaluatePositionBias,
  type DistractorQualitySettings,
} from "./distractor-quality.js";
import { loadAllLevels } from "./skill-graph-ops.js";
import { buildSkillGraphFromProject } from "./skill-graph.js";
import { loadAllSkills } from "./skills.js";
import { loadQuestions } from "./loaders.js";
import { findProjectRoot } from "./project-root.js";
import { loadLevel, loadProfile, assertProfileLevelMatch } from "./loaders.js";
import {
  distractorSettingsFromQuality,
  loadQualityConfig,
} from "./quality-config.js";
import { SdmConfigSchema, type Question } from "./schemas.js";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { PROJECT_MANIFEST } from "./project-root.js";
import { readYamlFile } from "./yaml.js";
import {
  semanticIndexPath,
  semanticSimilarity,
} from "./semantic-index.js";
import { sumWeights, weightSumIsValid, WEIGHT_SUM_EPSILON } from "./weights.js";

export const AUDIT_SCHEMA = "sdm.audit/v1";

export interface LexicalDuplicate {
  leftId: string;
  rightId: string;
  similarity: number;
}

export interface AuditRecommendation {
  priority: "high" | "medium" | "low";
  message: string;
  /** Stable code aligned with question validate when overlapping. */
  code?: string;
}

export interface WeightSumFinding {
  level: string;
  profile?: string;
  sum: number;
  delta: number;
}

export interface PositionBiasFinding {
  sample: number;
  firstPositionCount: number;
  share: number;
  threshold: number;
}

export interface AuditDocument {
  schemaVersion: typeof AUDIT_SCHEMA;
  ontology: {
    skillCount: number;
    isolatedSkills: string[];
    unusedSkills: string[];
  };
  library: {
    questionCount: number;
    duplicates: LexicalDuplicate[];
    /** Present when search.provider=lancedb and index exists. */
    semanticDuplicates?: LexicalDuplicate[];
    /** Present when quality.distractorQuality is soft|strict and triggered. */
    optionPositionBias?: PositionBiasFinding;
    /** Question ids failing length-band / unique-longest rules. */
    optionLengthOutliers?: string[];
  };
  certifications?: {
    weightSumInvalid: WeightSumFinding[];
  };
  coverage?: {
    profile: string;
    level: string;
    hasMissing: boolean;
    hasThin: boolean;
    skills: ReturnType<typeof computeCoverage>["skills"];
  };
  recommendations: AuditRecommendation[];
  text: string;
}

function loadDistractorQualitySettings(
  projectRoot: string,
): DistractorQualitySettings {
  try {
    return distractorSettingsFromQuality(loadQualityConfig(projectRoot));
  } catch {
    return { ...DEFAULT_DISTRACTOR_QUALITY };
  }
}

export interface AuditRun {
  projectRoot: string;
  document: AuditDocument;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2),
  );
}

export function jaccardSimilarity(a: string, b: string): number {
  const A = tokenize(a);
  const B = tokenize(b);
  if (A.size === 0 && B.size === 0) return 1;
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function findLexicalDuplicates(
  questions: Question[],
  threshold = 0.85,
): LexicalDuplicate[] {
  const dups: LexicalDuplicate[] = [];
  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const left = questions[i]!;
      const right = questions[j]!;
      if (left.skill !== right.skill) continue;
      const similarity = jaccardSimilarity(left.text, right.text);
      if (similarity >= threshold) {
        dups.push({
          leftId: left.id,
          rightId: right.id,
          similarity: Number(similarity.toFixed(3)),
        });
      }
    }
  }
  return dups;
}

export interface RunAuditOptions {
  startDir: string;
  profile?: string;
  level?: string;
  duplicateThreshold?: number;
}

export function runMethodologyAudit(options: RunAuditOptions): AuditRun {
  const projectRoot = findProjectRoot(options.startDir);
  const skills = loadAllSkills(projectRoot);
  const graph = buildSkillGraphFromProject(projectRoot);
  const { questions } = loadQuestions(projectRoot);
  const levels = loadAllLevels(projectRoot);

  const requiredSkills = new Set<string>();
  for (const level of levels) {
    for (const r of level.requirements) requiredSkills.add(r.skill);
  }

  const isolatedSkills: string[] = [];
  for (const skill of skills) {
    const deps = skill.depends_on.length + skill.related_to.length;
    let referenced = false;
    for (const other of skills) {
      if (other.id === skill.id) continue;
      if (other.depends_on.includes(skill.id) || other.related_to.includes(skill.id)) {
        referenced = true;
        break;
      }
    }
    if (deps === 0 && !referenced) isolatedSkills.push(skill.id);
  }
  isolatedSkills.sort();

  const unusedSkills = skills
    .map((s) => s.id)
    .filter((id) => !requiredSkills.has(id))
    .sort();

  const duplicates = findLexicalDuplicates(
    questions,
    options.duplicateThreshold ?? 0.85,
  );

  const qualitySettings = loadDistractorQualitySettings(projectRoot);

  let semanticDuplicates: LexicalDuplicate[] | undefined;
  try {
    const config = SdmConfigSchema.parse(
      readYamlFile(join(projectRoot, PROJECT_MANIFEST)),
    );
    if (config.search.provider === "lancedb" && existsSync(semanticIndexPath(projectRoot))) {
      const index = JSON.parse(
        readFileSync(semanticIndexPath(projectRoot), "utf8"),
      ) as { documents: Array<{ id: string; kind: string; text: string }> };
      const qDocs = index.documents.filter((d) => d.kind === "question");
      const sem: LexicalDuplicate[] = [];
      for (let i = 0; i < qDocs.length; i++) {
        for (let j = i + 1; j < qDocs.length; j++) {
          const left = qDocs[i]!;
          const right = qDocs[j]!;
          const similarity = semanticSimilarity(left.text, right.text);
          if (similarity >= 0.9) {
            sem.push({
              leftId: left.id,
              rightId: right.id,
              similarity: Number(similarity.toFixed(3)),
            });
          }
        }
      }
      semanticDuplicates = sem;
    }
  } catch {
    // ignore search/config issues during audit
  }

  let optionPositionBias: PositionBiasFinding | undefined;
  let optionLengthOutliers: string[] | undefined;
  const policy = qualitySettings.distractorQuality;
  if (policy === "soft" || policy === "strict") {
    const pos = evaluatePositionBias(questions, qualitySettings);
    if (pos.triggered) {
      optionPositionBias = {
        sample: pos.sample,
        firstPositionCount: pos.firstPositionCount,
        share: Number(pos.share.toFixed(3)),
        threshold: qualitySettings.positionBiasThreshold,
      };
    }
    const outliers = questions
      .filter((q) => {
        const r = evaluateOptionLengthQuality(q, qualitySettings.lengthBandRatio);
        return !r.ok;
      })
      .map((q) => q.id)
      .sort((a, b) => a.localeCompare(b));
    if (outliers.length > 0) {
      optionLengthOutliers = outliers;
    }
  }

  const weightSumInvalid: WeightSumFinding[] = [];
  for (const level of levels) {
    const sum = sumWeights(level.requirements.map((r) => r.weight));
    if (!weightSumIsValid(sum)) {
      weightSumInvalid.push({
        level: level.level,
        profile: level.profile,
        sum: Number(sum.toFixed(6)),
        delta: Number((sum - 1).toFixed(6)),
      });
    }
  }
  weightSumInvalid.sort((a, b) => a.level.localeCompare(b.level));

  const recommendations: AuditRecommendation[] = [];
  for (const finding of weightSumInvalid) {
    recommendations.push({
      priority: "high",
      message: `Level "${finding.level}" requirement weights sum to ${finding.sum} (delta ${finding.delta}; ε=${WEIGHT_SUM_EPSILON}) — fix with sdm cert reweight --set …`,
    });
  }
  for (const id of unusedSkills) {
    recommendations.push({
      priority: "low",
      message: `Skill "${id}" is not used in any certification level — link it or remove it`,
    });
  }
  for (const d of duplicates) {
    recommendations.push({
      priority: "medium",
      code: "QUESTION_NEAR_DUPLICATE",
      message: `Near-duplicate questions ${d.leftId} and ${d.rightId} (similarity ${d.similarity})`,
    });
  }
  for (const d of semanticDuplicates ?? []) {
    recommendations.push({
      priority: "medium",
      code: "QUESTION_NEAR_DUPLICATE",
      message: `Semantic near-duplicate ${d.leftId} and ${d.rightId} (score ${d.similarity})`,
    });
  }

  const bySkill = new Map<string, Question[]>();
  for (const q of questions) {
    const list = bySkill.get(q.skill) ?? [];
    list.push(q);
    bySkill.set(q.skill, list);
  }
  const monoTypeSkills = [...bySkill.entries()]
    .filter(([, qs]) => {
      if (qs.length < 3) return false;
      const types = new Set(qs.map((q) => q.type));
      return types.size === 1;
    })
    .map(([skill]) => skill)
    .sort((a, b) => a.localeCompare(b));
  for (const skill of monoTypeSkills) {
    const type = bySkill.get(skill)?.[0]?.type ?? "single_choice";
    recommendations.push({
      priority: "low",
      message: `Skill "${skill}" has ${bySkill.get(skill)?.length ?? 0} questions all of type ${type} — diversify with sdm question generate --mix mixed`,
    });
  }

  const biasPriority: AuditRecommendation["priority"] =
    policy === "strict" ? "high" : "medium";
  if (optionPositionBias) {
    recommendations.push({
      priority: biasPriority,
      message: `Choice-option position bias: ${optionPositionBias.firstPositionCount}/${optionPositionBias.sample} (${Math.round(optionPositionBias.share * 100)}%) have correct at index 1 — vary correct position when authoring; use export test --shuffle-options or player «Перетасовывать варианты»`,
    });
  }
  if (optionLengthOutliers?.length) {
    const sampleIds = optionLengthOutliers.slice(0, 8).join(", ");
    const more =
      optionLengthOutliers.length > 8
        ? ` (+${optionLengthOutliers.length - 8} more)`
        : "";
    recommendations.push({
      priority: biasPriority,
      code: "DISTRACTOR_QUALITY",
      message: `Correct-option length outliers (${optionLengthOutliers.length}): ${sampleIds}${more} — rewrite distractors to comparable length (quality.distractorQuality=${policy})`,
    });
  }

  let coverage: AuditDocument["coverage"];
  if (options.profile?.trim() && options.level?.trim()) {
    const profile = loadProfile(projectRoot, options.profile.trim());
    const level = loadLevel(projectRoot, options.level.trim());
    assertProfileLevelMatch(profile, level, options.profile.trim());
    const result = computeCoverage(level, questions, {
      profile: options.profile.trim(),
      skillsById: graph.skills,
      quality: loadQualityConfig(projectRoot),
    });
    coverage = {
      profile: options.profile.trim(),
      level: level.level,
      hasMissing: result.hasMissing,
      hasThin: result.hasThin,
      skills: result.skills,
    };
    for (const s of result.skills) {
      if (s.status === "missing") {
        recommendations.push({
          priority: "high",
          message: `Add questions for skill "${s.skill}" (missing)`,
        });
      } else if (s.status === "thin") {
        recommendations.push({
          priority: "high",
          message: `Strengthen coverage for "${s.skill}" (thin: count=${s.questionCount}, depthRatio=${s.depthRatio})`,
        });
      }
    }

    try {
      const kitRun = exportKit({
        startDir: projectRoot,
        profile: options.profile.trim(),
        level: options.level.trim(),
      });
      for (const w of kitRun.document.warnings) {
        const critical = [
          "KIT_NO_PROBE_QUESTION",
          "KIT_EXPLANATION_MISSING",
          "KIT_NO_WORK_SAMPLE",
          "KIT_GLOSSARY_EMPTY",
        ].includes(w.code);
        recommendations.push({
          priority: critical ? "high" : "medium",
          code: w.code,
          message: `Kit readiness: ${w.message}`,
        });
      }
    } catch {
      // profile/level mismatch already surfaced via coverage path
    }
  }

  const document: AuditDocument = {
    schemaVersion: AUDIT_SCHEMA,
    ontology: {
      skillCount: skills.length,
      isolatedSkills,
      unusedSkills,
    },
    library: {
      questionCount: questions.length,
      duplicates,
      ...(semanticDuplicates ? { semanticDuplicates } : {}),
      ...(optionPositionBias ? { optionPositionBias } : {}),
      ...(optionLengthOutliers ? { optionLengthOutliers } : {}),
    },
    certifications: {
      weightSumInvalid,
    },
    coverage,
    recommendations,
    text: "",
  };

  document.text = formatAuditText(document);
  return { projectRoot, document };
}

function formatAuditText(doc: AuditDocument): string {
  const lines: string[] = [];
  lines.push("=== SDM methodology audit ===");
  lines.push("");
  lines.push("Ontology:");
  lines.push(`  Skills: ${doc.ontology.skillCount}`);
  lines.push(
    `  Isolated: ${doc.ontology.isolatedSkills.join(", ") || "—"}`,
  );
  lines.push(`  Unused in certs: ${doc.ontology.unusedSkills.join(", ") || "—"}`);
  if (doc.certifications?.weightSumInvalid.length) {
    lines.push("");
    lines.push("Certification weights:");
    for (const f of doc.certifications.weightSumInvalid) {
      lines.push(
        `  ⚠️ ${f.level}: sum=${f.sum} (delta ${f.delta}) — use cert reweight`,
      );
    }
  }
  lines.push("");
  lines.push("Library:");
  lines.push(`  Questions: ${doc.library.questionCount}`);
  if (doc.library.duplicates.length === 0) {
    lines.push("  Duplicates: —");
  } else {
    for (const d of doc.library.duplicates) {
      lines.push(`  ⚠️ ${d.leftId} ~ ${d.rightId} (${d.similarity})`);
    }
  }
  if (doc.library.optionPositionBias) {
    const b = doc.library.optionPositionBias;
    lines.push(
      `  ⚠️ Option position bias: ${b.firstPositionCount}/${b.sample} (share ${b.share}, threshold ${b.threshold})`,
    );
  }
  if (doc.library.optionLengthOutliers?.length) {
    const ids = doc.library.optionLengthOutliers.slice(0, 12).join(", ");
    const more =
      doc.library.optionLengthOutliers.length > 12
        ? ` (+${doc.library.optionLengthOutliers.length - 12})`
        : "";
    lines.push(`  ⚠️ Length outliers: ${ids}${more}`);
  }
  if (doc.coverage) {
    lines.push("");
    lines.push(`Coverage (${doc.coverage.profile}/${doc.coverage.level}):`);
    for (const s of doc.coverage.skills) {
      lines.push(
        `  ${s.statusSymbol} ${s.skill}: count=${s.questionCount} depth=${s.achievedDepth}/${s.depth} (${s.status})`,
      );
    }
  }
  if (doc.recommendations.length) {
    lines.push("");
    lines.push("Recommendations:");
    doc.recommendations.forEach((r, i) => {
      lines.push(`  ${i + 1}. [${r.priority}] ${r.message}`);
    });
  }
  return lines.join("\n") + "\n";
}
