import { labelDepth } from "./depth-bands.js";
import type { Level, Question, QualityConfig, Skill } from "./schemas.js";
import { DEFAULT_QUALITY_CONFIG } from "./quality-config.js";

/** PoC heuristic: enough questions per required skill. */
export const MIN_OK_QUESTIONS = 3;

/** Depth is considered met when achievedDepth / requiredDepth >= this ratio. */
export const DEPTH_OK_RATIO = 0.9;

export type CoverageStatus = "missing" | "thin" | "ok";

export interface CoverageWorkItem {
  skill: string;
  topic?: string;
  type?: Question["type"];
  difficultyMin?: number;
  difficultyMax?: number;
  reason: string;
}

export interface SkillCoverage {
  skill: string;
  depth: number;
  weight: number;
  depthBand: string;
  depthLabel: string;
  questionCount: number;
  /** Max difficulty among questions for this skill (0 if none). */
  achievedDepth: number;
  /** achievedDepth / depth (1 if depth is 0 and there is at least one question). */
  depthRatio: number;
  /** Skill topics not covered by any question topic (when skill topics are set). */
  uncoveredTopics: string[];
  /** Suggested difficulty band to close a depth gap. */
  missingDifficultyBand?: { min: number; max: number };
  /** Blueprint: why status is not ok (empty in legacy when ok). */
  reasons: string[];
  status: CoverageStatus;
  statusSymbol: "❌" | "⚠️" | "✅";
}

export interface CoverageResult {
  profile?: string;
  level: string;
  title: string;
  skills: SkillCoverage[];
  hasMissing: boolean;
  /** True when any skill is thin due to count or depth (not missing). */
  hasThin: boolean;
  minOkQuestions: number;
  /** Blueprint work queue (empty in legacy). */
  workItems: CoverageWorkItem[];
  coverageMode: QualityConfig["coverageMode"];
}

export function statusForCount(count: number, minOk = MIN_OK_QUESTIONS): CoverageStatus {
  if (count <= 0) return "missing";
  if (count < minOk) return "thin";
  return "ok";
}

function symbolFor(status: CoverageStatus): SkillCoverage["statusSymbol"] {
  switch (status) {
    case "missing":
      return "❌";
    case "thin":
      return "⚠️";
    case "ok":
      return "✅";
  }
}

export function countQuestionsBySkill(questions: Question[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const q of questions) {
    counts.set(q.skill, (counts.get(q.skill) ?? 0) + 1);
  }
  return counts;
}

export function maxDifficultyBySkill(questions: Question[]): Map<string, number> {
  const maxes = new Map<string, number>();
  for (const q of questions) {
    const prev = maxes.get(q.skill) ?? 0;
    if (q.difficulty > prev) {
      maxes.set(q.skill, q.difficulty);
    }
  }
  return maxes;
}

export function depthRatio(achieved: number, required: number, questionCount: number): number {
  if (required <= 0) {
    return questionCount > 0 ? 1 : 0;
  }
  return achieved / required;
}

function uncoveredTopicsForSkill(
  skillTopics: string[] | undefined,
  skillQuestions: Question[],
): string[] {
  const expected = skillTopics ?? [];
  if (expected.length === 0) return [];
  const covered = new Set<string>();
  for (const q of skillQuestions) {
    for (const t of q.topics ?? []) {
      covered.add(t);
    }
  }
  return expected.filter((t) => !covered.has(t));
}

function resolveLegacyStatus(
  questionCount: number,
  ratio: number,
  minOk: number,
): CoverageStatus {
  if (questionCount <= 0) return "missing";
  if (questionCount < minOk || ratio < DEPTH_OK_RATIO) return "thin";
  return "ok";
}

function buildWorkItemsForSkill(
  skill: SkillCoverage,
  skillQuestions: Question[],
  minOk: number,
  quality: QualityConfig,
): CoverageWorkItem[] {
  const items: CoverageWorkItem[] = [];
  const band =
    skill.missingDifficultyBand ??
    (skill.depth > 0
      ? {
          min: Number(Math.max(0, skill.depth * 0.7).toFixed(2)),
          max: Number(Math.min(1, skill.depth).toFixed(2)),
        }
      : undefined);

  if (skill.status === "missing") {
    items.push({
      skill: skill.skill,
      reason: "missing_questions",
      difficultyMin: band?.min,
      difficultyMax: band?.max,
    });
    return items;
  }

  if (skill.questionCount < minOk) {
    items.push({
      skill: skill.skill,
      reason: "below_min_questions",
      difficultyMin: band?.min,
      difficultyMax: band?.max,
    });
  }

  if (skill.missingDifficultyBand) {
    items.push({
      skill: skill.skill,
      reason: "depth_band",
      difficultyMin: skill.missingDifficultyBand.min,
      difficultyMax: skill.missingDifficultyBand.max,
    });
  }

  for (const topic of skill.uncoveredTopics) {
    items.push({
      skill: skill.skill,
      topic,
      reason: "uncovered_topic",
      difficultyMin: band?.min,
      difficultyMax: band?.max,
    });
  }

  if (quality.minDistinctTypes > 0) {
    const types = new Set(skillQuestions.map((q) => q.type));
    if (types.size < quality.minDistinctTypes) {
      items.push({
        skill: skill.skill,
        reason: "type_diversity",
        difficultyMin: band?.min,
        difficultyMax: band?.max,
      });
    }
  }

  return items;
}

