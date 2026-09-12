import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { resolveAgentsRoot } from "../src/agent-hosts.js";
import { wireMcpHosts } from "../src/host-wire.js";

describe("wireMcpHosts", () => {
  it("writes MCP and portable skills by default", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-wire-"));
    const result = wireMcpHosts({
      hosts: ["cursor"],
      cursorRoot: root,
      agentsRoot: resolveAgentsRoot(),
    });

    assert.equal(result.skills?.ok, true);
    assert.ok(result.skills?.skillIds.includes("intent-loop"));
    const mcp = JSON.parse(readFileSync(result.installs[0]!.path, "utf8")) as {
      mcpServers: { SDM: { args: string[]; env?: { SDM_PROJECT_ROOT: string } } };
    };
    assert.equal(mcp.mcpServers.SDM.args.length, 1); // entry only, no --project
    assert.equal(mcp.mcpServers.SDM.env?.SDM_PROJECT_ROOT, undefined);
    assert.ok(
      existsSync(join(root, ".cursor", "skills", "intent-loop", "SKILL.md")),
    );
  });

  it("skips skills when withSkills is false", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-wire-noskills-"));
    const result = wireMcpHosts({
      hosts: ["cursor"],
      cursorRoot: root,
      withSkills: false,
    });
    assert.equal(result.skills, null);
    assert.ok(existsSync(result.installs[0]!.path));
    assert.equal(
      existsSync(join(root, ".cursor", "skills", "intent-loop")),
      false,
    );
  });

  it("clears stale SDM_PROJECT_ROOT on reinstall without project", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-wire-clear-"));
    const mcpPath = join(root, ".cursor", "mcp.json");
    mkdirSync(join(root, ".cursor"), { recursive: true });
    writeFileSync(
      mcpPath,
      JSON.stringify(
        {
          mcpServers: {
            SDM: {
              command: "node",
              args: ["/old.js"],
              env: { SDM_PROJECT_ROOT: "/old/playground" },
            },
          },
        },
        null,
        2,
      ),
    );

    const result = wireMcpHosts({
      hosts: ["cursor"],
      cursorRoot: root,
      withSkills: false,
    });

    const parsed = JSON.parse(readFileSync(result.installs[0]!.path, "utf8")) as {
      mcpServers: { SDM: { args: string[]; env?: { SDM_PROJECT_ROOT: string } } };
    };
    assert.equal(parsed.mcpServers.SDM.args.length, 1); // entry only — no stale --project
    assert.equal(parsed.mcpServers.SDM.args[0].includes("--project"), false);
    assert.equal(parsed.mcpServers.SDM.env?.SDM_PROJECT_ROOT, undefined);
    assert.equal(result.config.projectRoot, null);
  });
});
