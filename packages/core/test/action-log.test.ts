import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { describe, it, afterEach } from "node:test";
import {
  appendActionLog,
  redactForLog,
  rotateLogFile,
  actionLogDir,
} from "../src/action-log.js";

function tempProject(): string {
  const dir = mkdtempSync(join(tmpdir(), "sdm-log-"));
  writeFileSync(
    join(dir, "sdm.yaml"),
    "name: log-test\nversion: \"0.1\"\nsearch:\n  provider: none\n",
  );
  mkdirSync(join(dir, ".sdm"), { recursive: true });
  return dir;
}

function lastLine(path: string): Record<string, unknown> {
  const lines = readFileSync(path, "utf8").trim().split("\n");
  return JSON.parse(lines[lines.length - 1]!) as Record<string, unknown>;
}

describe("action-log", () => {
  const prev = process.env.SDM_LOG;
  afterEach(() => {
    if (prev === undefined) delete process.env.SDM_LOG;
    else process.env.SDM_LOG = prev;
  });

  it("redacts secret-like keys", () => {
    const out = redactForLog({ token: "abc", role: "dev" }) as Record<
      string,
      unknown
    >;
    assert.equal(out.token, "[REDACTED]");
    assert.equal(out.role, "dev");
  });

  it("writes success to sdm.log only", () => {
    delete process.env.SDM_LOG;
    const root = tempProject();
    appendActionLog({
      source: "cli",
      action: "doctor",
      args: { cwd: root },
      ok: true,
      durationMs: 3,
      projectRoot: root,
    });
    const main = join(actionLogDir(root), "sdm.log");
    const err = join(actionLogDir(root), "error.log");
    assert.ok(existsSync(main));
    assert.equal(existsSync(err), false);
    const row = lastLine(main);
    assert.equal(row.ok, true);
    assert.equal(row.action, "doctor");
    assert.equal(row.source, "cli");
  });

  it("duplicates failures into error.log", () => {
    delete process.env.SDM_LOG;
    const root = tempProject();
    appendActionLog({
      source: "mcp",
      action: "cert_gaps",
      ok: false,
      code: "LEVEL_NOT_FOUND",
      projectRoot: root,
    });
    const main = join(actionLogDir(root), "sdm.log");
    const err = join(actionLogDir(root), "error.log");
    assert.ok(existsSync(main));
    assert.ok(existsSync(err));
    assert.equal(lastLine(err).code, "LEVEL_NOT_FOUND");
  });

  it("disables via SDM_LOG=0", () => {
    process.env.SDM_LOG = "0";
    const root = tempProject();
    const result = appendActionLog({
      source: "cli",
      action: "doctor",
      ok: true,
      projectRoot: root,
    });
    assert.equal(result, null);
    assert.equal(existsSync(join(actionLogDir(root), "sdm.log")), false);
  });

  it("rotates when over maxBytes", () => {
    const root = tempProject();
    const dir = actionLogDir(root);
    mkdirSync(dir, { recursive: true });
    const path = join(dir, "sdm.log");
    writeFileSync(path, "x".repeat(100), "utf8");
    rotateLogFile(path, 3);
    assert.equal(existsSync(path), false);
    assert.ok(existsSync(`${path}.1`));
    assert.equal(statSync(`${path}.1`).size, 100);
  });

  it("no-ops outside methodology project", () => {
    delete process.env.SDM_LOG;
    const dir = mkdtempSync(join(tmpdir(), "sdm-nolog-"));
    const result = appendActionLog({
      source: "cli",
      action: "mcp.hosts",
      ok: true,
      startDir: dir,
    });
    assert.equal(result, null);
  });
});
