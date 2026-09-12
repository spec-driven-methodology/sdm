import { SdmError } from "./errors.js";
export const EXPORT_QUESTION_TYPES = [
    "single_choice",
    "multi_choice",
    "open",
    "code",
];
function normalizeTypeList(raw) {
    if (!raw?.length)
        return [];
    return raw.map((t) => t.trim()).filter(Boolean);
}
function parseType(raw) {
    if (EXPORT_QUESTION_TYPES.includes(raw)) {
        return raw;
    }
    throw new SdmError("EXPORT_TYPE_INVALID", `Invalid question type "${raw}". Use: ${EXPORT_QUESTION_TYPES.join(", ")}. Short text answers use type "open" (not "text").`);
}
/**
 * Resolve include XOR exclude type filter. Empty/undefined → no filter.
 */
export function resolveExportTypeFilter(input) {
    const includeRaw = normalizeTypeList(input.includeTypes);
    const excludeRaw = normalizeTypeList(input.excludeTypes);
    if (includeRaw.length > 0 && excludeRaw.length > 0) {
        throw new SdmError("EXPORT_TYPE_FILTER_CONFLICT", "Pass either includeTypes / --include-type or excludeTypes / --exclude-type, not both.");
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
export function applyExportTypeFilter(questions, filter) {
    if (!filter)
        return questions;
    const set = new Set(filter.types);
    if (filter.mode === "include") {
        return questions.filter((q) => set.has(q.type));
    }
    return questions.filter((q) => !set.has(q.type));
}
//# sourceMappingURL=export-type-filter.js.map