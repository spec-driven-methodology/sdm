import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { SdmError } from "./errors.js";
import { loadQuestions } from "./loaders.js";
import { TopicSchema, type Topic } from "./schemas.js";
import { loadAllSkills, skillFilePath } from "./skills.js";
import { readYamlFile, writeYamlFile } from "./yaml.js";
import type { CourseModule } from "./export-course/types.js";

function topicFilePath(projectRoot: string, slug: string): string {
  return join(projectRoot, "library", "topics", `${slug}.yaml`);
}

function topicsDir(projectRoot: string): string {
  return join(projectRoot, "library", "topics");
}

function listYamlFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map((f) => join(dir, f));
}

/** Load all topic YAMLs from library/topics/. */
export function loadTopics(projectRoot: string): Topic[] {
  const dir = topicsDir(projectRoot);
  if (!existsSync(dir)) return [];
  const topics: Topic[] = [];
  for (const file of listYamlFiles(dir)) {
    try {
      const parsed = TopicSchema.parse(readYamlFile(file));
      topics.push(parsed);
    } catch {
      // skip invalid
    }
  }
  return topics.sort((a, b) => a.id.localeCompare(b.id));
}

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
export function buildTopicRegistry(
  projectRoot: string,
  courseModules?: CourseModule[],
): TopicRegistryIndex {
  const registered = new Map<string, Topic>(
    loadTopics(projectRoot).map((t) => [t.id, t]),
  );
  const registeredSlugs = new Set(registered.keys());
  const skills = loadAllSkills(projectRoot);
  const { questions } = loadQuestions(projectRoot);

  const allSkillTopics = new Set<string>();
  for (const s of skills) {
    for (const t of s.topics) allSkillTopics.add(t);
  }

  const allQuestionTopics = new Set<string>();
  for (const q of questions) for (const t of q.topics) allQuestionTopics.add(t);

  const allCourseTopics = new Set<string>();
  if (courseModules) {
    for (const mod of courseModules) {
      if (mod.kind === "overview") continue;
      for (const lesson of mod.lessons) {
        if (lesson.topic) allCourseTopics.add(lesson.topic);
      }
    }
  }

  const unregisteredFromSkills = [...allSkillTopics].filter(
    (t) => !registeredSlugs.has(t),
  );
  const orphanQuestionTopics = [...allQuestionTopics].filter(
    (t) => !registeredSlugs.has(t) && !allSkillTopics.has(t),
  );
  const unregisteredFromCourses = [...allCourseTopics].filter(
    (t) => !registeredSlugs.has(t) && !allSkillTopics.has(t),
  );

  const used = new Set<string>([...allSkillTopics, ...allQuestionTopics]);
  const unused = [...registeredSlugs].filter((t) => !used.has(t));

  return {
    registered,
    unregisteredFromSkills,
    orphanQuestionTopics,
    unregisteredFromCourses,
    unused,
  };
}

/**
 * Auto-create topic YAML files for every slug found in skill.topics that
 * has no corresponding file yet. Skips existing entries. Returns created slugs.
 */
export function syncTopicRegistryFromSkills(projectRoot: string): string[] {
  const existing = new Map(loadTopics(projectRoot).map((t) => [t.id, t]));
  const skills = loadAllSkills(projectRoot);
  const created: string[] = [];

  const dir = topicsDir(projectRoot);
  mkdirSync(dir, { recursive: true });

  for (const s of skills) {
    for (const topicSlug of s.topics) {
      if (existing.has(topicSlug)) continue;
      const label = s.topic_labels?.[topicSlug]?.trim() ?? topicSlug;
      const topic: Topic = {
        id: topicSlug,
        label,
        definition: "",
        aliases: label !== topicSlug ? [label] : [],
        skills: [s.id],
      };
      writeYamlFile(topicFilePath(projectRoot, topicSlug), topic);
      existing.set(topicSlug, topic);
      created.push(topicSlug);
    }
  }

  return created;
}

/** Validate and add a single topic entry (like term-add pattern). */
export interface AddTopicInput {
  id: string;
  label?: string;
  definition?: string;
  aliases?: string[];
  skills?: string[];
  force?: boolean;
}

export function addTopic(projectRoot: string, input: AddTopicInput): Topic {
  const id = input.id.trim();
  if (!id) {
    throw new SdmError("VALIDATION_FAILED", "Topic id (slug) must not be empty");
  }
  const path = topicFilePath(projectRoot, id);
  if (existsSync(path) && !input.force) {
    throw new SdmError(
      "TOPIC_EXISTS",
      `Topic "${id}" already exists at ${path}. Use --force.`,
    );
  }
  const topic: Topic = {
    id,
    label: input.label?.trim() ?? id,
    definition: input.definition?.trim() ?? "",
    aliases: (input.aliases ?? []).map((a) => a.trim()).filter(Boolean),
    skills: (input.skills ?? []).map((s) => s.trim()).filter(Boolean),
  };
  TopicSchema.parse(topic);
  const dir = topicsDir(projectRoot);
  mkdirSync(dir, { recursive: true });
  writeYamlFile(path, topic);
  return topic;
}

/**
 * Merge topic labels from the registry into all skill YAMLs.
 * For every topic declared in the registry with a non-empty label that differs
 * from the topic slug, updates `skill.topic_labels[topicSlug] = label`.
 * Returns the count of updated skills.
 */
export function mergeRegistryLabelsIntoSkills(projectRoot: string): number {
  const topics = loadTopics(projectRoot);
  const labelMap = new Map<string, string>();
  for (const t of topics) {
    if (t.label && t.label !== t.id) labelMap.set(t.id, t.label);
  }
  if (labelMap.size === 0) return 0;

  const skills = loadAllSkills(projectRoot);
  let updated = 0;
  for (const s of skills) {
    let labels = s.topic_labels ?? {};
    let changed = false;
    for (const [slug, label] of labelMap) {
      if (s.topics.includes(slug) && labels[slug] !== label) {
        labels = { ...labels, [slug]: label };
        changed = true;
      }
    }
    if (changed) {
      const path = skillFilePath(projectRoot, s.id);
      const doc = readYamlFile(path) as Record<string, unknown>;
      writeYamlFile(path, { ...doc, topic_labels: labels });
      updated++;
    }
  }
  return updated;
}