import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { addQuestion } from "../src/question-add.js";
import { addSkill } from "../src/skill-write.js";
import {
  buildStudioCoverageView,
  pushStudioCoverage,
} from "../src/studio-coverage.js";
import { seedCertification } from "./helpers/profile-fixture.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("studio coverage view", () => {
  it("builds coverage phase with Russian-oriented summary and statuses", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "platform-engineer",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.7:0.5", "linux:0.5:0.5"],
      });
      addQuestion(root, {
        skill: "docker",
        type: "open",
        difficulty: 0.3,
        text: "What is Docker?",
        id: "q-docker-001",
      });

      const view = buildStudioCoverageView({
        projectRoot: root,
        profile: "platform-engineer",
        level: "middle",
      });
      assert.equal(view.schemaVersion, "sdm.studio.view/v1");
      const phase = (view.phases as Array<Record<string, unknown>>)[0];
      assert.equal(phase.kind, "coverage");
      assert.match(String(phase.title), /[Пп]робел|[Пп]окрыт/);
      const summary = phase.summary as {
        missing: number;
        thin: number;
        ok: number;
      };
      assert.equal(summary.missing, 1);
      assert.equal(summary.thin, 1);
      const skills = phase.skills as Array<{ id: string; status: string }>;
      assert.ok(skills.some((s) => s.id === "linux" && s.status === "missing"));
      assert.ok(skills.some((s) => s.id === "docker" && s.status === "thin"));
      assert.ok(Array.isArray(phase.suggestions));
    });
  });

  it("push-coverage writes bridge current-view.json", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform-engineer",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.7:1"],
      });
      const result = pushStudioCoverage({
        projectRoot: root,
        profile: "platform-engineer",
        level: "middle",
      });
      assert.ok(existsSync(result.viewPath));
      const saved = JSON.parse(readFileSync(result.viewPath, "utf8"));
      assert.equal(saved.schemaVersion, "sdm.studio.view/v1");
      assert.equal(saved.phases[0].kind, "coverage");
    });
  });
});
