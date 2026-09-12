import type { Question, Skill } from "../schemas.js";
import type { SkillGraph } from "../skill-graph.js";
import { detectCycles } from "../skill-graph.js";
import {
  COURSE_OVERVIEW_SKILL_ID,
  layoutForFormat,
  type CourseFormat,
  type CourseGlossaryEntry,
  type CourseLessonStub,
  type CourseModule,
} from "./types.js";

/**
 * Leading overview stubs for level-scoped `format=course` packs.
 * Bodies stay empty for the agent; titles are Russian learner-facing labels.
 */
export function buildOverviewModule(): CourseModule {
  const lessons: CourseLessonStub[] = [
    {
      id: `${COURSE_OVERVIEW_SKILL_ID}--about`,
      topic: "about",
      title: "Что это за курс",
      body: "",
    },
    {
      id: `${COURSE_OVERVIEW_SKILL_ID}--how-it-works`,
      topic: "how-it-works",
      title: "Как устроен курс",
      body: "",
    },
    {
      id: `${COURSE_OVERVIEW_SKILL_ID}--audience`,
      topic: "audience",
      title: "Для кого",
      body: "",
    },
    {
      id: `${COURSE_OVERVIEW_SKILL_ID}--out-of-scope`,
      topic: "out-of-scope",
      title: "Что не входит",
      body: "",
    },
  ];
  return {
    kind: "overview",
    skill: COURSE_OVERVIEW_SKILL_ID,
    title: "О курсе",
    lessons,
    practiceQuestionIds: [],
  };
}

/**
 * Build lesson stubs. `title` resolves topic slugs through `topic_labels`
 * (learner-facing), while `id`/`topic` keep the raw slug (stable identity).
 * Question-derived topics outside `skill.topics` are included when labelled.
 */
export function buildLessonStubs(
  skill: Skill,
  questions: Question[],
  format: CourseFormat,
  scopedTopic?: string,
): CourseLessonStub[] {
  const labelFor = (topic: string): string =>
    skill.topic_labels[topic]?.trim() || topic;
  if (layoutForFormat(format) === "single_doc") {
    if (scopedTopic) {
      return [
        {
          id: `${skill.id}--${scopedTopic}`,
          topic: scopedTopic,
          title: labelFor(scopedTopic),
          body: "",
        },
      ];
    }
    return [
      {
        id: `${skill.id}--overview`,
        title: skill.name,
        body: "",
      },
    ];
  }

  const topicSet = new Set<string>(skill.topics);
  for (const q of questions) {
    for (const t of q.topics) topicSet.add(t);
  }
  const topics = [...topicSet].sort((a, b) => a.localeCompare(b));
  if (topics.length === 0) {
    return [
      {
        id: `${skill.id}--overview`,
        title: skill.name,
        body: "",
      },
    ];
  }
  return topics.map((topic) => ({
    id: `${skill.id}--${topic}`,
    topic,
    title: labelFor(topic),
    body: "",
  }));
}

/**
 * Merge topic_labels across scoped skills (first skill wins on collisions),
 * so glossary seeding can humanize slugs from any skill in scope.
 */
export function mergeTopicLabels(
  skills: Array<{ topic_labels?: Record<string, string> }>,
): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const s of skills) {
    for (const [key, label] of Object.entries(s.topic_labels ?? {})) {
      if (label.trim() && labels[key] === undefined) {
        labels[key] = label;
      }
    }
  }
  return labels;
}

/**
 * Seed glossary terms from TeachingContext topics (empty definitions).
 * `term` stays the topic slug (stable identity + body-text matching);
 * the learner-facing label from `labels` is attached as an `alias` when
 * present, so consumers can display a human title without losing matching.
 */
export function seedGlossaryFromTopics(
  topics: string[],
  labels?: Record<string, string>,
): CourseGlossaryEntry[] {
  const seen = new Set<string>();
  const entries: CourseGlossaryEntry[] = [];
  for (const raw of topics) {
    const slug = raw.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const label = labels?.[slug]?.trim();
    if (label && label !== slug) {
      entries.push({ term: slug, aliases: [label], definition: "" });
    } else {
      entries.push({ term: slug, definition: "" });
    }
  }
  return entries;
}

/**
 * Topological order by depends_on among `skillIds`.
 * On cycle: alpha-sorted order + cycleDetected=true.
 */
export function orderSkillsByDepends(
  skillIds: string[],
  graph: SkillGraph,
): { ordered: string[]; cycleFallback: boolean } {
  const allowed = new Set(skillIds);
  const ids = [...skillIds].sort((a, b) => a.localeCompare(b));

  const indegree = new Map<string, number>();
  const children = new Map<string, string[]>();
  for (const id of ids) {
    indegree.set(id, 0);
    children.set(id, []);
  }

  for (const id of ids) {
    for (const dep of graph.dependsOn.get(id) ?? []) {
      if (!allowed.has(dep)) continue;
      // edge dep → id (dependency before dependent)
      children.get(dep)!.push(id);
      indegree.set(id, (indegree.get(id) ?? 0) + 1);
    }
  }

  const subgraph: SkillGraph = {
    skills: new Map(
      [...allowed].map((id) => [id, graph.skills.get(id)!] as const),
    ),
    dependsOn: new Map(
      [...allowed].map((id) => [
        id,
        (graph.dependsOn.get(id) ?? []).filter((d) => allowed.has(d)),
      ]),
    ),
  };
  if (detectCycles(subgraph).length > 0) {
    return { ordered: ids, cycleFallback: true };
  }

  const queue = ids.filter((id) => (indegree.get(id) ?? 0) === 0);
  const ordered: string[] = [];
  while (queue.length) {
    const u = queue.shift()!;
    ordered.push(u);
    for (const v of children.get(u) ?? []) {
      const next = (indegree.get(v) ?? 0) - 1;
      indegree.set(v, next);
      if (next === 0) queue.push(v);
    }
    queue.sort((a, b) => a.localeCompare(b));
  }

  if (ordered.length !== ids.length) {
    return { ordered: ids, cycleFallback: true };
  }
  return { ordered, cycleFallback: false };
}