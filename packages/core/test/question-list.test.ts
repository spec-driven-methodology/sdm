import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { listQuestions } from "../src/question-list.js";
import { addQuestion } from "../src/question-add.js";
import { addSkill } from "../src/skill-write.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("listQuestions", () => {
  it("lists all questions and filters by skill", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "What is a container?",
        id: "q-docker-001",
      });
      addQuestion(root, {
        skill: "linux",
        type: "open",
        difficulty: 0.4,
        text: "What is systemd?",
        id: "q-linux-001",
      });

      const all = listQuestions({ startDir: root });
      assert.equal(all.questions.length, 2);

      const dockerOnly = listQuestions({ startDir: root, skill: "docker" });
      assert.equal(dockerOnly.questions.length, 1);
      assert.equal(dockerOnly.questions[0]?.id, "q-docker-001");
      assert.equal(dockerOnly.skill, "docker");
    });
  });
});
