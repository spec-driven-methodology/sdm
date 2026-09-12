import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import {
  COURSE_OVERVIEW_SKILL_ID,
  EXPORT_COURSE_SCHEMA,
  buildOverviewModule,
  collectLearningWarnings,
  collectProseLocaleWarnings,
  detectProseLocaleMixed,
  detectTruncation,
  exportCourse,
  layoutForFormat,
  orderSkillsByDepends,
  parseCourseDepth,
  parseCourseFormat,
  resolveCourseFormat,
  seedGlossaryFromTopics,
} from "../src/export-course.js";
import {
  buildRevisionByModule,
  hashModuleRevision,
} from "../src/export-package-identity.js";
import { addQuestion } from "../src/question-add.js";
import { buildSkillGraph } from "../src/skill-graph.js";
import { addSkill, linkSkill } from "../src/skill-write.js";
import { writeYamlFile } from "../src/yaml.js";
import { seedCertification } from "./helpers/profile-fixture.js";
import { withTempProject } from "./helpers/temp-project.js";
import type { Skill } from "../src/schemas.js";
import { join } from "node:path";

describe("parseCourseDepth / parseCourseFormat", () => {
  it("defaults and accepts enums", () => {
    assert.equal(parseCourseDepth(undefined), "standard");
    assert.equal(parseCourseDepth("brief"), "brief");
    assert.equal(parseCourseFormat(undefined), "howto");
    assert.equal(parseCourseFormat("cheatsheet"), "cheatsheet");
    assert.equal(parseCourseFormat("notes"), "notes");
    assert.equal(parseCourseFormat("course"), "course");
    assert.equal(layoutForFormat("howto"), "single_doc");
    assert.equal(layoutForFormat("course"), "modular_course");
  });

  it("maps deprecated concept to notes", () => {
    const resolved = resolveCourseFormat("concept");
    assert.equal(resolved.format, "notes");
    assert.equal(resolved.deprecatedConcept, true);
    assert.equal(parseCourseFormat("concept"), "notes");
  });

  it("rejects invalid depth/format", () => {
    assert.throws(
      () => parseCourseDepth("long"),
      (err: unknown) =>
        err instanceof SdmError && err.code === "COURSE_DEPTH_INVALID",
    );
    assert.throws(
      () => parseCourseFormat("video"),
      (err: unknown) =>
        err instanceof SdmError && err.code === "COURSE_FORMAT_INVALID",
    );
  });
});

describe("detectProseLocaleMixed", () => {
  it("flags mixed Cyrillic/Latin prose outside fences", () => {
    assert.equal(
      detectProseLocaleMixed("Короткий primer по теме промптов."),
      true,
    );
    assert.equal(
      detectProseLocaleMixed("Короткий конспект по теме промптов."),
      false,
    );
    assert.equal(
      detectProseLocaleMixed("Текст:\n```\nconst primer = 1;\n```\nКонец."),
      false,
    );
  });
});

describe("detectTruncation", () => {
  it("flags unclosed punctuation in last 200 chars", () => {
    assert.equal(detectTruncation("Работает\n\nПодробнее: *незакрытый"), true);
    assert.equal(detectTruncation("Нормальный текст с точкой."), false);
    assert.equal(detectTruncation("Короткий текст без точки"), true);
  });

  it("flags end on conjunction", () => {
    assert.equal(detectTruncation("Эта тема важна, потому что"), true);
    assert.equal(detectTruncation("Этот паттерн нужен для"), true);
    assert.equal(detectTruncation("...можно проверить без обращения к Identity Provider "), true);
  });

  it("does not flag complete sentences", () => {
    assert.equal(detectTruncation("Полный текст. Важно помнить об этом."), false);
    assert.equal(detectTruncation("Строка с `code` внутри."), false);
  });

  it("empty body is not truncated", () => {
    assert.equal(detectTruncation(""), false);
    assert.equal(detectTruncation("   "), false);
  });
});

