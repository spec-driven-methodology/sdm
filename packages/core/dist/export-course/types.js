import { SdmError } from "../errors.js";
export const EXPORT_COURSE_SCHEMA = "sdm.export.course/v1";
export const COURSE_DEPTHS = ["brief", "standard", "detailed"];
export const COURSE_FORMATS = [
    "howto",
    "notes",
    "cheatsheet",
    "course",
];
/** Layout hint for agent prose: one document vs modular lessons. */
export const COURSE_LAYOUTS = ["single_doc", "modular_course"];
export const COURSE_WARNING_CODES = [
    "SKILL_DESCRIPTION_THIN",
    "SKILL_TOPICS_EMPTY",
    "TOPIC_UNCOVERED_BY_QUESTIONS",
    "GRAPH_ISOLATED_IN_SCOPE",
    "GRAPH_CYCLE_FALLBACK",
    "PRACTICE_THIN",
    "PRACTICE_MONO_TYPE",
    "PRACTICE_EMPTY",
    "QUESTION_EXPLANATION_MISSING",
    "FORMAT_CONCEPT_DEPRECATED",
    "PROSE_LOCALE_MIXED",
    "LESSON_TRUNCATED",
    "GLOSSARY_TAUTOLOGY",
    "GLOSSARY_MISSING_TERM",
    "LESSON_DUPLICATE",
];
/** Description shorter than this (trimmed) is considered thin for teaching. */
export const SKILL_DESCRIPTION_MIN_CHARS = 40;
export const COURSE_MODULE_KINDS = ["overview", "skill"];
/** Synthetic skill id for the leading overview module (not an ontology skill). */
export const COURSE_OVERVIEW_SKILL_ID = "course-overview";
export function parseCourseDepth(value) {
    const v = (value ?? "standard").toLowerCase();
    if (COURSE_DEPTHS.includes(v)) {
        return v;
    }
    throw new SdmError("COURSE_DEPTH_INVALID", `Invalid course depth "${value}". Use brief, standard, or detailed.`);
}
export function resolveCourseFormat(value) {
    const v = (value ?? "howto").toLowerCase();
    if (v === "concept") {
        return { format: "notes", deprecatedConcept: true };
    }
    if (COURSE_FORMATS.includes(v)) {
        return { format: v, deprecatedConcept: false };
    }
    throw new SdmError("COURSE_FORMAT_INVALID", `Invalid course format "${value}". Use howto, notes, cheatsheet, or course.`);
}
export function parseCourseFormat(value) {
    return resolveCourseFormat(value).format;
}
export function layoutForFormat(format) {
    return format === "course" ? "modular_course" : "single_doc";
}
//# sourceMappingURL=types.js.map