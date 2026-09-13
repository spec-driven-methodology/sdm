import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { runContentStale } from "../src/content-stale.js";
import { SdmError } from "../src/errors.js";
import {
  EXPORT_KIT_SCHEMA,
  collectKitWarnings,
  exportKit,
  isKitProbeType,
  parseKitFormat,
  renderKitHtml,
} from "../src/export-kit.js";
import { addTerm } from "../src/term-add.js";
import { addQuestion } from "../src/question-add.js";
import { addSkill, linkSkill } from "../src/skill-write.js";
import { loadSkill } from "../src/skills.js";
import { writeYamlFile } from "../src/yaml.js";
import { seedCertification } from "./helpers/profile-fixture.js";
import { withTempProject } from "./helpers/temp-project.js";
import type { Question, Skill } from "../src/schemas.js";

describe("parseKitFormat / isKitProbeType", () => {
  it("defaults to json and accepts html", () => {
    assert.equal(parseKitFormat(undefined), "json");
    assert.equal(parseKitFormat("html"), "html");
  });

  it("rejects invalid format", () => {
    assert.throws(
      () => parseKitFormat("pdf"),
      (err: unknown) =>
        err instanceof SdmError && err.code === "KIT_FORMAT_INVALID",
    );
  });

  it("filters probe types", () => {
    assert.equal(isKitProbeType("open"), true);
    assert.equal(isKitProbeType("code"), true);
    assert.equal(isKitProbeType("single_choice"), false);
  });
});

describe("collectKitWarnings", () => {
  it("flags empty description, missing probes, missing explanation", () => {
    const skill: Skill = {
      id: "prompt",
      name: "Prompt",
      description: "",
      depends_on: [],
      related_to: [],
      topics: [],
    };
    const warnings = collectKitWarnings({
      skills: [skill],
      questionsBySkill: new Map([
        [
          "prompt",
          [
            {
              id: "q-1",
              skill: "prompt",
              difficulty: 0.4,
              type: "open",
              text: "Explain?",
              topics: [],
              red_flags: [],
              rubric: [],
            } as Question,
          ],
        ],
      ]),
      requiredSkillIds: new Set(["prompt"]),
      levelId: "junior",
      levelTitle: "Junior",
      glossary: [
        {
          id: "prompt",
          term: "Prompt",
          definition: "x",
          source: "skill_fallback",
        },
      ],
      allTerms: [],
      usedTermIds: new Set<string>(),
      glossaryFromTerms: false,
    });
    assert.ok(
      warnings.some((w) => w.code === "KIT_SKILL_DESCRIPTION_EMPTY"),
    );
    assert.ok(
      warnings.some((w) => w.code === "KIT_EXPLANATION_MISSING"),
    );
    assert.ok(
      warnings.some((w) => w.code === "KIT_PROBE_RUBRIC_MISSING"),
    );
  });
});

