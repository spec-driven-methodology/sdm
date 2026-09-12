import { ZodError } from "zod";
import { jaccardSimilarity } from "./audit.js";
import { evaluateOptionLengthQuality } from "./distractor-quality.js";
import { SdmError } from "./errors.js";
import { loadQuestions } from "./loaders.js";
import { findProjectRoot } from "./project-root.js";
import {
  effectiveDistractorMode,
  loadQualityConfig,
} from "./quality-config.js";
import {
  type AddQuestionInput,
  buildQuestionPayload,
  normalizeExpectedInput,
} from "./question-payload.js";
import { QuestionSchema, type Question, type Skill } from "./schemas.js";
import { assertSkillExists, loadSkill } from "./skills.js";

export type ValidateIssueSeverity = "error" | "finding";

export interface ValidateIssue {
  code: string;
  message: string;
  severity: ValidateIssueSeverity;
}

export interface ValidateQuestionResult {
  ok: boolean;
  projectRoot: string;
  skill: Skill;
  /** Parsed question when structural parse succeeded (may still have policy issues). */
  question?: Question;
  errors: ValidateIssue[];
  findings: ValidateIssue[];
}

function pushIssue(
  target: ValidateIssue[],
  code: string,
  message: string,
  severity: ValidateIssueSeverity,
): void {
  target.push({ code, message, severity });
}

function assertChoiceShape(input: AddQuestionInput): string | null {
  if (input.type === "single_choice" || input.type === "multi_choice") {
    if (!input.options || input.options.length < 2) {
      return `Type ${input.type} requires at least two options`;
    }
    if (input.correct === undefined) {
      return `Type ${input.type} requires correct (1-based option index)`;
    }
    const corrects = Array.isArray(input.correct) ? input.correct : [input.correct];
    for (const c of corrects) {
      if (!Number.isInteger(c) || c < 1 || c > input.options.length) {
        return `correct ${c} is out of range for ${input.options.length} options (1-based)`;
      }
    }
    if (input.type === "single_choice" && corrects.length !== 1) {
      return "single_choice requires exactly one correct index";
    }
  }
  return null;
}

function assertExpectedShape(input: AddQuestionInput): string | null {
  if (input.expected === undefined) return null;
  if (input.type !== "open") {
    return `--expected is only allowed for type open (got ${input.type})`;
  }
  return null;
}

/**
 * Dry-run validation of a question draft (no file writes).
 */
