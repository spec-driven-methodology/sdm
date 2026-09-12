import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { SdmError } from "../src/errors.js";
import {
  pullStudioAction,
  pushStudioView,
  startStudioServe,
  studioBridgePaths,
  writeStudioActionFile,
} from "../src/studio-bridge.js";
import { syncStudioAssets } from "../src/studio-sync.js";
import { withTempProject } from "./helpers/temp-project.js";

const demoView = {
  schemaVersion: "sdm.studio.view/v1",
  id: "t",
  phases: [{ kind: "plan", id: "p", plan: { schema: "sdm.intent.plan/v1" } }],
};

const demoAction = {
  schemaVersion: "sdm.studio.action/v1",
  type: "confirm_plan",
  at: "2026-07-25T00:00:00.000Z",
};

describe("studio bridge", () => {
  it("push-view writes current-view.json", async () => {
    await withTempProject((root) => {
      const result = pushStudioView({
        projectRoot: root,
        raw: JSON.stringify(demoView),
      });
      assert.ok(existsSync(result.viewPath));
      const saved = JSON.parse(readFileSync(result.viewPath, "utf8"));
      assert.equal(saved.schemaVersion, "sdm.studio.view/v1");
      assert.equal(saved.id, "t");
    });
  });

  it("rejects invalid view schema and leaves no invalid file", async () => {
    await withTempProject((root) => {
      const paths = studioBridgePaths(root);
      assert.throws(
        () =>
          pushStudioView({
            projectRoot: root,
            raw: JSON.stringify({ schemaVersion: "nope", phases: [] }),
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "STUDIO_VIEW_INVALID",
      );
      assert.equal(existsSync(paths.viewPath), false);
    });
  });

  it("pull-action returns null then consume clears", async () => {
    await withTempProject((root) => {
      const empty = pullStudioAction({ projectRoot: root });
      assert.equal(empty.action, null);

      writeStudioActionFile(root, JSON.stringify(demoAction));
      const once = pullStudioAction({ projectRoot: root, consume: true });
      assert.equal(once.action?.type, "confirm_plan");
      assert.equal(once.consumed, true);

      const again = pullStudioAction({ projectRoot: root });
      assert.equal(again.action, null);
    });
  });

  it("studio sync --force does not clear bridge files", async () => {
    await withTempProject((root) => {
      pushStudioView({ projectRoot: root, raw: JSON.stringify(demoView) });
      const paths = studioBridgePaths(root);
      const before = readFileSync(paths.viewPath, "utf8");
      syncStudioAssets({ projectRoot: root, force: true });
      assert.equal(readFileSync(paths.viewPath, "utf8"), before);
    });
  });

  it("serve exposes bridge status/view/action on localhost", async () => {
    await withTempProject(async (root) => {
      pushStudioView({ projectRoot: root, raw: JSON.stringify(demoView) });
      const handle = await startStudioServe({ projectRoot: root, port: 0 });
      try {
        const addr = handle.server.address();
        assert.ok(addr && typeof addr === "object");
        const port = addr.port;
        const base = `http://127.0.0.1:${port}`;

        const status = await fetch(`${base}/bridge/status`);
        assert.equal(status.status, 200);
        const statusBody = (await status.json()) as {
          bridge: boolean;
          player: boolean;
        };
        assert.equal(statusBody.bridge, true);
        assert.equal(statusBody.player, true);

        const view = await fetch(`${base}/bridge/view`);
        assert.equal(view.status, 200);
        const viewBody = (await view.json()) as { id: string };
        assert.equal(viewBody.id, "t");

        const playerPage = await fetch(`${base}/player/index.html`);
        assert.equal(playerPage.status, 200);
        const playerHtml = await playerPage.text();
        assert.match(playerHtml, /SDM/i);

        const post = await fetch(`${base}/bridge/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(demoAction),
        });
        assert.equal(post.status, 200);
        const pulled = pullStudioAction({ projectRoot: root });
        assert.equal(pulled.action?.type, "confirm_plan");
        assert.ok(existsSync(join(root, "player", "index.html")));
      } finally {
        await handle.close();
      }
    });
  });

  it("fails outside a methodology project", () => {
    const orphan = join(
      process.env.TMPDIR || "/tmp",
      `sdm-studio-bridge-${Date.now()}`,
    );
    mkdirSync(orphan, { recursive: true });
    try {
      assert.throws(
        () =>
          pushStudioView({
            projectRoot: orphan,
            raw: JSON.stringify(demoView),
          }),
        (err: unknown) =>
          err instanceof SdmError && err.code === "NOT_A_PROJECT",
      );
    } finally {
      rmSync(orphan, { recursive: true, force: true });
    }
  });
});