describe("exportKit", () => {
  it("builds kit from profile/level with open probes only", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java",
        name: "Java",
        description: "Core Java language and collections.",
        topics: ["collections"],
      });
      addSkill(root, {
        id: "spring",
        name: "Spring",
        description: "Spring Boot and dependency injection.",
        topics: ["boot"],
      });
      linkSkill(root, "spring", { dependsOn: ["java"] });
      seedCertification(root, {
        profile: "backend",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["java:0.6:1", "spring:0.5:1"],
      });
      addQuestion(root, {
        skill: "java",
        type: "single_choice",
        difficulty: 0.4,
        text: "Which is a List?",
        id: "q-java-sc",
        options: ["a", "b", "c", "d"],
        correct: 1,
        explanation: "ArrayList.",
        topics: ["collections"],
      });
      addQuestion(root, {
        skill: "java",
        type: "open",
        difficulty: 0.4,
        text: "What is JMM?",
        id: "q-java-open",
        explanation: "Java Memory Model defines visibility rules.",
        topics: ["collections"],
      });
      addQuestion(root, {
        skill: "spring",
        type: "code",
        difficulty: 0.5,
        text: "Write a @Bean factory.",
        id: "q-spring-code",
        explanation: "Configuration class with @Bean method.",
        topics: ["boot"],
      });

      const run = exportKit({
        startDir: root,
        profile: "backend",
        level: "middle",
      });

      assert.equal(run.document.schemaVersion, EXPORT_KIT_SCHEMA);
      assert.equal(run.document.id, "kit-backend-middle");
      assert.match(run.document.meta.revision ?? "", /^[a-f0-9]{16}$/);
      assert.ok(run.document.meta.basis);
      assert.deepEqual(
        run.document.modules.map((m) => m.skill),
        ["java", "spring"],
      );
      assert.equal(run.document.modules[0]!.probes.length, 1);
      assert.equal(run.document.modules[0]!.probes[0]!.id, "q-java-open");
      assert.equal(run.document.modules[1]!.probes[0]!.type, "code");
      assert.equal(run.document.glossary.length, 2);
      assert.equal(run.document.checklist.length, 2);
      assert.equal(run.document.meta.moduleOrder, "depends_on_topo");
    });
  });

  it("blocks export under --strict when probes missing", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "docker",
        name: "Docker",
        description: "Container basics and images.",
        topics: ["images"],
      });
      seedCertification(root, {
        profile: "platform",
        level: "junior",
        levelTitle: "Junior",
        requirementTriples: ["docker:0.4:1"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.3,
        text: "What is Docker?",
        id: "q-docker-sc",
        options: ["a", "b", "c", "d"],
        correct: 1,
        explanation: "Container platform.",
        topics: ["images"],
      });

      assert.throws(
        () =>
          exportKit({
            startDir: root,
            profile: "platform",
            level: "junior",
            strict: true,
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "KIT_EXPORT_BLOCKED",
      );
    });
  });

  it("renders self-contained HTML with revision footer", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "prompt",
        name: "Prompt",
        description: "Prompt engineering patterns.",
        topics: ["testing"],
      });
      seedCertification(root, {
        profile: "ai",
        level: "junior",
        levelTitle: "Junior",
        requirementTriples: ["prompt:0.4:1"],
      });
      addQuestion(root, {
        skill: "prompt",
        type: "open",
        difficulty: 0.4,
        text: "How do you evaluate prompts?",
        id: "q-prompt-001",
        explanation: "Golden set and regression checks.",
        topics: ["testing"],
      });

      const run = exportKit({
        startDir: root,
        profile: "ai",
        level: "junior",
        format: "html",
      });
      assert.ok(run.html);
      assert.match(run.html!, /<html/i);
      assert.match(run.html!, /How do you evaluate prompts\?/);
      assert.match(run.html!, /Spec-Driven Methodology/);
      assert.match(run.html!, /class="brand">SDM/);
      assert.match(run.html!, /kit-ai-junior/);

      const html = renderKitHtml(run.document);
      assert.match(html, /Prompt engineering patterns/);
    });
  });

  it("marks stale kit export when skill basis changes", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "docker",
        name: "Docker",
        description: "Container basics.",
        topics: ["images"],
      });
      seedCertification(root, {
        profile: "platform",
        level: "junior",
        levelTitle: "Junior",
        requirementTriples: ["docker:0.4:1"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "What is a container?",
        id: "q-docker-open",
        explanation: "Isolated process with filesystem.",
        topics: ["images"],
      });

      const run = exportKit({
        startDir: root,
        profile: "platform",
        level: "junior",
      });
      const exportsDir = join(root, "exports");
      mkdirSync(exportsDir, { recursive: true });
      writeFileSync(
        join(exportsDir, "kit-platform-junior.json"),
        JSON.stringify(run.document),
        "utf8",
      );

      const skill = loadSkill(root, "docker");
      writeYamlFile(join(root, "ontology", "docker.yaml"), {
        ...skill,
        description: "Updated container description for stale test.",
        topics: ["images", "compose"],
      });

      const stale = runContentStale({
        startDir: root,
        profile: "platform",
        level: "junior",
      });
      assert.ok(
        stale.document.stale.some(
          (s) =>
            s.kind === "export" &&
            s.path === "exports/kit-platform-junior.json" &&
            s.action === "regenerate",
        ),
      );
    });
  });
});
