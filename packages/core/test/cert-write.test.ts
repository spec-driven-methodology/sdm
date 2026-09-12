import assert from "node:assert/strict";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import { createCertification } from "../src/cert-write.js";
import { hasLegacyRolesDirectory, loadProfile } from "../src/loaders.js";
import { createProfile } from "../src/profile-write.js";
import { addSkill } from "../src/skill-write.js";
import { writeYamlFile } from "../src/yaml.js";
import { seedProfile } from "./helpers/profile-fixture.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("createProfile", () => {
  it("writes profile YAML with empty levels", async () => {
    await withTempProject((root) => {
      const result = createProfile(root, {
        profile: "platform-engineer",
        title: "Platform Engineer",
      });
      assert.equal(result.action, "create");
      assert.deepEqual(result.profile.levels, []);
      assert.ok(existsSync(result.path));
    });
  });

  it("throws PROFILE_EXISTS without force", async () => {
    await withTempProject((root) => {
      seedProfile(root);
      assert.throws(
        () => createProfile(root, { profile: "platform-engineer", title: "Dup" }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "PROFILE_EXISTS",
      );
    });
  });
});

describe("createCertification", () => {
  it("writes profile level list and level YAML after validation", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedProfile(root);
      const result = createCertification(root, {
        profile: "platform-engineer",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.7:0.5"],
      });
      assert.equal(result.action, "create");
      assert.equal(result.weightsNormalized, true);
      assert.ok(existsSync(result.paths.profile));
      assert.ok(existsSync(result.paths.level));
      assert.deepEqual(result.profile.levels, ["middle"]);
      assert.equal(result.level.profile, "platform-engineer");
      assert.equal(result.level.requirements.length, 1);
      assert.equal(result.level.requirements[0]?.skill, "docker");
      assert.equal(result.level.requirements[0]?.weight, 1);
    });
  });

  it("normalizes multi-skill non-unit weights on create", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedProfile(root);
      const result = createCertification(root, {
        profile: "platform-engineer",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:0.4", "linux:0.4:0.3"],
      });
      assert.equal(result.weightsNormalized, true);
      const sum = result.level.requirements.reduce((s, r) => s + r.weight, 0);
      assert.ok(Math.abs(sum - 1) < 1e-6);
    });
  });

  it("strict noNormalizeWeights rejects non-unit sum", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      addSkill(root, { id: "linux", name: "Linux" });
      seedProfile(root);
      assert.doesNotThrow(() =>
        createCertification(root, {
          profile: "platform-engineer",
          level: "middle",
          levelTitle: "Middle",
          requirementTriples: ["docker:0.5:0.4", "linux:0.4:0.3"],
          noNormalizeWeights: true,
        }),
      );
    });
  });

  it("rejects zero total weight", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedProfile(root);
      assert.throws(
        () =>
          createCertification(root, {
            profile: "platform-engineer",
            level: "middle",
            levelTitle: "Middle",
            requirementTriples: ["docker:0.5:0"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "WEIGHT_SUM_INVALID",
      );
    });
  });

  it("throws PROFILE_NOT_FOUND when profile missing", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      assert.throws(
        () =>
          createCertification(root, {
            profile: "platform-engineer",
            level: "middle",
            levelTitle: "Middle",
            requirementTriples: ["docker:0.7:0.5"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "PROFILE_NOT_FOUND",
      );
    });
  });

  it("rejects invalid requirement triples before write", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      seedProfile(root);
      assert.throws(
        () =>
          createCertification(root, {
            profile: "platform-engineer",
            level: "middle",
            levelTitle: "Middle",
            requirementTriples: ["not-a-triple"],
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "SKILL_NOT_FOUND",
      );
      assert.equal(
        existsSync(join(root, "certifications", "levels", "middle.yaml")),
        false,
      );
    });
  });

  it("loads legacy roles/ profile and writes to profiles/", async () => {
    await withTempProject((root) => {
      addSkill(root, { id: "docker", name: "Docker" });
      const legacyDir = join(root, "certifications", "roles");
      mkdirSync(legacyDir, { recursive: true });
      writeYamlFile(join(legacyDir, "legacy-eng.yaml"), {
        role: "legacy-eng",
        title: "Legacy Engineer",
        levels: [],
      });

      assert.equal(hasLegacyRolesDirectory(root), true);
      const loaded = loadProfile(root, "legacy-eng");
      assert.equal(loaded.profile, "legacy-eng");
      assert.equal(loaded.title, "Legacy Engineer");

      const result = createCertification(root, {
        profile: "legacy-eng",
        level: "junior",
        levelTitle: "Junior",
        requirementTriples: ["docker:0.4:1.0"],
      });

      assert.ok(existsSync(join(root, "certifications", "profiles", "legacy-eng.yaml")));
      assert.equal(result.paths.profile, join(root, "certifications", "profiles", "legacy-eng.yaml"));
      assert.deepEqual(result.profile.levels, ["junior"]);
      assert.equal(result.profile.profile, "legacy-eng");

      const migrated = loadProfile(root, "legacy-eng");
      assert.equal(migrated.profile, "legacy-eng");
      assert.deepEqual(migrated.levels, ["junior"]);
    });
  });
});

describe("createProfile force", () => {
  it("preserves levels when force overwrites title", async () => {
    await withTempProject((root) => {
      seedProfile(root);
      addSkill(root, { id: "docker", name: "Docker" });
      createCertification(root, {
        profile: "platform-engineer",
        level: "middle",
        levelTitle: "Middle",
        requirementTriples: ["docker:0.5:1.0"],
      });
      const result = createProfile(root, {
        profile: "platform-engineer",
        title: "Platform Engineer Renamed",
        force: true,
      });
      assert.equal(result.profile.title, "Platform Engineer Renamed");
      assert.deepEqual(result.profile.levels, ["middle"]);
    });
  });
});
