import assert from "node:assert/strict";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { SdmError } from "@spec-driven-methodology/core";
import {
  agentSkillsRoot,
  installAgentSkills,
  listAgentHosts,
  resolveAgentsRoot,
} from "../src/agent-hosts.js";

describe("agent hosts registry", () => {
  it("lists cursor, gigacode and multitool", () => {
    const ids = listAgentHosts().map((h) => h.id);
    assert.deepEqual(ids, ["cursor", "gigacode", "multitool"]);
  });
});

describe("agent skills install", () => {
  it("copies portable skills into cursor and gigacode roots", () => {
    const cursorRoot = mkdtempSync(join(tmpdir(), "sdm-agent-cursor-"));
    const gigacodeHome = mkdtempSync(join(tmpdir(), "sdm-agent-giga-"));
    const agentsRoot = resolveAgentsRoot();

    const result = installAgentSkills({
      hosts: ["cursor", "gigacode"],
      cursorRoot,
      gigacodeHome,
      agentsRoot,
    });

    assert.ok(result.skillIds.includes("intent-loop"));
    assert.ok(result.skillIds.includes("connect-mcp"));

    const cursorSkill = join(
      agentSkillsRoot("cursor", { cursorRoot }),
      "intent-loop",
      "SKILL.md",
    );
    const gigaSkill = join(
      agentSkillsRoot("gigacode", { gigacodeHome }),
      "intent-loop",
      "SKILL.md",
    );
    assert.ok(existsSync(cursorSkill));
    assert.ok(existsSync(gigaSkill));
    assert.ok(
      existsSync(join(agentSkillsRoot("cursor", { cursorRoot }), "sdm-AGENTS.md")),
    );

    const copied = result.installs.filter((i) => i.mode === "copied");
    assert.ok(copied.length >= result.skillIds.length * 2);
  });

  it("skips existing skills unless --force", () => {
    const cursorRoot = mkdtempSync(join(tmpdir(), "sdm-agent-skip-"));
    const agentsRoot = resolveAgentsRoot();
    installAgentSkills({
      hosts: ["cursor"],
      cursorRoot,
      agentsRoot,
    });
    const second = installAgentSkills({
      hosts: ["cursor"],
      cursorRoot,
      agentsRoot,
    });
    assert.ok(second.installs.every((i) => i.mode === "skipped"));

    const forced = installAgentSkills({
      hosts: ["cursor"],
      cursorRoot,
      agentsRoot,
      force: true,
    });
    assert.ok(forced.installs.some((i) => i.mode === "copied"));
  });

  it("fails when agents root has no skills", () => {
    const empty = mkdtempSync(join(tmpdir(), "sdm-agent-empty-"));
    mkdirSync(join(empty, "nope"), { recursive: true });
    writeFileSync(join(empty, "nope", "readme.txt"), "x");
    assert.throws(
      () =>
        installAgentSkills({
          hosts: ["cursor"],
          cursorRoot: mkdtempSync(join(tmpdir(), "sdm-agent-c-")),
          agentsRoot: empty,
        }),
      (err: unknown) => err instanceof SdmError && err.code === "AGENTS_NOT_FOUND",
    );
  });

  it("resolveAgentsRoot finds monorepo agents", () => {
    const root = resolveAgentsRoot();
    assert.ok(existsSync(join(root, "intent-loop", "SKILL.md")));
    const body = readFileSync(join(root, "intent-loop", "SKILL.md"), "utf8");
    assert.match(body, /intent-loop|clarify/i);
  });

  it("installs skills into multitool root", () => {
    const multitoolHome = mkdtempSync(join(tmpdir(), "sdm-agent-multi-"));
    const agentsRoot = resolveAgentsRoot();

    const result = installAgentSkills({
      hosts: ["multitool"],
      multitoolHome,
      agentsRoot,
    });

    assert.ok(result.skillIds.includes("intent-loop"));
    const multiSkill = join(
      agentSkillsRoot("multitool", { multitoolHome }),
      "intent-loop",
      "SKILL.md",
    );
    assert.ok(existsSync(multiSkill));
  });
});
