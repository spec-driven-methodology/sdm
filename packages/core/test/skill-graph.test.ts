import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import {
  assertAcyclicDepends,
  buildSkillGraph,
  detectCycles,
  withProposedDepends,
} from "../src/skill-graph.js";
import { addSkill, linkSkill } from "../src/skill-write.js";
import type { Skill } from "../src/schemas.js";
import { withTempProject } from "./helpers/temp-project.js";

function skill(
  id: string,
  depends_on: string[] = [],
): Skill {
  return {
    id,
    name: id,
    description: "",
    depends_on,
    related_to: [],
    topics: [],
  };
}

describe("skill-graph", () => {
  it("detects no cycles on a DAG", () => {
    const graph = buildSkillGraph([
      skill("a", ["b"]),
      skill("b", ["c"]),
      skill("c", []),
    ]);
    assert.deepEqual(detectCycles(graph), []);
    assert.doesNotThrow(() => assertAcyclicDepends(graph));
  });

  it("detects a simple cycle", () => {
    const graph = buildSkillGraph([
      skill("a", ["b"]),
      skill("b", ["a"]),
    ]);
    const cycles = detectCycles(graph);
    assert.ok(cycles.length >= 1);
    assert.throws(
      () => assertAcyclicDepends(graph),
      (err: unknown) =>
        err instanceof SdmError && err.code === "CYCLE_DETECTED",
    );
  });

  it("withProposedDepends previews a cycle", () => {
    const graph = buildSkillGraph([
      skill("a", ["b"]),
      skill("b", []),
    ]);
    const proposed = withProposedDepends(graph, "b", ["a"]);
    assert.ok(detectCycles(proposed).length >= 1);
  });
});

describe("linkSkill cycle guard", () => {
  it("rejects a link that would create a cycle", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "a", name: "A" });
      addSkill(root, { id: "b", name: "B" });
      linkSkill(root, "a", { dependsOn: ["b"] });
      assert.throws(
        () => linkSkill(root, "b", { dependsOn: ["a"] }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "CYCLE_DETECTED",
      );
    });
  });

  it("allows an acyclic link", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "a", name: "A" });
      addSkill(root, { id: "b", name: "B" });
      addSkill(root, { id: "c", name: "C" });
      linkSkill(root, "a", { dependsOn: ["b"] });
      const linked = linkSkill(root, "b", { dependsOn: ["c"] });
      assert.deepEqual(linked.skill.depends_on, ["c"]);
    });
  });
});
