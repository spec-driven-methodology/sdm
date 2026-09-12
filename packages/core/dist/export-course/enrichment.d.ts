import type { CourseModule } from "./types.js";
/**
 * Reverse topic extraction: after lessons are generated, collect the topic
 * slugs used by `lessons[].topic` (and question-derived topics) for a module.
 * These are the topics the course actually teaches — distinct from what
 * `skill.topics` declared. Back-filling them closes SKILL_TOPICS_EMPTY.
 */
export declare function extractTopicsFromModules(modules: CourseModule[]): Map<string, string[]>;
/**
 * Merge course-extracted topics into declared skill topics (union, dedupe).
 * Never removes existing topics — only adds ones the course actually teaches.
 */
export declare function mergeTopicsIntoSkill(declared: string[], courseTopics: string[]): string[];
/**
 * Suggest a skill description from lesson content.
 * Builds a summary sentence from lesson titles and the first non-empty
 * paragraph of each lesson. For SKILL_DESCRIPTION_THIN auto-fix.
 */
export declare function suggestDescriptionFromModules(modules: CourseModule[], skillId: string): string | undefined;
//# sourceMappingURL=enrichment.d.ts.map