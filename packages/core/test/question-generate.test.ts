import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import { generateQuestions } from "../src/question-generate.js";
import { addSkill } from "../src/skill-write.js";
import { addQuestion } from "../src/question-add.js";
import { seedCertification } from "./helpers/profile-fixture.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("generateQuestions", () => {
  it("returns context and draft stubs without writing files", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker", description: "Containers" });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.2,
        text: "Existing question about Docker",
        id: "q-docker-001",
      });

      const result = generateQuestions({
        startDir: root,
        skill: "docker",
        count: 2,
        difficultyMin: 0.3,
        difficultyMax: 0.5,
      });

      assert.equal(result.drafts.length, 2);
      assert.equal(result.context.existingCount, 1);
      assert.ok(result.context.agentPrompt.includes("Existing question"));
      assert.equal(result.drafts[0]?.skill, "docker");
      assert.equal(result.drafts[0]?.type, "single_choice");
      assert.ok(result.drafts[0]?.text.includes("[DRAFT"));
      assert.ok(Array.isArray(result.drafts[0]?.options));
    });
  });

  it("attaches gap status when role/level provided", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "pe",
        level: "mid",
        levelTitle: "Mid",
        requirementTriples: ["docker:0.5:0.5"],
      });

      const result = generateQuestions({
        startDir: root,
        skill: "docker",
        count: 1,
        profile: "pe",
        level: "mid",
      });

      assert.equal(result.context.gap?.status, "missing");
    });
  });

  it("errors when skill is missing", async () => {
    await withTempProject((root) => {
      assert.throws(
        () => generateQuestions({ startDir: root, skill: "nope", count: 1 }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "SKILL_NOT_FOUND",
      );
    });
  });

  it("mixed preset assigns varied draft types with expected on open", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      const result = generateQuestions({
        startDir: root,
        skill: "docker",
        count: 3,
        mix: "mixed",
      });
      assert.equal(result.typeMix, "mixed");
      assert.deepEqual(
        result.drafts.map((d) => d.type),
        ["single_choice", "multi_choice", "open"],
      );
      assert.ok(Array.isArray(result.drafts[0]?.options));
      assert.deepEqual(result.drafts[1]?.correct, [1, 2]);
      assert.equal(result.drafts[2]?.options, undefined);
      assert.ok(result.drafts[2]?.expected);
      assert.ok(result.context.agentPrompt.includes("--expected"));
    });
  });

  it("rejects type and mix together", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      assert.throws(
        () =>
          generateQuestions({
            startDir: root,
            skill: "docker",
            count: 1,
            type: "multi_choice",
            mix: "mixed",
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "TYPE_MIX_CONFLICT",
      );
    });
  });

  it("homogeneous --type multi_choice still works", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      const result = generateQuestions({
        startDir: root,
        skill: "docker",
        count: 2,
        type: "multi_choice",
      });
      assert.equal(result.typeMix, "single");
      assert.equal(result.drafts[0]?.type, "multi_choice");
      assert.equal(result.drafts[1]?.type, "multi_choice");
    });
  });
});
