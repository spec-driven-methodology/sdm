import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { hashSkillContent } from "../src/content-basis.js";
import { runContentStale } from "../src/content-stale.js";
import { SdmError } from "../src/errors.js";
import { exportTest } from "../src/export.js";
import { addQuestion } from "../src/question-add.js";
import { addSkill, linkSkill } from "../src/skill-write.js";
import { loadSkill } from "../src/skills.js";
import { writeYamlFile } from "../src/yaml.js";
import { seedCertification } from "./helpers/profile-fixture.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("runContentStale", () => {
  it("reports missing_basis for unstamped questions", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java-core",
        name: "Java Core",
        topics: ["collections"],
      });
      writeYamlFile(join(root, "library", "questions", "q-old.yaml"), {
        id: "q-old",
        skill: "java-core",
        difficulty: 0.4,
        type: "open",
        text: "What is a List?",
        expected: "interface",
        topics: ["collections"],
      });

      const run = runContentStale({ startDir: root, skill: "java-core" });
      assert.equal(run.document.schemaVersion, "sdm.content.stale/v1");
      assert.ok(
        run.document.stale.some(
          (s) => s.id === "q-old" && s.reason === "missing_basis",
        ),
      );
      assert.ok(run.document.workItems.some((w) => w.id === "q-old"));
    });
  });

  it("reports skill_basis_mismatch after skill topics change", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java-core",
        name: "Java Core",
        topics: ["collections"],
        description: "Core Java",
      });
      const added = addQuestion(root, {
        skill: "java-core",
        difficulty: 0.4,
        type: "open",
        text: "What is a List?",
        expected: "interface",
        topics: ["collections"],
      });
      assert.ok(added.question.meta?.basis?.skills?.["java-core"]);

      const skill = loadSkill(root, "java-core");
      writeYamlFile(join(root, "ontology", "java-core.yaml"), {
        ...skill,
        topics: ["collections", "streams"],
      });

      const run = runContentStale({ startDir: root, skill: "java-core" });
      assert.ok(
        run.document.stale.some(
          (s) =>
            s.id === added.question.id && s.reason === "skill_basis_mismatch",
        ),
      );
    });
  });

  it("fresh basis yields no mismatch for that question", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java-core",
        name: "Java Core",
        topics: ["collections"],
        description: "Core Java",
      });
      addQuestion(root, {
        skill: "java-core",
        difficulty: 0.4,
        type: "open",
        text: "What is a List?",
        expected: "interface",
        topics: ["collections"],
      });

      const run = runContentStale({ startDir: root, skill: "java-core" });
      assert.equal(
        run.document.stale.filter((s) => s.reason === "skill_basis_mismatch")
          .length,
        0,
      );
    });
  });

  it("does not mark downstream-only questions for --skill parent", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "java-core", name: "Java", topics: ["t"] });
      addSkill(root, {
        id: "spring",
        name: "Spring",
        topics: ["t"],
      });
      linkSkill(root, "spring", { dependsOn: ["java-core"] });
      writeYamlFile(join(root, "library", "questions", "q-spring.yaml"), {
        id: "q-spring",
        skill: "spring",
        difficulty: 0.5,
        type: "open",
        text: "IoC?",
        expected: "container",
        topics: ["t"],
        meta: {
          basis: {
            skills: {
              spring: hashSkillContent(loadSkill(root, "spring")),
            },
            capturedAt: new Date().toISOString(),
          },
        },
      });

      const skill = loadSkill(root, "java-core");
      writeYamlFile(join(root, "ontology", "java-core.yaml"), {
        ...skill,
        topics: ["t", "new"],
      });

      const run = runContentStale({ startDir: root, skill: "java-core" });
      assert.ok(!run.document.stale.some((s) => s.id === "q-spring"));
    });
  });

  it("errors on missing skill", async () => {
    await withTempProject((root) => {
      assert.throws(
        () => runContentStale({ startDir: root, skill: "nope" }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "SKILL_NOT_FOUND",
      );
    });
  });

  it("stamps export basis and detects mismatch", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java-core",
        name: "Java Core",
        topics: ["collections"],
        description: "Core",
      });
      seedCertification(root, {
        profile: "java-developer",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["java-core:0.8:1"],
      });
      addQuestion(root, {
        skill: "java-core",
        difficulty: 0.5,
        type: "open",
        text: "List?",
        expected: "interface",
        topics: ["collections"],
      });

      const run = exportTest({
        startDir: root,
        profile: "java-developer",
        level: "middle",
        format: "json",
      });
      assert.ok(run.document.meta.basis?.skills?.["java-core"]);
      assert.ok(run.document.meta.basis?.level?.id === "middle");

      mkdirSync(join(root, "exports"), { recursive: true });
      writeFileSync(
        join(root, "exports", "test-middle.json"),
        JSON.stringify(run.document),
        "utf8",
      );

      const skill = loadSkill(root, "java-core");
      writeYamlFile(join(root, "ontology", "java-core.yaml"), {
        ...skill,
        topics: ["collections", "streams"],
      });

      const stale = runContentStale({
        startDir: root,
        skill: "java-core",
      });
      assert.ok(
        stale.document.stale.some(
          (s) =>
            s.kind === "export" &&
            s.path === "exports/test-middle.json" &&
            s.reason === "skill_basis_mismatch",
        ),
      );
    });
  });
});
