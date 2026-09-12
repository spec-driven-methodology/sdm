import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addQuestion, addSkill, rebuildSemanticIndex, searchSemanticIndex } from "../src/index.js";
import { writeYamlFile } from "../src/yaml.js";
import { join } from "node:path";
import { withTempProject } from "./helpers/temp-project.js";

describe("semantic index", () => {
  it("rebuilds and searches deterministically without network", async () => {
    await withTempProject(async (root) => {
      writeYamlFile(join(root, "sdm.yaml"), { version: "0.1", name: "test", search: { provider: "lancedb" } });
      addSkill(root, { id: "docker", name: "Docker containers" });
      addQuestion(root, { id: "q-docker", skill: "docker", type: "open", difficulty: 0.3, text: "What is a Docker container?" });
      rebuildSemanticIndex(root);
      assert.equal(searchSemanticIndex(root, "docker container", "question").hits[0]?.id, "q-docker");
    });
  });
  it("rejects disabled search", async () => {
    await withTempProject(async (root) => {
      assert.throws(() => rebuildSemanticIndex(root), { code: "SEARCH_DISABLED" });
    });
  });
});
