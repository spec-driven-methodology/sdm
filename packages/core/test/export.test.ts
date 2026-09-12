import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import {
  exportMatrix,
  exportTest,
  EXPORT_MATRIX_SCHEMA,
  EXPORT_TEST_SCHEMA,
} from "../src/export.js";
import { addQuestion } from "../src/question-add.js";
import { seedCertification } from "./helpers/profile-fixture.js";
import { addSkill } from "../src/skill-write.js";
import { writeYamlFile } from "../src/yaml.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("exportTest", () => {
  it("assembles sorted questions and lists missing skills", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:0.5", "linux:0.5:0.5"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "B second",
        id: "q-docker-002",
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.2,
        text: "A first",
        id: "q-docker-001",
      });

      const run = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
      });

      assert.equal(run.format, "json");
      assert.equal(run.document.schemaVersion, EXPORT_TEST_SCHEMA);
      assert.equal(run.document.id, "test-platform-middle");
      assert.match(run.document.meta.revision ?? "", /^[a-f0-9]{16}$/);
      assert.ok(run.document.meta.basis);
      assert.equal(run.document.meta.questionCount, 2);
      assert.deepEqual(run.document.meta.skillsMissingQuestions, ["linux"]);
      assert.deepEqual(
        run.document.questions.map((q) => q.id),
        ["q-docker-001", "q-docker-002"],
      );
      assert.equal(run.csv, null);
    });
  });

  it("rejects invalid format", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      assert.throws(
        () =>
          exportTest({
            startDir: root,
            profile: "platform",
            level: "middle",
            format: "xml",
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "EXPORT_FORMAT_INVALID",
      );
    });
  });

  it("emits CSV when requested", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "What is Docker?",
        id: "q-docker-001",
      });

      const run = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
        format: "csv",
      });
      assert.equal(run.format, "csv");
      assert.ok(
        run.csv?.startsWith(
          "id,skill,difficulty,type,text,options,correct,explanation,expected",
        ),
      );
      assert.ok(run.csv?.includes("q-docker-001"));
    });
  });

  it("includes expected on open questions in JSON export", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "What is Docker?",
        expected: ["container runtime", "Container runtime"],
        id: "q-docker-001",
      });

      const run = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
      });
      assert.deepEqual(run.document.questions[0]?.expected, [
        "container runtime",
        "Container runtime",
      ]);
    });
  });

  it("excludes open questions when excludeTypes set", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "Open Q",
        id: "q-docker-open",
      });
      addQuestion(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.3,
        text: "Choice Q",
        options: ["a", "b"],
        correct: 1,
        id: "q-docker-sc",
      });

      const run = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
        excludeTypes: ["open"],
      });
      assert.equal(run.document.meta.questionCount, 1);
      assert.deepEqual(run.document.meta.typeFilter, {
        mode: "exclude",
        types: ["open"],
      });
      assert.deepEqual(
        run.document.questions.map((q) => q.type),
        ["single_choice"],
      );
    });
  });

  it("includeTypes keeps only single_choice", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "multi_choice",
        difficulty: 0.3,
        text: "Multi",
        options: ["a", "b", "c"],
        correct: [1, 2],
        id: "q-docker-mc",
      });
      addQuestion(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.3,
        text: "Single",
        options: ["a", "b"],
        correct: 2,
        id: "q-docker-sc",
      });

      const run = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
        includeTypes: ["single_choice"],
      });
      assert.equal(run.document.questions.length, 1);
      assert.equal(run.document.questions[0]?.id, "q-docker-sc");
      assert.deepEqual(run.document.meta.typeFilter, {
        mode: "include",
        types: ["single_choice"],
      });
    });
  });

  it("rejects include and exclude together", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      assert.throws(
        () =>
          exportTest({
            startDir: root,
            profile: "platform",
            level: "middle",
            includeTypes: ["open"],
            excludeTypes: ["code"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "EXPORT_TYPE_FILTER_CONFLICT",
      );
    });
  });

  it("rejects invalid type name", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      assert.throws(
        () =>
          exportTest({
            startDir: root,
            profile: "platform",
            level: "middle",
            excludeTypes: ["text"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "EXPORT_TYPE_INVALID",
      );
    });
  });

  it("marks skill missing when filter removes all its questions", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "Only open",
        id: "q-docker-open",
      });

      const run = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
        excludeTypes: ["open"],
      });
      assert.equal(run.document.meta.questionCount, 0);
      assert.deepEqual(run.document.meta.skillsMissingQuestions, ["docker"]);
    });
  });

  it("omits typeFilter when unset", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "Q",
        id: "q-docker-001",
      });
      const run = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
      });
      assert.equal(run.document.meta.typeFilter, undefined);
    });
  });

  it("includeSkills narrows questions and renormalizes requirements", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:0.6", "linux:0.5:0.4"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.3,
        text: "D",
        options: ["a", "b"],
        correct: 1,
        id: "q-docker-001",
      });
      addQuestion(root, {
        skill: "linux",
        type: "single_choice",
        difficulty: 0.3,
        text: "L",
        options: ["a", "b"],
        correct: 1,
        id: "q-linux-001",
      });
      const run = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
        includeSkills: ["docker"],
      });
      assert.equal(run.document.questions.length, 1);
      assert.equal(run.document.questions[0]?.skill, "docker");
      assert.deepEqual(
        run.document.requirements.map((r) => r.skill),
        ["docker"],
      );
      assert.equal(run.document.requirements[0]?.weight, 1);
      assert.equal(run.document.meta.weightsNormalized, true);
      assert.deepEqual(run.document.meta.skillFilter, {
        mode: "include",
        skills: ["docker"],
      });
    });
  });

  it("excludeSkills drops listed skills", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:0.5", "linux:0.5:0.5"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "D",
        id: "q-docker-001",
      });
      addQuestion(root, {
        skill: "linux",
        type: "open",
        difficulty: 0.3,
        text: "L",
        id: "q-linux-001",
      });
      const run = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
        excludeSkills: ["linux"],
      });
      assert.deepEqual(
        run.document.questions.map((q) => q.skill),
        ["docker"],
      );
      assert.equal(run.document.meta.skillFilter?.mode, "exclude");
    });
  });

  it("rejects include and exclude skill filters together", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      assert.throws(
        () =>
          exportTest({
            startDir: root,
            profile: "platform",
            level: "middle",
            includeSkills: ["docker"],
            excludeSkills: ["docker"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "EXPORT_SKILL_FILTER_CONFLICT",
      );
    });
  });

  it("rejects unknown skill on level", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      assert.throws(
        () =>
          exportTest({
            startDir: root,
            profile: "platform",
            level: "middle",
            includeSkills: ["not-on-level"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "EXPORT_SKILL_UNKNOWN",
      );
    });
  });

  it("includeQuestions allowlists ids", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "A",
        id: "q-docker-001",
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.4,
        text: "B",
        id: "q-docker-002",
      });
      const run = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
        includeQuestions: ["q-docker-002"],
      });
      assert.deepEqual(
        run.document.questions.map((q) => q.id),
        ["q-docker-002"],
      );
      assert.deepEqual(run.document.meta.questionFilter, {
        mode: "include",
        ids: ["q-docker-002"],
      });
      assert.equal(run.document.meta.questionCount, 1);
    });
  });

  it("fails when includeQuestions id missing after type filter", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "Open",
        id: "q-docker-open",
      });
      assert.throws(
        () =>
          exportTest({
            startDir: root,
            profile: "platform",
            level: "middle",
            excludeTypes: ["open"],
            includeQuestions: ["q-docker-open"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "EXPORT_QUESTION_NOT_FOUND",
      );
    });
  });

  it("fails EXPORT_FILTER_EMPTY when skill filter has no questions", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:0.5", "linux:0.5:0.5"],
      });
      addQuestion(root, {
        skill: "linux",
        type: "open",
        difficulty: 0.3,
        text: "L",
        id: "q-linux-001",
      });
      assert.throws(
        () =>
          exportTest({
            startDir: root,
            profile: "platform",
            level: "middle",
            includeSkills: ["docker"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "EXPORT_FILTER_EMPTY",
      );
    });
  });

  it("preserves option order without shuffle-options", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.3,
        text: "Q",
        options: ["A", "B", "C", "D"],
        correct: 1,
        id: "q-docker-001",
      });
      const run = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
      });
      assert.deepEqual(run.document.questions[0]?.options, ["A", "B", "C", "D"]);
      assert.equal(run.document.questions[0]?.correct, 1);
      assert.equal(run.document.meta.optionShuffle, undefined);
    });
  });

  it("shuffles options with seed and remaps correct", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.3,
        text: "Q",
        options: ["A", "B", "C", "D"],
        correct: 1,
        id: "q-docker-001",
      });
      const a = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
        shuffleOptions: true,
        seed: 42,
      });
      const b = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
        shuffleOptions: true,
        seed: 42,
      });
      assert.deepEqual(a.document.meta.optionShuffle, { enabled: true, seed: 42 });
      assert.deepEqual(a.document.questions[0]?.options, b.document.questions[0]?.options);
      assert.equal(a.document.questions[0]?.correct, b.document.questions[0]?.correct);
      assert.equal(a.document.id, b.document.id);
      const opts = a.document.questions[0]!.options!;
      const correct = a.document.questions[0]!.correct as number;
      assert.equal(opts[correct - 1], "A");
      assert.deepEqual([...opts].sort(), ["A", "B", "C", "D"]);
    });
  });
});

