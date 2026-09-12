import type { Question, Skill } from "../schemas.js";
import type { SkillGraph } from "../skill-graph.js";
import { type CourseFormat, type CourseGlossaryEntry, type CourseLessonStub, type CourseModule } from "./types.js";
/**
 * Leading overview stubs for level-scoped `format=course` packs.
 * Bodies stay empty for the agent; titles are Russian learner-facing labels.
 */
export declare function buildOverviewModule(): CourseModule;
/**
 * Build lesson stubs. `title` resolves topic slugs through `topic_labels`
 * (learner-facing), while `id`/`topic` keep the raw slug (stable identity).
 * Question-derived topics outside `skill.topics` are included when labelled.
 */
export declare function buildLessonStubs(skill: Skill, questions: Question[], format: CourseFormat, scopedTopic?: string): CourseLessonStub[];
/**
 * Merge topic_labels across scoped skills (first skill wins on collisions),
 * so glossary seeding can humanize slugs from any skill in scope.
 */
export declare function mergeTopicLabels(skills: Array<{
    topic_labels?: Record<string, string>;
}>): Record<string, string>;
/**
 * Seed glossary terms from TeachingContext topics (empty definitions).
 * `term` stays the topic slug (stable identity + body-text matching);
 * the learner-facing label from `labels` is attached as an `alias` when
 * present, so consumers can display a human title without losing matching.
 */
export declare function seedGlossaryFromTopics(topics: string[], labels?: Record<string, string>): CourseGlossaryEntry[];
/**
 * Topological order by depends_on among `skillIds`.
 * On cycle: alpha-sorted order + cycleDetected=true.
 */
export declare function orderSkillsByDepends(skillIds: string[], graph: SkillGraph): {
    ordered: string[];
    cycleFallback: boolean;
};
//# sourceMappingURL=lessons.d.ts.map