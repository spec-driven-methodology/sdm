import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import { exportTest } from "../src/export.js";
import { addQuestion } from "../src/question-add.js";
import { addSkill, linkSkill } from "../src/skill-write.js";
import { seedCertification } from "./helpers/profile-fixture.js";
import { runSkillGraph, runSkillImpact } from "../src/skill-graph-ops.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("runSkillGraph / runSkillImpact", () => {
  it("builds a coverage graph for a role/level", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "java-core", name: "Java Core" });
      addSkill(root, { id: "spring", name: "Spring" });
      linkSkill(root, "spring", { dependsOn: ["java-core"] });
      seedCertification(root, {
        profile: "java-developer",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["java-core:0.8:0.5", "spring:0.6:0.5"],
      });

      const run = runSkillGraph({
        startDir: root,
        profile: "java-developer",
        level: "middle",
      });
      assert.equal(run.document.schemaVersion, "sdm.skill.graph/v1");
      assert.ok(run.document.nodes.some((n) => n.skill === "java-core"));
      assert.ok(run.document.text.includes("java-core"));
    });
  });

  it("reports impact of a base skill", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "java-core", name: "Java Core" });
      addSkill(root, { id: "spring", name: "Spring" });
      linkSkill(root, "spring", { dependsOn: ["java-core"] });
      seedCertification(root, {
        profile: "java-developer",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["spring:0.6:1"],
      });

      const run = runSkillImpact({ startDir: root, skill: "java-core" });
      assert.equal(run.document.schemaVersion, "sdm.skill.impact/v2");
      assert.deepEqual(run.document.downstreamSkills, ["spring"]);
      assert.ok(run.document.levels.some((l) => l.level === "middle"));
      assert.ok(Array.isArray(run.document.questions));
      assert.ok(Array.isArray(run.document.exports));
    });
  });

  it("lists questions and exports in impact", async () => {
    await withTempProject((root) => {
      addSkill(root, {
        id: "java-core",
        name: "Java Core",
        topics: ["t"],
        description: "Core",
      });
      seedCertification(root, {
        profile: "java-developer",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["java-core:0.8:1"],
      });
      const q = addQuestion(root, {
        skill: "java-core",
        difficulty: 0.4,
        type: "open",
        text: "Q?",
        expected: "a",
        topics: ["t"],
      });
      const exported = exportTest({
        startDir: root,
        profile: "java-developer",
        level: "middle",
        format: "json",
      });
      mkdirSync(join(root, "exports"), { recursive: true });
      writeFileSync(
        join(root, "exports", "test.json"),
        JSON.stringify(exported.document),
        "utf8",
      );

      const run = runSkillImpact({ startDir: root, skill: "java-core" });
      assert.ok(run.document.questions.some((x) => x.id === q.question.id));
      assert.ok(run.document.exports.some((e) => e.path === "exports/test.json"));
    });
  });

  it("errors on missing skill for impact", async () => {
    await withTempProject((root) => {
      assert.throws(
        () => runSkillImpact({ startDir: root, skill: "nope" }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "SKILL_NOT_FOUND",
      );
    });
  });
});