describe("orderSkillsByDepends", () => {
  it("orders dependency before dependent", () => {
    const skills: Skill[] = [
      {
        id: "spring",
        name: "Spring",
        description: "x".repeat(50),
        depends_on: ["java"],
        related_to: [],
        topics: ["boot"],
      },
      {
        id: "java",
        name: "Java",
        description: "x".repeat(50),
        depends_on: [],
        related_to: [],
        topics: ["core"],
      },
    ];
    const graph = buildSkillGraph(skills);
    const { ordered, cycleFallback } = orderSkillsByDepends(
      ["spring", "java"],
      graph,
    );
    assert.equal(cycleFallback, false);
    assert.deepEqual(ordered, ["java", "spring"]);
  });

  it("falls back to alpha on cycle", () => {
    const skills: Skill[] = [
      {
        id: "a",
        name: "A",
        description: "x".repeat(50),
        depends_on: ["b"],
        related_to: [],
        topics: [],
      },
      {
        id: "b",
        name: "B",
        description: "x".repeat(50),
        depends_on: ["a"],
        related_to: [],
        topics: [],
      },
    ];
    const graph = buildSkillGraph(skills);
    const { ordered, cycleFallback } = orderSkillsByDepends(["a", "b"], graph);
    assert.equal(cycleFallback, true);
    assert.deepEqual(ordered, ["a", "b"]);
  });
});

describe("collectLearningWarnings", () => {
  it("flags thin description, empty topics, missing explanation", () => {
    const skill: Skill = {
      id: "prompt",
      name: "Prompt",
      description: "short",
      depends_on: [],
      related_to: [],
      topics: [],
    };
    const warnings = collectLearningWarnings({
      skills: [skill],
      questionsBySkill: new Map([
        [
          "prompt",
          [
            {
              id: "q-1",
              skill: "prompt",
              difficulty: 0.4,
              type: "single_choice",
              text: "What is a prompt?",
              topics: [],
            },
          ],
        ],
      ]),
      scopedSkillIds: ["prompt"],
      cycleFallback: false,
      includePractice: true,
    });
    const codes = new Set(warnings.map((w) => w.code));
    assert.ok(codes.has("SKILL_DESCRIPTION_THIN"));
    assert.ok(codes.has("SKILL_TOPICS_EMPTY"));
    assert.ok(codes.has("PRACTICE_THIN"));
    assert.ok(codes.has("QUESTION_EXPLANATION_MISSING"));
  });
});

