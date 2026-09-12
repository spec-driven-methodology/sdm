import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addTerm } from "../src/term-add.js";
import { listTerms } from "../src/term-list.js";
import { addSkill } from "../src/skill-write.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("term add/list", () => {
  it("writes and lists a term linked to a skill", () => {
    withTempProject((root) => {
      addSkill(root, {
        id: "ai-llm-basics",
        name: "LLM basics",
        description: "Basics.",
        topics: ["chat"],
      });

      const added = addTerm(root, {
        id: "mcp",
        term: "MCP",
        definition: "Model Context Protocol — интеграция инструментов с LLM.",
        aliases: ["Model Context Protocol"],
        skills: ["ai-llm-basics"],
        kind: "concept",
      });

      assert.equal(added.term.id, "mcp");
      assert.match(added.path, /library\/terms\/mcp\.yaml$/);

      const listed = listTerms({ startDir: root });
      assert.equal(listed.terms.length, 1);
      assert.equal(listed.terms[0]?.kind, "concept");
    });
  });
});
