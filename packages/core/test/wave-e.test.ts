import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { addSkill } from "../src/skill-write.js";
import { seedCertification } from "./helpers/profile-fixture.js";
import { addQuestion } from "../src/question-add.js";
import { resolveLevelForTeam } from "../src/teams.js";
import { exportTest } from "../src/export.js";
import { exportConfluence } from "../src/export-confluence.js";
import { runCertCoverage } from "../src/cert-coverage.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("teams / adaptive / confluence", () => {
  it("applies team level overrides to coverage", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.3:1"],
      });
      mkdirSync(join(root, "certifications", "teams"), { recursive: true });
      writeFileSync(
        join(root, "certifications", "teams", "sre.yaml"),
        [
          "id: sre",
          "profile: platform",
          "title: SRE",
          "level_overrides:",
          "  middle:",
          "    requirements:",
          "      - skill: linux",
          "        depth: 0.5",
          "        weight: 1",
          "",
        ].join("\n"),
        "utf8",
      );
      const { level } = resolveLevelForTeam(root, "platform", "middle", "sre");
      assert.equal(level.requirements[0]?.skill, "linux");
      const cov = runCertCoverage({
        startDir: root,
        profile: "platform",
        level: "middle",
        team: "sre",
      });
      assert.equal(cov.result.skills[0]?.skill, "linux");
    });
  });

  it("samples adaptively with deterministic seed", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });
      for (let i = 1; i <= 5; i++) {
        addQuestion(root, {
          skill: "docker",
          type: "open",
          difficulty: 0.1 * i,
          text: `Q${i}`,
          id: `q-d-${i}`,
        });
      }
      const a = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
        adaptive: true,
        seed: 7,
        perSkill: 2,
      });
      const b = exportTest({
        startDir: root,
        profile: "platform",
        level: "middle",
        adaptive: true,
        seed: 7,
        perSkill: 2,
      });
      assert.equal(a.document.questions.length, 2);
      assert.deepEqual(
        a.document.meta.selectedIds,
        b.document.meta.selectedIds,
      );
    });
  });

  it("builds confluence markdown", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle Platform",
        requirementTriples: ["docker:0.5:1"],
      });
      const run = exportConfluence({
        startDir: root,
        profile: "platform",
        level: "middle",
      });
      assert.equal(run.document.schemaVersion, "sdm.export.confluence/v1");
      assert.ok(run.document.markdown.includes("## Coverage"));
      assert.ok(run.document.markdown.includes("```mermaid"));
    });
  });
});