describe("exportTest package identity", () => {
  it("skill filter changes id; skill edit changes revision not id", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker", description: "Container runtime".padEnd(50, ".") });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:0.5", "linux:0.5:0.5"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "Q",
        id: "q-docker-001",
      });

      const full = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
      });
      const filtered = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
        includeSkills: ["docker"],
      });
      assert.notEqual(full.document.id, filtered.document.id);

      writeYamlFile(join(root, "ontology/skills/docker.yaml"), {
        id: "docker",
        name: "Docker updated",
        description: "Updated container runtime description for teaching.",
        depends_on: [],
        related_to: [],
        topics: ["containers"],
      });

      const afterEdit = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
      });
      assert.equal(afterEdit.document.id, full.document.id);
      assert.notEqual(afterEdit.document.meta.revision, full.document.meta.revision);
    });
  });
});

describe("exportMatrix", () => {
  it("emits long-form cells for all role levels", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "platform",
        level: "junior",
        levelTitle: "Junior",
        requirementTriples: ["docker:0.3:1"],
      });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:0.5", "linux:0.5:0.5"],
      });

      const run = exportMatrix({ startDir: root, profile: "platform" });
      assert.equal(run.format, "csv");
      assert.equal(run.document.schemaVersion, EXPORT_MATRIX_SCHEMA);
      assert.deepEqual(run.document.levels, ["junior", "middle"]);
      assert.equal(run.document.cells.length, 3);
      assert.ok(run.csv?.startsWith("skill,level,depth,weight"));
      assert.ok(run.csv?.includes("docker,junior,0.3,1"));
    });
  });

  it("fails when a listed level file is missing", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      writeYamlFile(join(root, "certifications", "profiles", "platform.yaml"), {
        profile: "platform",
        title: "Platform",
        levels: ["middle", "senior"],
      });

      assert.throws(
        () => exportMatrix({ startDir: root, profile: "platform" }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "LEVEL_NOT_FOUND",
      );
    });
  });

  it("rejects invalid format", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      assert.throws(
        () => exportMatrix({ startDir: root, profile: "platform", format: "xml" }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "EXPORT_FORMAT_INVALID",
      );
    });
  });
});
