import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import { addSkill } from "../src/skill-write.js";
import { seedCertification } from "./helpers/profile-fixture.js";
import { reweightCertification } from "../src/cert-reweight.js";
import { loadLevel } from "../src/loaders.js";
import { withTempProject } from "./helpers/temp-project.js";
import { sumWeights, weightSumIsValid } from "../src/weights.js";

describe("reweightCertification", () => {
  it("transfers weight from donor to target", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "kubernetes", name: "K8s" });
      seedCertification(root, {
        profile: "pe",
        level: "mid",
        levelTitle: "Mid",
        requirementTriples: ["docker:0.5:0.6", "kubernetes:0.4:0.4"],
      });

      const result = reweightCertification(root, {
        level: "mid",
        skill: "kubernetes",
        delta: 0.1,
        from: ["docker"],
      });

      assert.equal(result.action, "reweight");
      assert.equal(result.before.docker, 0.6);
      assert.equal(result.after.docker, 0.5);
      assert.equal(result.after.kubernetes, 0.5);
      assert.ok(
        weightSumIsValid(sumWeights(Object.values(result.after))),
      );
      assert.equal(result.transfers[0]?.from, "docker");
    });
  });

  it("replaces full weight map with --set", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "pe",
        level: "mid",
        levelTitle: "Mid",
        requirementTriples: ["docker:0.5:0.5", "linux:0.4:0.5"],
      });

      reweightCertification(root, {
        level: "mid",
        set: ["docker=0.7", "linux=0.3"],
      });
      const level = loadLevel(root, "mid");
      assert.equal(level.requirements.find((r) => r.skill === "docker")?.weight, 0.7);
      assert.equal(level.requirements.find((r) => r.skill === "linux")?.weight, 0.3);
    });
  });

  it("rejects insufficient donor", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "kubernetes", name: "K8s" });
      seedCertification(root, {
        profile: "pe",
        level: "mid",
        levelTitle: "Mid",
        requirementTriples: ["docker:0.5:0.2", "kubernetes:0.4:0.8"],
      });
      assert.throws(
        () =>
          reweightCertification(root, {
            level: "mid",
            skill: "kubernetes",
            delta: 0.5,
            from: ["docker"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "WEIGHT_DONOR_INSUFFICIENT",
      );
    });
  });

  it("rejects incomplete set map", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "pe",
        level: "mid",
        levelTitle: "Mid",
        requirementTriples: ["docker:0.5:0.5", "linux:0.4:0.5"],
      });
      assert.throws(
        () =>
          reweightCertification(root, {
            level: "mid",
            set: ["docker=1"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "WEIGHT_SUM_INVALID",
      );
    });
  });
});
