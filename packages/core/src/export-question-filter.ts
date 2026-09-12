import { SdmError } from "./errors.js";
import type { Question } from "./schemas.js";

export interface ExportQuestionFilter {
  mode: "include";
  ids: string[];
}

export interface ResolveExportQuestionFilterInput {
  includeQuestions?: string[];
}

function normalizeIdList(raw: string[] | undefined): string[] {
  if (!raw?.length) return [];
  return [...new Set(raw.map((id) => id.trim()).filter(Boolean))];
}

/**
 * Resolve question-id allowlist. Empty/undefined → no filter.
 */
export function resolveExportQuestionFilter(
  input: ResolveExportQuestionFilterInput,
): ExportQuestionFilter | undefined {
  const ids = normalizeIdList(input.includeQuestions);
  if (ids.length === 0) return undefined;
  return { mode: "include", ids };
}

/**
 * Keep only allowlisted question ids. Hard-fail if any requested id is missing
 * from the current candidate set.
 */
export function applyExportQuestionFilter(
  questions: Question[],
  filter: ExportQuestionFilter | undefined,
): Question[] {
  if (!filter) return questions;

  const byId = new Map(questions.map((q) => [q.id, q]));
  const missing = filter.ids.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    throw new SdmError(
      "EXPORT_QUESTION_NOT_FOUND",
      `Question id(s) not in export candidates after prior filters: ${missing.join(", ")}`,
    );
  }

  const selected = filter.ids.map((id) => byId.get(id)!);
  return selected.sort((a, b) => {
    const bySkill = a.skill.localeCompare(b.skill);
    if (bySkill !== 0) return bySkill;
    return a.id.localeCompare(b.id);
  });
}
