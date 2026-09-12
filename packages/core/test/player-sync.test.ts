import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import { syncPlayerAssets } from "../src/player-sync.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("syncPlayerAssets", () => {
  it("creates player assets when missing", async () => {
    await withTempProject((root) => {
      rmSync(join(root, "player"), { recursive: true, force: true });
      const result = syncPlayerAssets({ projectRoot: root });
      assert.ok(existsSync(join(root, "player", "index.html")));
      assert.ok(result.created.some((p) => p.endsWith("index.html")));
    });
  });

  it("skips existing files without force", async () => {
    await withTempProject((root) => {
      const marker = join(root, "player", "index.html");
      writeFileSync(marker, "CUSTOM", "utf8");
      const result = syncPlayerAssets({ projectRoot: root, force: false });
      assert.equal(readFileSync(marker, "utf8"), "CUSTOM");
      assert.ok(result.skipped.some((p) => p.endsWith("index.html")));
    });
  });

  it("overwrites player files with force and leaves methodology alone", async () => {
    await withTempProject((root) => {
      const playerIndex = join(root, "player", "index.html");
      writeFileSync(playerIndex, "CUSTOM", "utf8");
      const skillDir = join(root, "ontology", "skills");
      mkdirSync(skillDir, { recursive: true });
      const skillFile = join(skillDir, "keep-me.yaml");
      writeFileSync(skillFile, "id: keep-me\nname: Keep\n", "utf8");

      const result = syncPlayerAssets({ projectRoot: root, force: true });
      assert.notEqual(readFileSync(playerIndex, "utf8"), "CUSTOM");
      assert.ok(result.created.some((p) => p.endsWith("index.html")));
      assert.equal(readFileSync(skillFile, "utf8"), "id: keep-me\nname: Keep\n");
      assert.ok(existsSync(join(root, "sdm.yaml")));
    });
  });

  it("fails outside a methodology project", () => {
    const orphan = join(
      process.env.TMPDIR || "/tmp",
      `sdm-player-sync-${Date.now()}`,
    );
    mkdirSync(orphan, { recursive: true });
    try {
      assert.throws(
        () => syncPlayerAssets({ projectRoot: orphan }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "NOT_A_PROJECT",
      );
    } finally {
      rmSync(orphan, { recursive: true, force: true });
    }
  });
});
