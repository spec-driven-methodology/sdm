import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import { addQuestion } from "../src/question-add.js";
import { validateQuestionDraft } from "../src/question-validate.js";
import { addSkill } from "../src/skill-write.js";
import { writeYamlFile } from "../src/yaml.js";
import { join } from "node:path";
import { withTempProject } from "./helpers/temp-project.js";

describe("validateQuestionDraft / writeGate", () => {
  it("passes balanced choice draft with writeGate off", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "docker",
        name: "Docker",
        topics: ["images"],
        description: "Container images and builds for runtime",
      });
      const result = validateQuestionDraft(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.4,
        text: "What does docker build do?",
        options: [
          "Build an image from a Dockerfile",
          "Stop a running container",
          "Push an image to a registry",
          "Pull an image from a registry",
        ],
        correct: 1,
        topics: ["images"],
      });
      assert.equal(result.ok, true);
      assert.equal(result.errors.length, 0);
    });
  });

  it("strict writeGate rejects topic not on skill", async () => {
    await withTempProject((root) => {
      writeYamlFile(join(root, "sdm.yaml"), {
        version: "0.1",
        name: "test-methodology",
        search: { provider: "none" },
        quality: { writeGate: "strict" },
      });
      addSkill(root, {
        id: "docker",
        name: "Docker",
        topics: ["images"],
        description: "Container images and builds for runtime",
      });
      const result = validateQuestionDraft(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.4,
        text: "Explain networking in Docker",
        topics: ["networking"],
      });
      assert.equal(result.ok, false);
      assert.ok(result.errors.some((e) => e.code === "TOPIC_NOT_ON_SKILL"));
    });
  });

  it("strict writeGate rejects near-duplicate on add", async () => {
    await withTempProject((root) => {
      writeYamlFile(join(root, "sdm.yaml"), {
        version: "0.1",
        name: "test-methodology",
        search: { provider: "none" },
        quality: { writeGate: "strict", nearDupThreshold: 0.5 },
      });
      addSkill(root, {
        id: "docker",
        name: "Docker",
        topics: ["images"],
        description: "Container images and builds for runtime",
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.4,
        text: "What is a Docker image and how is it layered?",
        id: "q-docker-001",
        topics: ["images"],
      });
      assert.throws(
        () =>
          addQuestion(root, {
            skill: "docker",
            type: "open",
            difficulty: 0.5,
            text: "What is a Docker image and how is it layered on disk?",
            topics: ["images"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "QUESTION_NEAR_DUPLICATE",
      );
    });
  });

  it("soft writeGate writes with findings for short distractors via writeGate", async () => {
    await withTempProject((root) => {
      writeYamlFile(join(root, "sdm.yaml"), {
        version: "0.1",
        name: "test-methodology",
        search: { provider: "none" },
        quality: { writeGate: "soft" },
      });
      addSkill(root, {
        id: "docker",
        name: "Docker",
        topics: ["images"],
        description: "Container images and builds for runtime",
      });
      const long =
        "Build an image from a Dockerfile using the build context and tags";
      const result = addQuestion(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.4,
        text: "What does docker build do primarily?",
        options: [long, "x", "y", "z"],
        correct: 1,
        topics: ["images"],
      });
      assert.ok(result.warnings?.some((w) => w.code === "DISTRACTOR_QUALITY"));
    });
  });
});
