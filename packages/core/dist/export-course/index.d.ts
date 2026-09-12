export { EXPORT_COURSE_SCHEMA, COURSE_DEPTHS, COURSE_FORMATS, COURSE_LAYOUTS, COURSE_WARNING_CODES, SKILL_DESCRIPTION_MIN_CHARS, COURSE_MODULE_KINDS, COURSE_OVERVIEW_SKILL_ID, type CourseDepth, type CourseFormat, type CourseLayout, type CourseModuleKind, type CourseWarningCode, type CourseWarning, type CourseContentControls, type QuestionAnchor, type TeachingSkillView, type TeachingContext, type CourseLessonStub, type CourseModule, type CourseGlossaryEntry, type CourseFootnote, type ExportCourseDocument, type CourseScopeMeta, type ExportCourseOptions, type ExportCourseRun, } from "./types.js";
export { parseCourseDepth, parseCourseFormat, resolveCourseFormat, layoutForFormat, } from "./types.js";
export { buildOverviewModule, buildLessonStubs, mergeTopicLabels, seedGlossaryFromTopics, orderSkillsByDepends, } from "./lessons.js";
export { detectProseLocaleMixed, detectTruncation, collectProseLocaleWarnings, collectLearningWarnings, isCriticalWarning, TRUNCATION_WARNING_CODE, collectGlossaryMissingTerms, collectDuplicateLessons, type CollectLearningWarningsInput, } from "./warnings.js";
export { resolveScope, shouldIncludeOverviewModule } from "./scopes.js";
export type { ResolvedScope } from "./scopes.js";
export { extractTopicsFromModules, mergeTopicsIntoSkill, suggestDescriptionFromModules, } from "./enrichment.js";
export { assertCourseContextReady } from "./course-gate.js";
export { exportCourse } from "./orchestrator.js";
//# sourceMappingURL=index.d.ts.map