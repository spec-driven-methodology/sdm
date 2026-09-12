import { type Topic } from "./schemas.js";
import type { CourseModule } from "./export-course/types.js";
/** Load all topic YAMLs from library/topics/. */
export declare function loadTopics(projectRoot: string): Topic[];
export interface TopicRegistryIndex {
    /** Topics from library/topics/ YAML files (canonical). */
    registered: Map<string, Topic>;
    /** Topic slugs declared in skill.topics but missing from YAML. */
    unregisteredFromSkills: string[];
    /** Topic slugs used in question.topics but missing from skills AND YAML. */
    orphanQuestionTopics: string[];
    /** Topic slugs used in course lessons but not in registry. */
    unregisteredFromCourses: string[];
    /** Registered topics that no skill or question uses. */
    unused: string[];
}
/**
 * Build a complete topic registry index: load YAML, scan skills, questions,
 * and optionally course modules. Returns everything needed to reconcile.
 */
export declare function buildTopicRegistry(projectRoot: string, courseModules?: CourseModule[]): TopicRegistryIndex;
/**
 * Auto-create topic YAML files for every slug found in skill.topics that
 * has no corresponding file yet. Skips existing entries. Returns created slugs.
 */
export declare function syncTopicRegistryFromSkills(projectRoot: string): string[];
/** Validate and add a single topic entry (like term-add pattern). */
export interface AddTopicInput {
    id: string;
    label?: string;
    definition?: string;
    aliases?: string[];
    skills?: string[];
    force?: boolean;
}
export declare function addTopic(projectRoot: string, input: AddTopicInput): Topic;
/**
 * Merge topic labels from the registry into all skill YAMLs.
 * For every topic declared in the registry with a non-empty label that differs
 * from the topic slug, updates `skill.topic_labels[topicSlug] = label`.
 * Returns the count of updated skills.
 */
export declare function mergeRegistryLabelsIntoSkills(projectRoot: string): number;
//# sourceMappingURL=topic-registry.d.ts.map