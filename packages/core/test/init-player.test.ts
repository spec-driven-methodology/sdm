import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { withTempProject } from "./helpers/temp-project.js";

describe("initMethodologyProject player scaffold", () => {
  it("copies player assets without --with-examples", async () => {
    await withTempProject((root) => {
      assert.ok(existsSync(join(root, "player", "index.html")));
      assert.ok(existsSync(join(root, "player", "app.js")));
      assert.ok(existsSync(join(root, "player", "styles.css")));
      assert.ok(existsSync(join(root, "player", "README.md")));
    });
  });

  it("copies studio assets without --with-examples", async () => {
    await withTempProject((root) => {
      assert.ok(existsSync(join(root, "studio", "index.html")));
      assert.ok(existsSync(join(root, "studio", "app.js")));
      assert.ok(existsSync(join(root, "studio", "styles.css")));
      assert.ok(existsSync(join(root, "studio", "README.md")));
      assert.ok(existsSync(join(root, "studio", "fixtures", "demo-view.json")));
      const readme = readFileSync(join(root, "README.md"), "utf8");
      assert.match(readme, /studio\//);
      const gitignore = readFileSync(join(root, ".gitignore"), "utf8");
      assert.match(gitignore, /\.sdm\/studio\//);
    });
  });

  it("documents host wire via mcp install in README and AGENTS", async () => {
    await withTempProject((root) => {
      const readme = readFileSync(join(root, "README.md"), "utf8");
      const agents = readFileSync(join(root, "AGENTS.md"), "utf8");
      assert.match(readme, /mcp install/);
      assert.match(readme, /Host setup/i);
      assert.match(agents, /mcp install/);
      assert.match(agents, /connect-mcp|GETTING_STARTED/);
    });
  });
});