export function validateQuestionDraft(
  projectRoot: string,
  input: AddQuestionInput,
  options?: { excludeQuestionId?: string },
): ValidateQuestionResult {
  const errors: ValidateIssue[] = [];
  const findings: ValidateIssue[] = [];

  try {
    assertSkillExists(projectRoot, input.skill);
  } catch (err) {
    if (err instanceof SdmError) {
      throw err;
    }
    throw err;
  }

  const skill = loadSkill(projectRoot, input.skill);
  const quality = loadQualityConfig(projectRoot);
  const writeGate = quality.writeGate;
  const distractorMode = effectiveDistractorMode(quality);

  const choiceErr = assertChoiceShape(input);
  if (choiceErr) {
    pushIssue(errors, "VALIDATION_FAILED", choiceErr, "error");
  }
  const expectedErr = assertExpectedShape(input);
  if (expectedErr) {
    pushIssue(errors, "VALIDATION_FAILED", expectedErr, "error");
  }

  const id = input.id?.trim() || "draft";
  let question: Question | undefined;
  if (errors.length === 0) {
    try {
      const payload = buildQuestionPayload(input, id);
      if (input.expected !== undefined && input.type === "open") {
        (payload as Record<string, unknown>).expected = normalizeExpectedInput(
          input.expected,
        );
      }
      question = QuestionSchema.parse(payload);
    } catch (err) {
      if (err instanceof ZodError) {
        pushIssue(
          errors,
          "VALIDATION_FAILED",
          err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
          "error",
        );
      } else {
        throw err;
      }
    }
  }

  if (question) {
    // Topic membership (writeGate soft/strict)
    if (writeGate !== "off" && skill.topics.length > 0 && question.topics.length > 0) {
      const allowed = new Set(skill.topics);
      const invalid = question.topics.filter((t) => !allowed.has(t));
      if (invalid.length > 0) {
        const msg = `Topics not on skill ${skill.id}: ${invalid.join(", ")}. Allowed: ${skill.topics.join(", ")}`;
        if (writeGate === "strict") {
          pushIssue(errors, "TOPIC_NOT_ON_SKILL", msg, "error");
        } else {
          pushIssue(findings, "TOPIC_NOT_ON_SKILL", msg, "finding");
        }
      }
    }

    // Explanation required
    if (
      quality.requireExplanation &&
      writeGate !== "off" &&
      (!question.explanation || !question.explanation.trim())
    ) {
      const msg = "Explanation is required (quality.requireExplanation)";
      if (writeGate === "strict") {
        pushIssue(errors, "EXPLANATION_REQUIRED", msg, "error");
      } else {
        pushIssue(findings, "EXPLANATION_REQUIRED", msg, "finding");
      }
    }

    // Probe fields (open/code) — advisory findings; kit-readiness warnings enforce export quality
    if (question.type === "open" || question.type === "code") {
      if (!question.evidence) {
        pushIssue(
          findings,
          "PROBE_EVIDENCE_MISSING",
          "Probe questions should declare evidence (knowledge | skill | artifact)",
          "finding",
        );
      }
      if (!question.rubric || question.rubric.length === 0) {
        pushIssue(
          findings,
          "PROBE_RUBRIC_MISSING",
          "Probe questions should include rubric rows (--rubric 0:…)",
          "finding",
        );
      }
    }

    // Near-duplicate
    if (writeGate !== "off") {
      const { questions } = loadQuestions(projectRoot);
      const peers = questions.filter(
        (q) =>
          q.skill === question!.skill &&
          q.id !== options?.excludeQuestionId &&
          q.id !== question!.id,
      );
      let best: { id: string; similarity: number } | undefined;
      for (const peer of peers) {
        const similarity = jaccardSimilarity(question.text, peer.text);
        if (
          similarity >= quality.nearDupThreshold &&
          (!best || similarity > best.similarity)
        ) {
          best = { id: peer.id, similarity: Number(similarity.toFixed(3)) };
        }
      }
      if (best) {
        const msg = `Near-duplicate of ${best.id} (similarity ${best.similarity} ≥ ${quality.nearDupThreshold})`;
        if (writeGate === "strict") {
          pushIssue(errors, "QUESTION_NEAR_DUPLICATE", msg, "error");
        } else {
          pushIssue(findings, "QUESTION_NEAR_DUPLICATE", msg, "finding");
        }
      }
    }

    // Distractor length
    if (
      distractorMode !== "off" &&
      (question.type === "single_choice" || question.type === "multi_choice")
    ) {
      const length = evaluateOptionLengthQuality(question, quality.lengthBandRatio);
      if (!length.ok) {
        const msg = `Distractor quality failed: ${length.reasons.join("; ")}`;
        if (distractorMode === "strict") {
          pushIssue(errors, "DISTRACTOR_QUALITY", msg, "error");
        } else {
          pushIssue(findings, "DISTRACTOR_QUALITY", msg, "finding");
        }
      }
    }
  }

  return {
    ok: errors.length === 0,
    projectRoot,
    skill,
    question,
    errors,
    findings,
  };
}

export interface ValidateQuestionOptions {
  startDir: string;
  input: AddQuestionInput;
  excludeQuestionId?: string;
}

/** CLI/MCP entry: resolve project root then validate. */
export function validateQuestion(options: ValidateQuestionOptions): ValidateQuestionResult {
  const projectRoot = findProjectRoot(options.startDir);
  return validateQuestionDraft(projectRoot, options.input, {
    excludeQuestionId: options.excludeQuestionId,
  });
}

