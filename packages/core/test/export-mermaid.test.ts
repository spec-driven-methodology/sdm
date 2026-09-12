import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import {
  EXPORT_MERMAID_SCHEMA,
  exportMermaid,
  mermaidNodeId,
} from "../src/export-mermaid.js";
import { addQuestion } from "../src/question-add.js";
import { seedCertification } from "./helpers/profile-fixture.js";
import { addSkill, linkSkill } from "../src/skill-write.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("exportMermaid", () => {
  it("builds nodes, depends_on edges, and coverage classes", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "java-core", name: "Java" });
      addSkill(root, { id: "spring", name: "Spring" });
      linkSkill(root, "spring", { dependsOn: ["java-core"] });
      seedCertification(root, {
        profile: "backend",
        level: "middle",
        levelTitle: "Middle Backend",
        requirementTriples: ["java-core:0.8:0.5", "spring:0.6:0.5"],
      });
      // 3 questions at depth ≥0.8 → java-core ok; spring missing
      for (let i = 1; i <= 3; i++) {
        addQuestion(root, {
          skill: "java-core",
          type: "open",
          difficulty: 0.8,
          text: `Q${i}`,
          id: `q-jc-00${i}`,
        });
      }

      const run = exportMermaid({
        startDir: root,
        profile: "backend",
        level: "middle",
      });

      assert.equal(run.format, "markdown");
      assert.equal(run.document.schemaVersion, EXPORT_MERMAID_SCHEMA);
      assert.equal(run.document.coverage, true);
      assert.deepEqual(
        run.document.nodes.map((n) => n.skill),
        ["java-core", "spring"],
      );
      assert.equal(run.document.nodes[0]?.status, "ok");
      assert.equal(run.document.nodes[1]?.status, "missing");
      assert.deepEqual(run.document.edges, [{ from: "spring", to: "java-core" }]);
      assert.ok(run.document.mermaid.includes("flowchart LR"));
      assert.ok(run.document.mermaid.includes("classDef ok"));
      assert.ok(run.document.mermaid.includes(`class ${mermaidNodeId("java-core")} ok`));
      assert.ok(run.document.mermaid.includes(`class ${mermaidNodeId("spring")} missing`));
      assert.ok(run.document.markdown.includes("```mermaid"));
      assert.ok(run.document.markdown.includes(run.document.mermaid.trimEnd()));
    });
  });

  it("omits coverage classes when coverage is false", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "platform",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1"],
      });

      const run = exportMermaid({
        startDir: root,
        profile: "platform",
        level: "middle",
        coverage: false,
      });
      assert.equal(run.document.coverage, false);
      assert.equal(run.document.nodes[0]?.status, undefined);
      assert.ok(!run.document.mermaid.includes("classDef"));
    });
  });

  it("fails when level is missing", async () => {
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
          exportMermaid({
            startDir: root,
            profile: "platform",
            level: "senior",
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "LEVEL_NOT_FOUND",
      );
    });
  });
});
