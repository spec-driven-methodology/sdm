import { SdmError } from "./errors.js";
import type { Question } from "./schemas.js";

export const EXPORT_QUESTION_TYPES = [
  "single_choice",
  "multi_choice",
  "open",
  "code",
] as const;

export type ExportQuestionType = (typeof EXPORT_QUESTION_TYPES)[number];

export type ExportTypeFilterMode = "include" | "exclude";

export interface ExportTypeFilter {
  mode: ExportTypeFilterMode;
  types: ExportQuestionType[];
}

export interface ResolveExportTypeFilterInput {
  includeTypes?: string[];
  excludeTypes?: string[];
}

function normalizeTypeList(raw: string[] | undefined): string[] {
  if (!raw?.length) return [];
  return raw.map((t) => t.trim()).filter(Boolean);
}

function parseType(raw: string): ExportQuestionType {
  if ((EXPORT_QUESTION_TYPES as readonly string[]).includes(raw)) {
    return raw as ExportQuestionType;
  }
  throw new SdmError(
    "EXPORT_TYPE_INVALID",
    `Invalid question type "${raw}". Use: ${EXPORT_QUESTION_TYPES.join(", ")}. Short text answers use type "open" (not "text").`,
  );
}

/**
 * Resolve include XOR exclude type filter. Empty/undefined → no filter.
 */
export function resolveExportTypeFilter(
  input: ResolveExportTypeFilterInput,
): ExportTypeFilter | undefined {
  const includeRaw = normalizeTypeList(input.includeTypes);
  const excludeRaw = normalizeTypeList(input.excludeTypes);

  if (includeRaw.length > 0 && excludeRaw.length > 0) {
    throw new SdmError(
      "EXPORT_TYPE_FILTER_CONFLICT",
      "Pass either includeTypes / --include-type or excludeTypes / --exclude-type, not both.",
    );
  }

  if (includeRaw.length === 0 && excludeRaw.length === 0) {
    return undefined;
  }

  if (includeRaw.length > 0) {
    const types = [...new Set(includeRaw.map(parseType))];
    return { mode: "include", types };
  }

  const types = [...new Set(excludeRaw.map(parseType))];
  return { mode: "exclude", types };
}

export function applyExportTypeFilter(
  questions: Question[],
  filter: ExportTypeFilter | undefined,
): Question[] {
  if (!filter) return questions;
  const set = new Set<string>(filter.types);
  if (filter.mode === "include") {
    return questions.filter((q) => set.has(q.type));
  }
  return questions.filter((q) => !set.has(q.type));
}
