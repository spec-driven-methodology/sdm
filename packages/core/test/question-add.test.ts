import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import { addQuestion } from "../src/question-add.js";
import { addSkill } from "../src/skill-write.js";
import { writeYamlFile } from "../src/yaml.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("addQuestion", () => {
  it("writes a question under library/questions/", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker", topics: ["images"] });
      const result = addQuestion(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.4,
        text: "What does docker build do?",
        options: ["Build image", "Stop container", "Push image", "Pull image"],
        correct: 1,
        topics: ["images", "build"],
        id: "q-docker-001",
      });
      assert.equal(result.skill, "docker");
      assert.equal(result.question.id, "q-docker-001");
      assert.deepEqual(result.question.topics, ["images", "build"]);
      assert.ok(existsSync(result.path));
      assert.match(result.path, /library[/\\]questions[/\\]q-docker-001\.yaml$/);
    });
  });

  it("errors when skill is missing", async () => {
    await withTempProject((root) => {
      assert.throws(
        () =>
          addQuestion(root, {
            skill: "no-such-skill",
            type: "open",
            difficulty: 0.5,
            text: "Explain containers",
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "SKILL_NOT_FOUND",
      );
    });
  });

  it("writes open question with expected answers", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      const result = addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "What is an image?",
        expected: ["image", "Image"],
        id: "q-docker-open-001",
      });
      assert.deepEqual(result.question.expected, ["image", "Image"]);
    });
  });

  it("rejects empty expected", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      assert.throws(
        () =>
          addQuestion(root, {
            skill: "docker",
            type: "open",
            difficulty: 0.3,
            text: "What is an image?",
            expected: "   ",
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "VALIDATION_FAILED",
      );
    });
  });

  it("rejects expected on single_choice", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      assert.throws(
        () =>
          addQuestion(root, {
            skill: "docker",
            type: "single_choice",
            difficulty: 0.3,
            text: "Pick one",
            options: ["a", "b"],
            correct: 1,
            expected: "a",
          }),
        (err: unknown) =>
          err instanceof SdmError &&
          err.code === "VALIDATION_FAILED" &&
          /only allowed for type open/i.test(err.message),
      );
    });
  });

  it("strict distractorQuality rejects short distractors", async () => {
    await withTempProject((root) => {
      writeYamlFile(join(root, "sdm.yaml"), {
        version: "0.1",
        name: "test-methodology",
        quality: { distractorQuality: "strict" },
      });
      addSkill(root, { id: "docker", name: "Docker" });
      assert.throws(
        () =>
          addQuestion(root, {
            skill: "docker",
            type: "single_choice",
            difficulty: 0.3,
            text: "Pick one",
            options: [
              "A long correct explanation that stands out clearly",
              "no",
              "nah",
              "x",
            ],
            correct: 1,
            id: "q-docker-strict",
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "DISTRACTOR_QUALITY",
      );
      assert.equal(
        existsSync(join(root, "library", "questions", "q-docker-strict.yaml")),
        false,
      );
    });
  });

  it("soft distractorQuality still writes unbalanced options", async () => {
    await withTempProject((root) => {
      writeYamlFile(join(root, "sdm.yaml"), {
        version: "0.1",
        name: "test-methodology",
        quality: { distractorQuality: "soft" },
      });
      addSkill(root, { id: "docker", name: "Docker" });
      const result = addQuestion(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.3,
        text: "Pick one",
        options: [
          "A long correct explanation that stands out clearly",
          "no",
          "nah",
          "x",
        ],
        correct: 1,
        id: "q-docker-soft",
      });
      assert.ok(existsSync(result.path));
    });
  });
});