/** Throw first blocking error as SdmError (for write-path strict). */
export function throwIfValidateErrors(result: ValidateQuestionResult): void {
  if (result.errors.length === 0) return;
  const first = result.errors[0]!;
  throw new SdmError(first.code, first.message);
}

export interface DeepValidateIssue {
  questionId: string;
  skill: string;
  code: string;
  message: string;
  severity: "error" | "finding";
}

export interface DeepValidateQuestionResult {
  projectRoot: string;
  total: number;
  issues: DeepValidateIssue[];
  ok: boolean;
  /** Summary: count of questions per difficulty label. */
  difficultySummary: Record<string, number>;
  /** Count of questions lacking rubric (open/code). */
  rubricMissingCount: number;
}

/** Map difficulty 0..1 to a human label. */
export function difficultyLabel(d: number): string {
  if (d <= 0) return "unknown";
  if (d < 0.35) return "easy";
  if (d < 0.65) return "medium";
  return "hard";
}

/**
 * Deep validation over the whole question library: checks consistency
 * between type and payload that per-draft validate cannot see — e.g.
 * `single_choice`/`multi_choice` without `options`, `open` without
 * `expected`/`rubric`, explanations that merely restate the correct option.
 */
export function validateQuestionLibraryDeep(
  projectRoot: string,
): DeepValidateQuestionResult {
  const { questions } = loadQuestions(projectRoot);
  const issues: DeepValidateIssue[] = [];

  for (const q of questions) {
    const isChoice = q.type === "single_choice" || q.type === "multi_choice";
    const isProbe = q.type === "open" || q.type === "code";

    if ((q.type === "single_choice" || q.type === "multi_choice") && (!q.options || q.options.length < 2)) {
      issues.push({
        questionId: q.id,
        skill: q.skill,
        code: "SINGLE_CHOICE_NO_OPTIONS",
        message: `Question "${q.id}" claims type ${q.type} but has no options (need ≥2).`,
        severity: "error",
      });
    }

    if (isChoice && q.correct === undefined) {
      issues.push({
        questionId: q.id,
        skill: q.skill,
        code: "CHOICE_NO_CORRECT",
        message: `Question "${q.id}" (${q.type}) has no correct index.`,
        severity: "error",
      });
    }

    if (q.type === "open" && (!q.expected || q.expected.length === 0)) {
      issues.push({
        questionId: q.id,
        skill: q.skill,
        code: "OPEN_NO_EXPECTED",
        message: `Open question "${q.id}" has no expected answer.`,
        severity: "finding",
      });
    }

    if (isProbe && (!q.rubric || q.rubric.length === 0)) {
      issues.push({
        questionId: q.id,
        skill: q.skill,
        code: "PROBE_RUBRIC_MISSING",
        message: `Probe question "${q.id}" has no rubric rows. Add --rubric 0:… 1:… 2:… 3:…`,
        severity: "finding",
      });
    }

    if (q.explanation && q.options && q.correct !== undefined) {
      const correctIdx = Array.isArray(q.correct) ? q.correct[0] : q.correct;
      const correctText = q.options[correctIdx - 1];
      if (
        correctText &&
        q.explanation.trim().toLowerCase() === correctText.trim().toLowerCase()
      ) {
        issues.push({
          questionId: q.id,
          skill: q.skill,
          code: "EXPLANATION_RESTATES_ANSWER",
          message: `Question "${q.id}" explanation merely restates the correct option. Explain why, not what.`,
          severity: "finding",
        });
      }
    }
  }

  const difficultySummary: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
  let rubricMissingCount = 0;
  for (const q of questions) {
    const label = difficultyLabel(q.difficulty);
    difficultySummary[label] = (difficultySummary[label] ?? 0) + 1;
    if ((q.type === "open" || q.type === "code") && (!q.rubric || q.rubric.length === 0)) {
      rubricMissingCount += 1;
    }
  }

  return {
    projectRoot,
    total: questions.length,
    issues,
    ok: issues.every((i) => i.severity !== "error"),
    difficultySummary,
    rubricMissingCount,
  };
}