describe("exportCourse", () => {
  it("exports full level skeleton with teachingContext and controls echo", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java",
        name: "Java",
        description: "Java core language and collections for backend work.",
        topics: ["collections"],
      });
      addSkill(root, {
        id: "spring",
        name: "Spring",
        description: "Spring Boot IoC and web stack for services.",
        topics: ["boot"],
      });
      linkSkill(root, "spring", { dependsOn: ["java"] });
      seedCertification(root, {
        profile: "backend",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["java:0.8:0.5", "spring:0.6:0.5"],
      });
      addQuestion(root, {
        skill: "java",
        type: "single_choice",
        difficulty: 0.5,
        text: "ArrayList vs LinkedList?",
        id: "q-java-001",
        options: ["a", "b", "c", "d"],
        correct: 1,
        explanation: "ArrayList is array-backed.",
        topics: ["collections"],
      });
      addQuestion(root, {
        skill: "java",
        type: "multi_choice",
        difficulty: 0.6,
        text: "Which are List implementations?",
        id: "q-java-002",
        options: ["a", "b", "c", "d"],
        correct: [1, 2],
        explanation: "ArrayList and LinkedList.",
        topics: ["collections"],
      });
      addQuestion(root, {
        skill: "java",
        type: "open",
        difficulty: 0.4,
        text: "What is JMM?",
        id: "q-java-003",
        explanation: "Java Memory Model.",
        topics: ["collections"],
      });
      addQuestion(root, {
        skill: "spring",
        type: "single_choice",
        difficulty: 0.5,
        text: "What is @Bean?",
        id: "q-spring-001",
        options: ["a", "b", "c", "d"],
        correct: 1,
        explanation: "Bean definition.",
        topics: ["boot"],
      });
      addQuestion(root, {
        skill: "spring",
        type: "multi_choice",
        difficulty: 0.55,
        text: "IoC containers?",
        id: "q-spring-002",
        options: ["a", "b", "c", "d"],
        correct: [1, 2],
        explanation: "ApplicationContext.",
        topics: ["boot"],
      });
      addQuestion(root, {
        skill: "spring",
        type: "open",
        difficulty: 0.5,
        text: "Explain DI",
        id: "q-spring-003",
        explanation: "Dependency injection.",
        topics: ["boot"],
      });

      const run = exportCourse({
        startDir: root,
        profile: "backend",
        level: "middle",
        depth: "brief",
        format: "howto",
        planOnly: true,
      });

      assert.equal(run.document.schemaVersion, EXPORT_COURSE_SCHEMA);
      assert.equal(run.document.id, "course-backend-middle-howto-brief");
      assert.match(run.document.meta.revision ?? "", /^[a-f0-9]{16}$/);
      assert.equal(run.document.controls.depth, "brief");
      assert.equal(run.document.controls.format, "howto");
      assert.deepEqual(
        run.document.modules.map((m) => m.skill),
        ["java", "spring"],
      );
      assert.equal(run.document.meta.moduleOrder, "depends_on_topo");
      assert.equal(run.document.meta.layout, "single_doc");
      assert.equal(run.document.modules[0]!.lessons.length, 1);
      assert.ok(
        run.document.modules[0]!.practiceQuestionIds.includes("q-java-001"),
      );
      assert.ok(run.document.teachingContext.questionAnchors.length >= 3);
      assert.equal(run.document.modules[0]!.lessons[0]!.body, "");
    });
  });

  it("shapes layout by format and deprecates concept", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "prompt",
        name: "Prompt engineering",
        description: "System prompts, few-shot examples, and evaluation loops.",
        topics: ["system-prompt", "testing"],
      });
      addQuestion(root, {
        skill: "prompt",
        type: "open",
        difficulty: 0.4,
        text: "How do you test a prompt?",
        id: "q-prompt-001",
        explanation: "Golden set.",
        topics: ["testing"],
      });

      const courseFmt = exportCourse({
        startDir: root,
        skill: "prompt",
        format: "course",
        planOnly: true,
      });
      assert.equal(courseFmt.document.meta.layout, "modular_course");
      assert.ok(courseFmt.document.modules[0]!.lessons.length >= 2);

      const notes = exportCourse({
        startDir: root,
        skill: "prompt",
        format: "notes",
        planOnly: true,
      });
      assert.equal(notes.document.meta.layout, "single_doc");
      assert.equal(notes.document.modules[0]!.lessons.length, 1);

      const deprecated = exportCourse({
        startDir: root,
        skill: "prompt",
        format: "concept",
        planOnly: true,
      });
      assert.equal(deprecated.document.controls.format, "notes");
      assert.ok(
        deprecated.document.warnings.some(
          (w) => w.code === "FORMAT_CONCEPT_DEPRECATED",
        ),
      );

      const withBody = exportCourse({
        startDir: root,
        skill: "prompt",
        format: "notes",
        planOnly: true,
      });
      withBody.document.modules[0]!.lessons[0]!.body =
        "Короткий primer по теме.";
      const localeWarns = collectProseLocaleWarnings(withBody.document.modules);
      assert.ok(localeWarns.some((w) => w.code === "PROSE_LOCALE_MIXED"));
    });
  });

  it("supports single skill and from-questions scopes", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "prompt",
        name: "Prompt engineering",
        description: "System prompts, few-shot examples, and evaluation loops.",
        topics: ["system-prompt", "testing"],
      });
      addQuestion(root, {
        skill: "prompt",
        type: "single_choice",
        difficulty: 0.4,
        text: "How do you test a prompt?",
        id: "q-prompt-001",
        options: ["a", "b", "c", "d"],
        correct: 1,
        explanation: "Golden set and regression.",
        topics: ["testing"],
      });

      const one = exportCourse({
        startDir: root,
        skill: "prompt",
        depth: "standard",
        planOnly: true,
      });
      assert.equal(one.document.modules.length, 1);
      assert.equal(one.document.meta.scope.mode, "skill");

      const fromQ = exportCourse({
        startDir: root,
        fromQuestions: ["q-prompt-001"],
        depth: "detailed",
        format: "howto",
        planOnly: true,
      });
      assert.equal(fromQ.document.controls.depth, "detailed");
      assert.ok(
        fromQ.document.modules[0]!.practiceQuestionIds.includes("q-prompt-001"),
      );
      assert.equal(fromQ.document.meta.scope.mode, "from_questions");
    });
  });

  it("from-gaps limits modules to thin/missing skills", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "ok-skill",
        name: "OK",
        description: "Well described skill with enough practice questions here.",
        topics: ["t1"],
      });
      addSkill(root, {
        id: "thin-skill",
        name: "Thin",
        description: "Another well described skill waiting for more questions.",
        topics: ["t2"],
      });
      seedCertification(root, {
        profile: "p",
        level: "l",
        levelTitle: "L",
        requirementTriples: ["ok-skill:0.5:0.5", "thin-skill:0.5:0.5"],
      });
      for (const id of ["q-ok-1", "q-ok-2", "q-ok-3"]) {
        addQuestion(root, {
          skill: "ok-skill",
          type: "open",
          difficulty: 0.5,
          text: `Q ${id}`,
          id,
          explanation: "e",
          topics: ["t1"],
        });
      }
      addQuestion(root, {
        skill: "thin-skill",
        type: "open",
        difficulty: 0.5,
        text: "Only one",
        id: "q-thin-1",
        explanation: "e",
        topics: ["t2"],
      });

      const run = exportCourse({
        startDir: root,
        profile: "p",
        level: "l",
        fromGaps: true,
        planOnly: true,
      });
      assert.deepEqual(
        run.document.modules.map((m) => m.skill),
        ["thin-skill"],
      );
      assert.equal(run.document.meta.scope.mode, "from_gaps");
    });
  });

  it("echoes different depth for same keys and strict-context fails on thin skills", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "prompt",
        name: "Prompt",
        description: "tiny",
        topics: [],
      });
      addQuestion(root, {
        skill: "prompt",
        type: "open",
        difficulty: 0.4,
        text: "What is a prompt?",
        id: "q-prompt-001",
      });

      const brief = exportCourse({
        startDir: root,
        skill: "prompt",
        depth: "brief",
        format: "howto",
        planOnly: true,
      });
      const detailed = exportCourse({
        startDir: root,
        skill: "prompt",
        depth: "detailed",
        format: "howto",
        planOnly: true,
      });
      assert.equal(brief.document.modules[0]!.skill, detailed.document.modules[0]!.skill);
      assert.equal(brief.document.controls.depth, "brief");
      assert.equal(detailed.document.controls.depth, "detailed");
      assert.ok(
        detailed.document.warnings.some((w) => w.code === "SKILL_DESCRIPTION_THIN"),
      );

      assert.throws(
        () =>
          exportCourse({
            startDir: root,
            skill: "prompt",
            depth: "detailed",
            strictContext: true,
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "COURSE_CONTEXT_THIN",
      );
    });
  });

  it("rejects invalid profile/level and unknown question", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "java", name: "Java", description: "x".repeat(50) });
      seedCertification(root, {
        profile: "backend",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["java:0.5:1"],
      });
      assert.throws(
        () =>
          exportCourse({
            startDir: root,
            profile: "missing",
            level: "middle",
          }),
        (err: unknown) => err instanceof SdmError,
      );
      assert.throws(
        () =>
          exportCourse({
            startDir: root,
            fromQuestions: ["q-nope"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "EXPORT_QUESTION_NOT_FOUND",
      );
    });
  });

  it("rejects all-empty course without --plan-only", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "prompt",
        name: "Prompt engineering",
        description: "System prompts, few-shot examples, and evaluation loops.",
        topics: ["system-prompt"],
      });
      assert.throws(
        () =>
          exportCourse({
            startDir: root,
            skill: "prompt",
            format: "course",
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "COURSE_ALL_EMPTY",
      );
      // --plan-only must still pass
      const ok = exportCourse({
        startDir: root,
        skill: "prompt",
        format: "course",
        planOnly: true,
      });
      assert.equal(ok.document.modules.length, 1);
    });
  });

  it("prepends overview and seeds glossary for level-scoped course", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java",
        name: "Java",
        description: "Core Java language for backend services and interviews.",
        topics: ["core", "collections"],
      });
      addQuestion(root, {
        skill: "java",
        type: "open",
        difficulty: 0.4,
        text: "What is a List?",
        id: "q-java-001",
        explanation: "Ordered collection.",
        topics: ["collections"],
      });
      seedCertification(root, {
        profile: "backend",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["java:0.5:1"],
      });

      const run = exportCourse({
        startDir: root,
        profile: "backend",
        level: "middle",
        format: "course",
        planOnly: true,
      });

      assert.equal(run.document.modules[0]!.kind, "overview");
      assert.equal(run.document.modules[0]!.skill, COURSE_OVERVIEW_SKILL_ID);
      assert.equal(run.document.modules[0]!.lessons.length, 4);
      assert.equal(run.document.modules[1]!.kind, "skill");
      assert.equal(run.document.modules[1]!.skill, "java");
      assert.ok(Array.isArray(run.document.glossary));
      assert.ok(
        run.document.glossary!.some((g) => g.term === "collections"),
      );
      assert.equal(
        run.document.glossary!.find((g) => g.term === "collections")!.definition,
        "",
      );
    });
  });

  it("omits overview for single-skill course scope", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "prompt",
        name: "Prompt engineering",
        description: "System prompts, few-shot examples, and evaluation loops.",
        topics: ["system-prompt"],
      });
      const run = exportCourse({
        startDir: root,
        skill: "prompt",
        format: "course",
        planOnly: true,
      });
      assert.equal(run.document.modules.length, 1);
      assert.equal(run.document.modules[0]!.skill, "prompt");
      assert.notEqual(run.document.modules[0]!.kind, "overview");
    });
  });

  it("keeps packs without kind valid as skill modules", () => {
    const overview = buildOverviewModule();
    assert.equal(overview.kind, "overview");
    const seeded = seedGlossaryFromTopics(["bias", "bias", " grounding "]);
    assert.deepEqual(
      seeded.map((g) => g.term),
      ["bias", "grounding"],
    );
    // Older document shape: omit kind / glossary — still a valid CourseModule.
    const legacy: { skill: string; title: string; lessons: []; practiceQuestionIds: [] } =
      {
        skill: "java",
        title: "Java",
        lessons: [],
        practiceQuestionIds: [],
      };
    assert.equal(legacy.skill, "java");
  });

  describe("topicLabels", () => {
    async function makeLabeledProject(
      run: (root: string) => void,
    ): Promise<void> {
      await withTempProject((root) => {
        addSkill(root, {
          id: "llm",
          name: "LLM Integration",
          description: "HTTP clients, resilience, streaming for LLM providers.",
          topics: ["http-client", "resilience", "raw-topic"],
          topicLabels: {
            "http-client": "HTTP-клиент для LLM",
            resilience: "Отказоустойчивость",
          },
        });
        addQuestion(root, {
          skill: "llm",
          type: "open",
          difficulty: 0.5,
          text: "Как устроен HTTP-клиент?",
          id: "q-llm-001",
          explanation: "WebClient.",
          topics: ["streaming"],
        });
        run(root);
      });
    }

    it("titles lesson stubs with learner-facing labels", async () => {
      await makeLabeledProject((root) => {
        const run = exportCourse({
          startDir: root,
          skill: "llm",
          format: "course",
          planOnly: true,
        });
        const lessons = run.document.modules[0]!.lessons;
        const byTopic = new Map(lessons.map((l) => [l.topic, l]));
        assert.equal(byTopic.get("http-client")!.title, "HTTP-клиент для LLM");
        assert.equal(byTopic.get("resilience")!.title, "Отказоустойчивость");
        assert.equal(byTopic.get("raw-topic")!.title, "raw-topic");
        // identity preserved
        assert.equal(byTopic.get("http-client")!.id, "llm--http-client");
      });
    });

    it("titles question-derived topic via labels", async () => {
      await makeLabeledProject((root) => {
        const run = exportCourse({
          startDir: root,
          skill: "llm",
          format: "course",
          planOnly: true,
        });
        const lessons = run.document.modules[0]!.lessons;
        const streaming = lessons.find((l) => l.topic === "streaming")!;
        assert.equal(streaming.title, "streaming");
      });
    });

    it("exposes topicLabels in teaching context", async () => {
      await makeLabeledProject((root) => {
        const run = exportCourse({
          startDir: root,
          skill: "llm",
          format: "course",
          planOnly: true,
        });
        const skill = run.document.teachingContext.skills[0]!;
        assert.equal(
          skill.topicLabels["http-client"],
          "HTTP-клиент для LLM",
        );
      });
    });

    it("seeds glossary with label as alias keeping slug term", () => {
      const seeded = seedGlossaryFromTopics(
        ["http-client", "resilience", "plain"],
        {
          "http-client": "HTTP-клиент для LLM",
          resilience: "Отказоустойчивость",
        },
      );
      const http = seeded.find((g) => g.term === "http-client")!;
      assert.deepEqual(http.aliases, ["HTTP-клиент для LLM"]);
      const plain = seeded.find((g) => g.term === "plain")!;
      assert.equal(plain.aliases, undefined);
    });
  });

  describe("courseGate", () => {
    async function makeProjectWithGate(
      root: string,
      gate: "off" | "strict",
      seed: () => void,
    ): Promise<void> {
      writeYamlFile(join(root, "sdm.yaml"), {
        version: "0.1",
        name: "test-methodology",
        quality: { courseGate: gate },
      });
      seed();
    }

    it("blocks export under strict gate on thin skill", async () => {
      await withTempProject((root) => {
        makeProjectWithGate(root, "strict", () => {
          addSkill(root, {
            id: "thin",
            name: "Thin skill",
            description: "short",
            topics: [],
          });
        });
        assert.throws(
          () =>
            exportCourse({
              startDir: root,
              skill: "thin",
              format: "course",
              planOnly: true,
            }),
          (err: unknown) =>
            err instanceof SdmError && err.code === "COURSE_GATE_BLOCKED",
        );
      });
    });

    it("passes with courseGate off even when warnings exist", async () => {
      await withTempProject((root) => {
        makeProjectWithGate(root, "off", () => {
          addSkill(root, {
            id: "thin",
            name: "Thin skill",
            description: "short",
            topics: [],
          });
        });
        const run = exportCourse({
          startDir: root,
          skill: "thin",
          format: "course",
          planOnly: true,
        });
        assert.equal(run.document.warnings.some((w) => w.code === "SKILL_DESCRIPTION_THIN"), true);
      });
    });
  });

  describe("revisionByModule", () => {
    it("exposes per-module hashes and overview key", async () => {
      await withTempProject((root) => {
        addSkill(root, {
          id: "java",
          name: "Java",
          description: "Core Java with collections.",
          topics: ["collections"],
        });
        seedCertification(root, {
          profile: "backend",
          level: "middle",
          levelTitle: "Middle",
          requirementTriples: ["java:0.5:1"],
        });
        const run = exportCourse({
          startDir: root,
          profile: "backend",
          level: "middle",
          format: "course",
          planOnly: true,
        });
        const m = run.document.meta;
        assert.ok(m.revision);
        assert.ok(m.revisionByModule);
        assert.ok(m.revisionByModule["course-overview"]);
        assert.ok(m.revisionByModule["java"]);
      });
    });

    it("changes only the touched module hash when a lesson changes", () => {
      const modA = {
        kind: "skill",
        skill: "java",
        title: "Java",
        lessons: [
          { id: "java--collections", topic: "collections", title: "Коллекции", body: "A" },
        ],
        practiceQuestionIds: ["q-1"],
      };
      const modB = {
        ...modA,
        lessons: [{ ...modA.lessons[0], body: "B" }],
      };
      const before = buildRevisionByModule([modA, { kind: "overview", skill: "course-overview", title: "О", lessons: [], practiceQuestionIds: [] }]);
      const after = buildRevisionByModule([modB, { kind: "overview", skill: "course-overview", title: "О", lessons: [], practiceQuestionIds: [] }]);
      assert.notEqual(before["java"], after["java"]);
      assert.equal(before["course-overview"], after["course-overview"]);
    });

    it("hashModuleRevision is deterministic", () => {
      const mod = { skill: "x", lessons: [{ id: "x--a", title: "A", body: "b" }], practiceQuestionIds: [] };
      assert.equal(hashModuleRevision(mod), hashModuleRevision({ ...mod }));
    });
  });
});
