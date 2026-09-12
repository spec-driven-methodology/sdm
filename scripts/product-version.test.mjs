import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import {
  bumpParsedVersion,
  formatProductVersion,
  isValidProductVersion,
  parseProductVersion,
} from "./lib/product-version.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("product-version parse/format", () => {
  it("accepts stable and stage.build identities", () => {
    assert.deepEqual(parseProductVersion("0.8.0"), {
      major: 0,
      minor: 8,
      patch: 0,
      stage: null,
      build: null,
    });
    assert.equal(formatProductVersion(parseProductVersion("0.8.0-alpha.143")), "0.8.0-alpha.143");
    assert.ok(isValidProductVersion("0.8.0-beta.1"));
    assert.ok(isValidProductVersion("1.0.0-rc.12"));
  });

  it("rejects invalid identities", () => {
    assert.equal(isValidProductVersion("0.8.0-alpha"), false);
    assert.equal(isValidProductVersion("0.8.0-alpha.0"), false);
    assert.equal(isValidProductVersion("0.8.0-dev.1"), false);
    assert.equal(isValidProductVersion("0.8"), false);
  });
});

describe("product-version bump", () => {
  it("increments build within stage", () => {
    const next = bumpParsedVersion(parseProductVersion("0.8.0-alpha.143"), "build");
    assert.equal(formatProductVersion(next), "0.8.0-alpha.144");
  });

  it("switches stage and resets build", () => {
    const next = bumpParsedVersion(parseProductVersion("0.8.0-alpha.12"), "beta");
    assert.equal(formatProductVersion(next), "0.8.0-beta.1");
  });

  it("minor keeps stage and resets build", () => {
    const next = bumpParsedVersion(parseProductVersion("0.8.0-alpha.9"), "minor");
    assert.equal(formatProductVersion(next), "0.9.0-alpha.1");
  });

  it("stable strips prerelease", () => {
    const next = bumpParsedVersion(parseProductVersion("0.9.0-rc.3"), "stable");
    assert.equal(formatProductVersion(next), "0.9.0");
  });

  it("build on stable throws", () => {
    assert.throws(() => bumpParsedVersion(parseProductVersion("0.8.0"), "build"));
  });
});

describe("bump-version.mjs auto", () => {
  it("SDM_NO_BUMP_BUILD=1 leaves root version unchanged", () => {
    const before = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ).version;
    const result = spawnSync(
      process.execPath,
      [join(ROOT, "scripts/bump-version.mjs"), "auto"],
      {
        cwd: ROOT,
        env: { ...process.env, SDM_NO_BUMP_BUILD: "1" },
        encoding: "utf8",
      },
    );
    assert.equal(result.status, 0, result.stderr);
    const after = JSON.parse(
      readFileSync(join(ROOT, "package.json"), "utf8"),
    ).version;
    assert.equal(after, before);
    assert.match(result.stdout, /SDM_NO_BUMP_BUILD/);
  });
});
