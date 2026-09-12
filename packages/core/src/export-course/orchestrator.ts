import { buildContentBasis } from "../content-basis.js";
import {
  buildCoursePackageId,
  hashContentRevision,
  buildRevisionByModule,
} from "../export-package-identity.js";
import { buildSkillGraphFromProject } from "../skill-graph.js";
import { findProjectRoot } from "../project-root.js";
import { loadQuestions } from "../loaders.js";
import { loadSkill } from "../skills.js";
import type { Question } from "../schemas.js";
import { SdmError } from "../errors.js";
import { resolveScope, shouldIncludeOverviewModule } from "./scopes.js";
import {
  buildLessonStubs,
  buildOverviewModule,
  mergeTopicLabels,
  orderSkillsByDepends,
  seedGlossaryFromTopics,
} from "./lessons.js";
import {
  collectLearningWarnings,
  collectProseLocaleWarnings,
  collectGlossaryMissingTerms,
  collectDuplicateLessons,
} from "./warnings.js";
import { assertCourseContextReady } from "./course-gate.js";
import {
  COURSE_OVERVIEW_SKILL_ID,
  EXPORT_COURSE_SCHEMA,
  layoutForFormat,
  parseCourseDepth,
  resolveCourseFormat,
  type CourseModule,
  type CourseWarning,
  type ExportCourseDocument,
  type ExportCourseOptions,
  type ExportCourseRun,
  type QuestionAnchor,
  type TeachingContext,
  type TeachingSkillView,
} from "./types.js";

function questionAnchor(q: Question): QuestionAnchor {
  return {
    id: q.id,
    skill: q.skill,
    topics: [...q.topics],
    text: q.text,
    ...(q.explanation !== undefined ? { explanation: q.explanation } : {}),
    difficulty: q.difficulty,
    type: q.type,
  };
}

/**
 * Build TeachingContext + course modules for a methodology scope.
 * SDM does not call an LLM; lesson bodies are empty for agent fill.
 */
