import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { SdmError } from "@spec-driven-methodology/core";
import {
  hostConfigPath,
  installMcpHosts,
  listHosts,
  resolveHosts,
  resolveHostsFromCli,
} from "../src/mcp-hosts.js";

describe("mcp hosts registry", () => {
  it("lists cursor, gigacode and multitool", () => {
    const ids = listHosts().map((h) => h.id);
    assert.deepEqual(ids, ["cursor", "gigacode", "multitool"]);
  });

  it("resolves csv and all", () => {
    assert.deepEqual(resolveHosts("cursor,gigacode,multitool"), ["cursor", "gigacode", "multitool"]);
    assert.deepEqual(resolveHosts("all"), ["cursor", "gigacode", "multitool"]);
    assert.deepEqual(resolveHosts("gigacode,gigacode"), ["gigacode"]);
  });

  it("rejects unknown host", () => {
    assert.throws(
      () => resolveHosts("claude"),
      (err: unknown) => err instanceof SdmError && err.code === "UNKNOWN_HOST",
    );
  });
});

describe("mcp host install", () => {
  it("writes cursor mcp.json without binding a project by default", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-mcp-cursor-"));

    const result = installMcpHosts({
      hosts: ["cursor"],
      cursorRoot: root,
    });

    assert.equal(result.installs.length, 1);
    assert.equal(result.installs[0]!.host, "cursor");
    const parsed = JSON.parse(readFileSync(result.installs[0]!.path, "utf8")) as {
      mcpServers: { SDM: { args: string[]; env?: { SDM_PROJECT_ROOT: string } } };
    };
    assert.ok(parsed.mcpServers.SDM.args[0]);
    assert.equal(parsed.mcpServers.SDM.args.length, 1); // no --project
    assert.equal(parsed.mcpServers.SDM.env?.SDM_PROJECT_ROOT, undefined);
    assert.equal(result.config.projectRoot, null);
    assert.equal(result.config.serverName, "SDM");
  });

  it("optionally bakes SDM_PROJECT_ROOT when --project is set", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-mcp-cursor-proj-"));
    const project = mkdtempSync(join(tmpdir(), "sdm-mcp-proj-"));
    writeFileSync(
      join(project, "sdm.yaml"),
      "name: t\nversion: 0.1.0\nsearch:\n  provider: none\n",
    );

    const result = installMcpHosts({
      hosts: ["cursor"],
      cursorRoot: root,
      projectDir: project,
    });

    const parsed = JSON.parse(readFileSync(result.installs[0]!.path, "utf8")) as {
      mcpServers: { SDM: { args: string[]; env?: { SDM_PROJECT_ROOT: string } } };
    };
    assert.equal(parsed.mcpServers.SDM.args.length, 3);
    assert.equal(parsed.mcpServers.SDM.args[1], "--project");
    assert.equal(parsed.mcpServers.SDM.args[2], project);
    assert.equal(parsed.mcpServers.SDM.env?.SDM_PROJECT_ROOT, project); // still there as fallback
  });

  it("migrates legacy mcpServers.sdm to SDM on default install", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-mcp-migrate-"));
    const mcpPath = join(root, ".cursor", "mcp.json");
    mkdirSync(join(root, ".cursor"), { recursive: true });
    writeFileSync(
      mcpPath,
      JSON.stringify(
        {
          mcpServers: {
            sdm: { command: "node", args: ["/old/sdm-mcp.js"] },
          },
        },
        null,
        2,
      ),
    );

    installMcpHosts({ hosts: ["cursor"], cursorRoot: root });

    const parsed = JSON.parse(readFileSync(mcpPath, "utf8")) as {
      mcpServers: Record<string, unknown>;
    };
    assert.ok(parsed.mcpServers.SDM);
    assert.equal(parsed.mcpServers.sdm, undefined);
  });

  it("merges gigacode settings under overridden home", () => {
    const home = mkdtempSync(join(tmpdir(), "sdm-mcp-home-"));
    const gigacodeHome = join(home, ".gigacode");
    mkdirSync(gigacodeHome, { recursive: true });
    writeFileSync(
      join(gigacodeHome, "settings.json"),
      JSON.stringify({ theme: "dark", mcpServers: { other: { command: "x" } } }, null, 2),
    );

    const result = installMcpHosts({
      hosts: ["gigacode"],
      projectDir: process.cwd(),
      gigacodeHome,
    });

    const parsed = JSON.parse(readFileSync(result.installs[0]!.path, "utf8")) as {
      theme: string;
      mcpServers: Record<string, unknown>;
    };
    assert.equal(parsed.theme, "dark");
    assert.ok(parsed.mcpServers.other);
    assert.ok(parsed.mcpServers.SDM);
  });

  it("merges multitool opencode.json with type=local", () => {
    const multitoolHome = mkdtempSync(join(tmpdir(), "sdm-mcp-multitool-"));
    writeFileSync(
      join(multitoolHome, "opencode.json"),
      JSON.stringify({ shell: "zsh", mcp: { other: { type: "remote", url: "https://x" } } }, null, 2),
    );

    const result = installMcpHosts({
      hosts: ["multitool"],
      projectDir: process.cwd(),
      multitoolHome,
    });

    const parsed = JSON.parse(readFileSync(result.installs[0]!.path, "utf8")) as {
      shell: string;
      mcp: Record<string, { type: string; command?: string[]; environment?: Record<string, string> }>;
    };
    assert.equal(parsed.shell, "zsh");
    assert.equal(parsed.mcp.other.type, "remote");
    const sdm = parsed.mcp.SDM;
    assert.ok(sdm);
    assert.equal(sdm.type, "local");
    assert.ok(Array.isArray(sdm.command));
    assert.equal(sdm.command[0].length, sdm.command[0].length); // command[0] = node path
  });

  it("installs multiple hosts", () => {
    const root = mkdtempSync(join(tmpdir(), "sdm-mcp-multi-"));
    const gigacodeHome = mkdtempSync(join(tmpdir(), "sdm-mcp-giga-"));
    const result = installMcpHosts({
      hosts: ["cursor", "gigacode"],
      cursorRoot: root,
      gigacodeHome,
    });
    assert.equal(result.installs.length, 2);
    assert.equal(
      hostConfigPath("cursor", { cursorRoot: root }),
      join(root, ".cursor", "mcp.json"),
    );
    assert.equal(
      hostConfigPath("gigacode", { gigacodeHome }),
      join(gigacodeHome, "settings.json"),
    );
  });
});

describe("resolveHostsFromCli", () => {
  it("requires hosts when non-tty", async () => {
    await assert.rejects(
      () => resolveHostsFromCli({ isTty: false }),
      (err: unknown) => err instanceof SdmError && err.code === "HOSTS_REQUIRED",
    );
  });

  it("accepts --cursor alias", async () => {
    const hosts = await resolveHostsFromCli({ cursor: true, isTty: false });
    assert.deepEqual(hosts, ["cursor"]);
  });

  it("tty default cursor when empty prompt", async () => {
    const hosts = await resolveHostsFromCli({
      isTty: true,
      prompt: async () => "",
    });
    assert.deepEqual(hosts, ["cursor"]);
  });
});
