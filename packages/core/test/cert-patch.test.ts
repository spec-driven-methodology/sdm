import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import { addSkill } from "../src/skill-write.js";
import { seedCertification } from "./helpers/profile-fixture.js";
import { patchCertification } from "../src/cert-patch.js";
import { loadLevel } from "../src/loaders.js";
import { withTempProject } from "./helpers/temp-project.js";
import { sumWeights, weightSumIsValid } from "../src/weights.js";

describe("patchCertification", () => {
  it("adds with --from transfer and can set depth", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "pe",
        level: "mid",
        levelTitle: "Mid",
        requirementTriples: ["docker:0.5:1.0"],
      });

      const patched = patchCertification(root, {
        level: "mid",
        addTriples: ["linux:0.4:0.4"],
        fromTransfers: ["docker:0.4"],
        setTriples: ["docker:0.8:0.6"],
      });

      assert.equal(patched.action, "patch");
      assert.deepEqual(patched.added, ["linux"]);
      assert.deepEqual(patched.updated, ["docker"]);
      const level = loadLevel(root, "mid");
      assert.equal(level.requirements.length, 2);
      assert.equal(
        level.requirements.find((r) => r.skill === "docker")?.depth,
        0.8,
      );
      assert.ok(
        weightSumIsValid(sumWeights(level.requirements.map((r) => r.weight))),
      );
    });
  });

  it("removes a requirement with absorb-into", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "pe",
        level: "mid",
        levelTitle: "Mid",
        requirementTriples: ["docker:0.5:0.6", "linux:0.4:0.4"],
      });

      const patched = patchCertification(root, {
        level: "mid",
        removeSkills: ["linux"],
        absorbInto: "docker",
      });
      assert.deepEqual(patched.removed, ["linux"]);
      const level = loadLevel(root, "mid");
      assert.equal(level.requirements.length, 1);
      assert.equal(level.requirements[0]?.weight, 1);
    });
  });

  it("rejects add without transfer", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "pe",
        level: "mid",
        levelTitle: "Mid",
        requirementTriples: ["docker:0.5:1.0"],
      });
      assert.throws(
        () =>
          patchCertification(root, {
            level: "mid",
            addTriples: ["linux:0.4:0.1"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "WEIGHT_TRANSFER_REQUIRED",
      );
    });
  });

  it("rejects remove without absorb-into", async () => {
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
          patchCertification(root, {
            level: "mid",
            removeSkills: ["linux"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "WEIGHT_TRANSFER_REQUIRED",
      );
    });
  });

  it("rejects insufficient donor", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "sql", name: "SQL" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedCertification(root, {
        profile: "pe",
        level: "mid",
        levelTitle: "Mid",
        requirementTriples: ["docker:0.5:0.2", "sql:0.4:0.8"],
      });
      assert.throws(
        () =>
          patchCertification(root, {
            level: "mid",
            addTriples: ["linux:0.4:0.5"],
            fromTransfers: ["docker:0.5"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "WEIGHT_DONOR_INSUFFICIENT",
      );
    });
  });

  it("rejects add when skill already present", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedCertification(root, {
        profile: "pe",
        level: "mid",
        levelTitle: "Mid",
        requirementTriples: ["docker:0.5:1.0"],
      });
      assert.throws(
        () =>
          patchCertification(root, {
            level: "mid",
            addTriples: ["docker:0.9:0.1"],
            fromTransfers: ["docker:0.1"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "REQUIREMENT_EXISTS",
      );
    });
  });
});