export function exportCourse(options: ExportCourseOptions): ExportCourseRun {
  const depth = parseCourseDepth(options.depth);
  const { format, deprecatedConcept } = resolveCourseFormat(options.format);
  const layout = layoutForFormat(format);
  const includePractice = options.includePractice !== false;
  const planOnlyFlag = Boolean(options.planOnly);

  const projectRoot = findProjectRoot(options.startDir);
  const { questions, warnings: qWarnings } = loadQuestions(projectRoot);
  const resolved = resolveScope(projectRoot, options, questions);
  const graph = buildSkillGraphFromProject(projectRoot);

  const { ordered, cycleFallback } = orderSkillsByDepends(
    resolved.skillIds,
    graph,
  );

  const skills = ordered.map((id) => loadSkill(projectRoot, id));
  const questionsBySkill = new Map<string, Question[]>();
  for (const id of ordered) {
    let pool = questions
      .filter((q) => q.skill === id)
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id));
    if (resolved.scopeMeta.topic) {
      const topic = resolved.scopeMeta.topic;
      const topical = pool.filter((q) => q.topics.includes(topic));
      if (topical.length > 0) pool = topical;
    }
    if (resolved.forcedQuestionIds) {
      const byId = new Map(pool.map((q) => [q.id, q]));
      for (const qid of resolved.forcedQuestionIds) {
        const q = questions.find((x) => x.id === qid && x.skill === id);
        if (q) byId.set(q.id, q);
      }
      pool = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
    }
    questionsBySkill.set(id, pool);
  }

  const teachingSkills: TeachingSkillView[] = skills.map((s) => {
    const req = resolved.requirementsBySkill.get(s.id);
    return {
      id: s.id,
      name: s.name,
      description: s.description,
      topics: [...s.topics],
      topicLabels: { ...s.topic_labels },
      dependsOn: [...s.depends_on],
      relatedTo: [...s.related_to],
      ...(req
        ? { depth: req.depth, weight: req.weight }
        : {}),
    };
  });

  const topicSet = new Set<string>();
  for (const s of skills) for (const t of s.topics) topicSet.add(t);
  for (const id of ordered) {
    for (const q of questionsBySkill.get(id) ?? []) {
      for (const t of q.topics) topicSet.add(t);
    }
  }

  const anchors: QuestionAnchor[] = [];
  for (const id of ordered) {
    for (const q of questionsBySkill.get(id) ?? []) {
      anchors.push(questionAnchor(q));
    }
  }

  const dependsOnEdges: Array<{ from: string; to: string }> = [];
  const relatedToEdges: Array<{ from: string; to: string }> = [];
  const scoped = new Set(ordered);
  for (const s of skills) {
    for (const d of s.depends_on) {
      if (scoped.has(d)) dependsOnEdges.push({ from: s.id, to: d });
    }
    for (const r of s.related_to) {
      if (scoped.has(r)) relatedToEdges.push({ from: s.id, to: r });
    }
  }

  const teachingContext: TeachingContext = {
    skills: teachingSkills,
    topics: [...topicSet].sort((a, b) => a.localeCompare(b)),
    questionAnchors: anchors,
    graphEdges: { dependsOn: dependsOnEdges, relatedTo: relatedToEdges },
  };

  const warnings: CourseWarning[] = [];

  const glossary =
    format === "course" && teachingContext.topics.length > 0
      ? seedGlossaryFromTopics(
          teachingContext.topics,
          mergeTopicLabels(skills),
        )
      : undefined;

  warnings.push(
    ...collectLearningWarnings({
      skills,
      questionsBySkill,
      scopedSkillIds: ordered,
      cycleFallback,
      includePractice,
      glossary,
    }),
  );

  if (deprecatedConcept) {
    warnings.push({
      code: "FORMAT_CONCEPT_DEPRECATED",
      message:
        'format "concept" is deprecated; use "notes" (Конспект). Normalized to notes.',
    });
  }

  assertCourseContextReady({
    projectRoot,
    strictContext: Boolean(options.strictContext),
    depth,
    warnings,
  });

  const scopedTopic = resolved.scopeMeta.topic;
  const skillModules: CourseModule[] = skills.map((skill) => {
    const qs = questionsBySkill.get(skill.id) ?? [];
    let practiceIds = includePractice ? qs.map((q) => q.id) : [];
    if (resolved.forcedQuestionIds && includePractice) {
      const forced = [...resolved.forcedQuestionIds].filter((qid) =>
        qs.some((q) => q.id === qid),
      );
      practiceIds = [...new Set([...forced, ...practiceIds])];
    }
    return {
      kind: "skill" as const,
      skill: skill.id,
      title: skill.name,
      lessons: buildLessonStubs(skill, qs, format, scopedTopic),
      practiceQuestionIds: practiceIds,
      prerequisites:
        skill.depends_on.length > 0 ? [...skill.depends_on] : undefined,
    };
  });

  const modules: CourseModule[] = shouldIncludeOverviewModule(
    format,
    resolved.scopeMeta,
  )
    ? [buildOverviewModule(), ...skillModules]
    : skillModules;

  warnings.push(...collectProseLocaleWarnings(modules));

  // Glossary missing terms & duplicate lessons (only when lessons have bodies)
  if (glossary && glossary.length > 0) {
    const glossTerms = glossary.map((g) => g.term);
    warnings.push(...collectGlossaryMissingTerms(modules, glossTerms, teachingContext.topics));
  }
  warnings.push(...collectDuplicateLessons(modules));

  // All lessons are empty stubs — fail early. A course with only topic
  // headings has no content to validate/learn; export always requires at
  // least one non-empty lesson body (filled by the agent, not SDM).
  if (!planOnlyFlag) {
    const allEmpty = modules.every((m) =>
      m.lessons.every((l) => !l.body || l.body.trim() === ""),
    );
    if (allEmpty) {
      throw new SdmError(
        "COURSE_ALL_EMPTY",
        "Все уроки курса пусты (тела lessons[].body не заполнены).\n" +
          "  Экспорт ожидает хотя бы один непустой урок — SDM не генерирует\n" +
          "  пустые образовательные материалы. Заполните lessons[].body\n" +
          "  (человеком или AI-агентом), затем экспортируйте заново.",
      );
    }
  }

  const controls: ExportCourseDocument["controls"] = {
    depth,
    format,
    includePractice,
    ...(options.locale ? { locale: options.locale } : {}),
  };

  const basisSkillIds = modules
    .map((m) => m.skill)
    .filter((id) => id && id !== COURSE_OVERVIEW_SKILL_ID);
  const basis = buildContentBasis({
    projectRoot,
    skillIds: basisSkillIds,
    ...(resolved.level ? { level: resolved.level } : {}),
  });

  const packageId = buildCoursePackageId({
    scope: resolved.scopeMeta,
    depth,
    format,
    includePractice,
    locale: options.locale,
    fromGaps: options.fromGaps,
  });
  const revision = hashContentRevision(basis);
  const revisionByModule = buildRevisionByModule(modules);

  const document: ExportCourseDocument = {
    schemaVersion: EXPORT_COURSE_SCHEMA,
    id: packageId,
    ...(resolved.profile ? { profile: resolved.profile } : {}),
    ...(resolved.level ? { level: resolved.level.level } : {}),
    ...(resolved.level ? { title: resolved.level.title } : {}),
    controls,
    teachingContext,
    modules,
    ...(glossary && glossary.length > 0 ? { glossary } : {}),
    warnings,
    meta: {
      scope: resolved.scopeMeta,
      moduleOrder: cycleFallback ? "alpha_fallback" : "depends_on_topo",
      layout,
      basis,
      revision,
      revisionByModule,
    },
  };

  return {
    projectRoot,
    document,
    loadWarnings: [...qWarnings, ...resolved.loadWarnings],
  };
}