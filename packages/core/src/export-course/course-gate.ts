import { SdmError } from "../errors.js";
import { loadQualityConfig } from "../quality-config.js";
import type { CourseWarning } from "./types.js";
import { isCriticalWarning } from "./warnings.js";

export type CourseGateMode = "off" | "soft" | "strict";

/**
 * Codes that become blocking errors under `courseGate: strict`.
 * Others remain warnings. Includes readiness (thin/empty), coverage
 * (uncovered topics), structure (isolated skill), and quality (truncated
 * lessons, tautological glossary).
 */
export const COURSE_GATE_ERROR_CODES = new Set([
  "SKILL_DESCRIPTION_THIN",
  "SKILL_TOPICS_EMPTY",
  "TOPIC_UNCOVERED_BY_QUESTIONS",
  "GRAPH_ISOLATED_IN_SCOPE",
  "GRAPH_CYCLE_FALLBACK",
  "PRACTICE_EMPTY",
  "PRACTICE_THIN",
  "QUESTION_EXPLANATION_MISSING",
  "LESSON_TRUNCATED",
  "GLOSSARY_TAUTOLOGY",
]);

export interface CourseGateBlockedError extends SdmError {
  code: "COURSE_GATE_BLOCKED";
  /** Machine-readable warning details for the agent/auto-heal loop. */
  details: Array<{ code: string; skill?: string; topic?: string; message: string }>;
}

function buildGateError(blocking: CourseWarning[]): CourseGateBlockedError {
  const details = blocking.map((w) => ({
    code: w.code,
    skill: w.skill,
    topic: w.topic,
    message: w.message,
  }));
  const lines = blocking.map(
    (w) =>
      `  [${w.code}]${w.skill ? ` skill="${w.skill}"` : ""}${w.topic ? ` topic="${w.topic}"` : ""} — ${w.message}`,
  );
  const err = new SdmError(
    "COURSE_GATE_BLOCKED",
    `Course gate (strict) blocked export:\n${lines.join("\n")}\n\nRun \`sdm course heal\` to auto-fix, or set quality.courseGate to "soft" or "off".`,
  ) as CourseGateBlockedError;
  err.details = details;
  return err;
}

/**
 * Apply the course readiness gate based on quality config.
 *
 * - `strictContext` CLI flag: fail when depth=detailed and critical warnings exist
 *   (thin description / empty topics) — legacy PoC path.
 * - `courseGate` in sdm.yaml quality section extends the same concept to
 *   all COURSE_GATE_ERROR_CODES, regardless of depth.
 *
 * When the gate fires, the export is rejected with a SdmError carrying
 * machine-readable `details` so the agent/author can auto-heal (course heal).
 */
export function assertCourseContextReady(input: {
  projectRoot: string;
  strictContext: boolean;
  depth: string;
  warnings: CourseWarning[];
}): void {
  // Legacy --strict-context flag (depth=detailed only)
  if (input.strictContext && input.depth === "detailed") {
    const critical = input.warnings.filter(isCriticalWarning);
    if (critical.length > 0) {
      const codes = [...new Set(critical.map((w) => w.code))].join(", ");
      throw new SdmError(
        "COURSE_CONTEXT_THIN",
        `TeachingContext too thin for depth=detailed under --strict-context (${codes}). Enrich skill description/topics first.`,
      );
    }
  }

  // courseGate from quality config
  const quality = loadQualityConfig(input.projectRoot);
  const courseGate: CourseGateMode =
    (quality as Record<string, unknown>).courseGate as CourseGateMode ?? "off";
  if (courseGate !== "strict") return;

  const blocking = input.warnings.filter((w) =>
    COURSE_GATE_ERROR_CODES.has(w.code),
  );
  if (blocking.length === 0) return;

  throw buildGateError(blocking);
}