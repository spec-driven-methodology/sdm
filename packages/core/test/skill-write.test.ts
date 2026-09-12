import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import { addSkill, linkSkill } from "../src/skill-write.js";
import { loadSkill } from "../src/skills.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("addSkill / linkSkill", () => {
  it("creates a skill YAML and links depends_on", async () => {
    await withTempProject((root) => {
      const added = addSkill(root, {
        id: "skill-a",
        name: "Skill A",
        category: "infra",
      });
      assert.equal(added.action, "add");
      assert.ok(existsSync(added.path));

      addSkill(root, { id: "skill-b", name: "Skill B" });
      const linked = linkSkill(root, "skill-a", { dependsOn: ["skill-b"] });
      assert.equal(linked.action, "link");
      assert.deepEqual(linked.skill.depends_on, ["skill-b"]);

      const reloaded = loadSkill(root, "skill-a");
      assert.deepEqual(reloaded.depends_on, ["skill-b"]);
    });
  });

  it("errors when link target skill is missing", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "skill-a", name: "Skill A" });
      assert.throws(
        () => linkSkill(root, "skill-a", { dependsOn: ["missing-skill"] }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "SKILL_NOT_FOUND",
      );
    });
  });
});
