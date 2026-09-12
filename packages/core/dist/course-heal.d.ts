import type { CourseModule, CourseWarning } from "./export-course/types.js";
export interface HealCourseResult {
    /** Skill ids whose topics were back-filled from course lesson topics. */
    backfilledTopics: string[];
    /** Skill ids whose description was suggested from lesson content. */
    suggestedDescriptions: string[];
    /** Topic YAML files created in library/topics (registry sync). */
    registryCreated: string[];
}
/**
 * Deterministic auto-heal for common course-gate warnings. Works on the
 * *filled* pack (lesson bodies present) and mutates the methodology:
 *
 * 1. Registry sync: create library/topics YAML for every skill topic.
 * 2. Back-fill: for each skill module, union lesson topic slugs into
 *    `skill.topics` (closes SKILL_TOPICS_EMPTY / TOPIC_UNCOVERED_BY_QUESTIONS).
 * 3. Description: when a skill description is thin, suggest one from lesson
 *    titles + first paragraphs (closes SKILL_DESCRIPTION_THIN).
 *
 * Returns a report of what changed. Does NOT re-export; caller re-runs export
 * to confirm warnings shrank.
 */
export declare function healCourseWarnings(input: {
    projectRoot: string;
    modules: CourseModule[];
    warnings: CourseWarning[];
}): HealCourseResult;
//# sourceMappingURL=course-heal.d.ts.map