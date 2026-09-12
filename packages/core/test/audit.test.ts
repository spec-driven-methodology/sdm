import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  addQuestion,
  addSkill,
  findLexicalDuplicates,
  loadLevel,
  runMethodologyAudit,
} from "../src/index.js";
import { writeYamlFile } from "../src/yaml.js";
import { seedCertification } from "./helpers/profile-fixture.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("methodology audit", () => {
  it("detects same-skill lexical duplicates", () => {
    const duplicates = findLexicalDuplicates(
      [
        { id: "one", skill: "docker", difficulty: 0.2, type: "open", text: "How do Docker containers work?", topics: [] },
        { id: "two", skill: "docker", difficulty: 0.3, type: "open", text: "How do Docker containers work?", topics: [] },
      ],
      0.85,
    );
    assert.deepEqual(duplicates, [{ leftId: "one", rightId: "two", similarity: 1 }]);
  });

  it("includes coverage recommendations", async () => {
    await withTempProject(async (root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      const run = runMethodologyAudit({ startDir: root, profile: "platform", level: "middle" });
      assert.equal(run.document.coverage?.hasMissing, true);
      assert.ok(run.document.recommendations.some((r) => r.message.includes('skill "docker"')));
    });
  });

  it("reports invalid weight sums on levels", async () => {
    await withTempProject(async (root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:0.5", "linux:0.4:0.5"],
      });
      const level = loadLevel(root, "middle");
      writeYamlFile(join(root, "certifications", "levels", "middle.yaml"), {
        ...level,
        requirements: [
          { skill: "docker", depth: 0.5, weight: 0.6 },
          { skill: "linux", depth: 0.4, weight: 0.6 },
        ],
      });
      const run = runMethodologyAudit({ startDir: root });
      assert.equal(run.document.certifications?.weightSumInvalid.length, 1);
      assert.equal(run.document.certifications?.weightSumInvalid[0]?.level, "middle");
      assert.ok(
        run.document.recommendations.some((r) =>
          r.message.includes("cert reweight"),
        ),
      );
    });
  });

  it("does not report weight findings when sums are valid", async () => {
    await withTempProject(async (root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      const run = runMethodologyAudit({ startDir: root });
      assert.deepEqual(run.document.certifications?.weightSumInvalid, []);
    });
  });

  it("recommends diversifying mono-type libraries", async () => {
    await withTempProject(async (root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      for (let i = 1; i <= 3; i += 1) {
        addQuestion(root, {
          skill: "docker",
          type: "single_choice",
          difficulty: 0.3,
          text: `Docker question number ${i} with unique wording`,
          options: ["a", "b"],
          correct: 1,
          id: `q-docker-00${i}`,
        });
      }
      const run = runMethodologyAudit({ startDir: root });
      assert.ok(
        run.document.recommendations.some(
          (r) =>
            r.priority === "low" &&
            r.message.includes('Skill "docker"') &&
            r.message.includes("--mix mixed"),
        ),
      );
    });
  });

  it("skips mono-type recommendation when types vary", async () => {
    await withTempProject(async (root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addQuestion(root, {
        skill: "docker",
        type: "single_choice",
        difficulty: 0.3,
        text: "Single choice about Docker layers",
        options: ["a", "b"],
        correct: 1,
        id: "q-docker-001",
      });
      addQuestion(root, {
        skill: "docker",
        type: "multi_choice",
        difficulty: 0.4,
        text: "Multi choice about Docker networking",
        options: ["a", "b", "c"],
        correct: [1, 2],
        id: "q-docker-002",
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.5,
        text: "Open question about Docker volumes",
        expected: "volume",
        id: "q-docker-003",
      });
      const run = runMethodologyAudit({ startDir: root });
      assert.ok(
        !run.document.recommendations.some((r) =>
          r.message.includes("--mix mixed"),
        ),
      );
    });
  });

  it("reports position and length bias when distractorQuality is soft", async () => {
    await withTempProject(async (root) => {
      writeYamlFile(join(root, "sdm.yaml"), {
        version: "0.1",
        name: "test-methodology",
        quality: { distractorQuality: "soft" },
      });
      addSkill(root, { id: "docker", name: "Docker" });
      for (let i = 1; i <= 5; i += 1) {
        addQuestion(root, {
          skill: "docker",
          type: "single_choice",
          difficulty: 0.3,
          text: `Biased docker question number ${i}`,
          options: [
            "A long correct explanation that is clearly the right choice here",
            "no",
            "nah",
            "nope",
          ],
          correct: 1,
          id: `q-docker-00${i}`,
        });
      }
      const run = runMethodologyAudit({ startDir: root });
      assert.ok(run.document.library.optionPositionBias);
      assert.equal(run.document.library.optionPositionBias?.share, 1);
      assert.ok(
        (run.document.library.optionLengthOutliers?.length ?? 0) >= 5,
      );
      assert.ok(
        run.document.recommendations.some((r) =>
          r.message.includes("position bias"),
        ),
      );
      assert.ok(
        run.document.recommendations.some((r) =>
          r.message.includes("length outliers"),
        ),
      );
    });
  });

  it("skips option bias findings when distractorQuality is off", async () => {
    await withTempProject(async (root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      for (let i = 1; i <= 5; i += 1) {
        addQuestion(root, {
          skill: "docker",
          type: "single_choice",
          difficulty: 0.3,
          text: `Biased docker question number ${i}`,
          options: [
            "A long correct explanation that is clearly the right choice here",
            "no",
            "nah",
            "nope",
          ],
          correct: 1,
          id: `q-docker-00${i}`,
        });
      }
      const run = runMethodologyAudit({ startDir: root });
      assert.equal(run.document.library.optionPositionBias, undefined);
      assert.equal(run.document.library.optionLengthOutliers, undefined);
    });
  });
});
