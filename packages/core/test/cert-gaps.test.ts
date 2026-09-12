import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runCertGaps } from "../src/cert-gaps.js";
import { addQuestion } from "../src/question-add.js";
import { addSkill } from "../src/skill-write.js";
import { seedCertification } from "./helpers/profile-fixture.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("runCertGaps", () => {
  it("returns only missing and thin skills", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "platform-engineer",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.7:0.5", "linux:0.5:0.5"],
      });

      // thin for docker (1 < 3), missing for linux (0)
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "What is Docker?",
        id: "q-docker-001",
      });

      const { gaps, result } = runCertGaps({
        startDir: root,
        profile: "platform-engineer",
        level: "middle",
      });

      assert.equal(result.skills.length, 2);
      assert.equal(gaps.length, 2);
      assert.deepEqual(
        gaps.map((g) => g.status).sort(),
        ["missing", "thin"],
      );
    });
  });
});
