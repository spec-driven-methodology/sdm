import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import { syncStudioAssets } from "../src/studio-sync.js";
import { withTempProject } from "./helpers/temp-project.js";

describe("syncStudioAssets", () => {
  it("creates studio assets when missing", async () => {
    await withTempProject((root) => {
      rmSync(join(root, "studio"), { recursive: true, force: true });
      const result = syncStudioAssets({ projectRoot: root });
      assert.ok(existsSync(join(root, "studio", "index.html")));
      assert.ok(existsSync(join(root, "studio", "fixtures", "demo-view.json")));
      assert.ok(result.created.some((p) => p.endsWith("index.html")));
    });
  });

  it("skips existing files without force", async () => {
    await withTempProject((root) => {
      const marker = join(root, "studio", "index.html");
      mkdirSync(join(root, "studio"), { recursive: true });
      writeFileSync(marker, "CUSTOM", "utf8");
      const result = syncStudioAssets({ projectRoot: root, force: false });
      assert.equal(readFileSync(marker, "utf8"), "CUSTOM");
      assert.ok(result.skipped.some((p) => p.endsWith("index.html")));
    });
  });

  it("overwrites studio files with force and leaves methodology and player alone", async () => {
    await withTempProject((root) => {
      const studioIndex = join(root, "studio", "index.html");
      mkdirSync(join(root, "studio"), { recursive: true });
      writeFileSync(studioIndex, "CUSTOM", "utf8");
      const skillDir = join(root, "ontology", "skills");
      mkdirSync(skillDir, { recursive: true });
      const skillFile = join(skillDir, "keep-me.yaml");
      writeFileSync(skillFile, "id: keep-me\nname: Keep\n", "utf8");
      const playerIndex = join(root, "player", "index.html");
      const playerBefore = existsSync(playerIndex)
        ? readFileSync(playerIndex, "utf8")
        : null;

      const result = syncStudioAssets({ projectRoot: root, force: true });
      assert.notEqual(readFileSync(studioIndex, "utf8"), "CUSTOM");
      assert.ok(result.created.some((p) => p.endsWith("index.html")));
      assert.equal(readFileSync(skillFile, "utf8"), "id: keep-me\nname: Keep\n");
      assert.ok(existsSync(join(root, "sdm.yaml")));
      if (playerBefore !== null) {
        assert.equal(readFileSync(playerIndex, "utf8"), playerBefore);
      }
    });
  });

  it("fails outside a methodology project", () => {
    const orphan = join(
      process.env.TMPDIR || "/tmp",
      `sdm-studio-sync-${Date.now()}`,
    );
    mkdirSync(orphan, { recursive: true });
    try {
      assert.throws(
        () => syncStudioAssets({ projectRoot: orphan }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "NOT_A_PROJECT",
      );
    } finally {
      rmSync(orphan, { recursive: true, force: true });
    }
  });
});