export function computeCoverage(
  level: Level,
  questions: Question[],
  options?: {
    profile?: string;
    minOkQuestions?: number;
    /** Optional skill metadata for topic gaps. */
    skillsById?: Map<string, Skill>;
    quality?: QualityConfig;
  },
): CoverageResult {
  const quality = options?.quality ?? DEFAULT_QUALITY_CONFIG;
  const minOk =
    options?.minOkQuestions ??
    (quality.minQuestions > 0 ? quality.minQuestions : MIN_OK_QUESTIONS);
  const counts = countQuestionsBySkill(questions);
  const maxDiff = maxDifficultyBySkill(questions);
  const bySkill = new Map<string, Question[]>();
  for (const q of questions) {
    const list = bySkill.get(q.skill) ?? [];
    list.push(q);
    bySkill.set(q.skill, list);
  }

  const skills: SkillCoverage[] = level.requirements.map((req) => {
    const questionCount = counts.get(req.skill) ?? 0;
    const achievedDepth = maxDiff.get(req.skill) ?? 0;
    const ratio = depthRatio(achievedDepth, req.depth, questionCount);
    const skillMeta = options?.skillsById?.get(req.skill);
    const skillQuestions = bySkill.get(req.skill) ?? [];
    const uncovered = uncoveredTopicsForSkill(skillMeta?.topics, skillQuestions);
    const reasons: string[] = [];

    let status = resolveLegacyStatus(questionCount, ratio, minOk);
    if (status === "missing") {
      reasons.push("missing_questions");
    } else {
      if (questionCount < minOk) reasons.push("below_min_questions");
      if (ratio < DEPTH_OK_RATIO) reasons.push("depth_ratio");
    }

    const missingDifficultyBand =
      status !== "ok" && req.depth > 0 && achievedDepth < req.depth * DEPTH_OK_RATIO
        ? {
            min: Number(Math.max(0, req.depth * 0.7).toFixed(2)),
            max: Number(Math.min(1, req.depth).toFixed(2)),
          }
        : undefined;

    if (quality.coverageMode === "blueprint" && status !== "missing") {
      const expectedTopics = skillMeta?.topics ?? [];
      if (expectedTopics.length > 0) {
        const coveredCount = expectedTopics.length - uncovered.length;
        const coveredRatio = coveredCount / expectedTopics.length;
        if (coveredRatio < quality.minTopicsCoveredRatio) {
          status = "thin";
          reasons.push("uncovered_topics");
        }
      }
      if (quality.minDistinctTypes > 0) {
        const types = new Set(skillQuestions.map((q) => q.type));
        if (types.size < quality.minDistinctTypes) {
          status = questionCount <= 0 ? "missing" : "thin";
          reasons.push("type_diversity");
        }
      }
    }

    // Legacy: reasons only for non-ok (helpful for agents); blueprint always fills reasons when thin/missing
    const finalReasons =
      status === "ok" ? [] : [...new Set(reasons.length ? reasons : [status])];

    const depthView = labelDepth(req.depth);

    return {
      skill: req.skill,
      depth: req.depth,
      weight: req.weight,
      depthBand: depthView.band,
      depthLabel: depthView.label,
      questionCount,
      achievedDepth,
      depthRatio: Number(ratio.toFixed(4)),
      uncoveredTopics: uncovered,
      missingDifficultyBand,
      reasons: finalReasons,
      status,
      statusSymbol: symbolFor(status),
    };
  });

  const workItems: CoverageWorkItem[] =
    quality.coverageMode === "blueprint"
      ? skills
          .filter((s) => s.status !== "ok")
          .flatMap((s) =>
            buildWorkItemsForSkill(s, bySkill.get(s.skill) ?? [], minOk, quality),
          )
      : [];

  return {
    profile: options?.profile,
    level: level.level,
    title: level.title,
    skills,
    hasMissing: skills.some((s) => s.status === "missing"),
    hasThin: skills.some((s) => s.status === "thin"),
    minOkQuestions: minOk,
    workItems,
    coverageMode: quality.coverageMode,
  };
}
