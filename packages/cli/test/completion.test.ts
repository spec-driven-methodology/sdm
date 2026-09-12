import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { Command } from "commander";
import {
  installCompletion,
  parseShellArg,
  registerCompletion,
  renderCompletionScript,
  stripLegacyCompletionLines,
  upsertRcBlock,
} from "../src/completion.js";

function sampleProgram(): Command {
  const program = new Command();
  program.name("sdm").description("test");
  program.command("doctor").description("Validate project");
  const skill = program.command("skill").description("Ontology skill commands");
  skill.command("add").description("Add a skill");
  skill.command("link").description("Link skills");
  const exp = program.command("export").description("Export commands");
  exp.command("test").description("Export test pack");
  registerCompletion(program);
  return program;
}

describe("completion", () => {
  it("parseShellArg accepts zsh/bash/fish", () => {
    assert.equal(parseShellArg("zsh"), "zsh");
    assert.equal(parseShellArg("BASH"), "bash");
    assert.equal(parseShellArg("fish"), "fish");
  });

  it("parseShellArg rejects unknown shells", () => {
    assert.throws(() => parseShellArg("powershell"), /Unsupported shell/);
  });

  it("zsh script lists top-level and nested commands", () => {
    const script = renderCompletionScript("zsh", sampleProgram());
    assert.match(script, /compdef _sdm sdm/);
    assert.match(script, /'doctor:Validate project'/);
    assert.match(script, /'skill:Ontology skill commands'/);
    assert.match(script, /'add:Add a skill'/);
    assert.match(script, /'export:Export commands'/);
    assert.match(script, /'test:Export test pack'/);
  });

  it("bash script uses compgen for top-level and nested", () => {
    const script = renderCompletionScript("bash", sampleProgram());
    assert.match(script, /complete -F _sdm_completions sdm/);
    assert.match(script, /compgen -W "doctor skill export completion"/);
    assert.match(script, /compgen -W "add link"/);
  });

  it("fish script registers subcommands", () => {
    const script = renderCompletionScript("fish", sampleProgram());
    assert.match(script, /complete -c sdm -n "__fish_use_subcommand" -a "skill"/);
    assert.match(
      script,
      /complete -c sdm -n "__fish_seen_subcommand_from skill" -a "add"/,
    );
  });

  it("stripLegacyCompletionLines removes one-liner eval installs", () => {
    const cleaned = stripLegacyCompletionLines(
      ['export FOO=1', 'eval "$(sdm completion zsh)"', "export BAR=2", ""].join(
        "\n",
      ),
    );
    assert.equal(cleaned.includes("sdm completion"), false);
    assert.match(cleaned, /export FOO=1/);
  });

  it("upsertRcBlock is idempotent and updates managed markers", () => {
    const dir = mkdtempSync(join(tmpdir(), "sdm-rc-"));
    const rc = join(dir, ".zshrc");
    writeFileSync(rc, "# existing\n", "utf8");

    const block1 = [
      "# >>> sdm completion >>>",
      'source "/tmp/a"',
      "# <<< sdm completion <<<",
      "",
    ].join("\n");
    assert.equal(upsertRcBlock(rc, block1), true);
    assert.match(readFileSync(rc, "utf8"), /source "\/tmp\/a"/);

    const block2 = [
      "# >>> sdm completion >>>",
      'source "/tmp/b"',
      "# <<< sdm completion <<<",
      "",
    ].join("\n");
    assert.equal(upsertRcBlock(rc, block2), true);
    const text = readFileSync(rc, "utf8");
    assert.match(text, /source "\/tmp\/b"/);
    assert.equal(text.includes("source \"/tmp/a\""), false);
    assert.equal((text.match(/>>> sdm completion >>>/g) ?? []).length, 1);

    assert.equal(upsertRcBlock(rc, block2), false);
  });

  it("installCompletion writes script and hooks zshrc under custom home", () => {
    const home = mkdtempSync(join(tmpdir(), "sdm-home-"));
    mkdirSync(join(home, ".sdm"), { recursive: true });

    const first = installCompletion(sampleProgram(), {
      shell: "zsh",
      homeDir: home,
    });
    assert.equal(first.ok, true);
    assert.equal(first.wroteScript, true);
    assert.equal(first.updatedRc, true);
    assert.match(readFileSync(first.scriptPath, "utf8"), /compdef _sdm sdm/);
    assert.match(readFileSync(first.rcPath!, "utf8"), />>> sdm completion >>>/);

    const second = installCompletion(sampleProgram(), {
      shell: "zsh",
      homeDir: home,
    });
    assert.equal(second.wroteScript, false);
    assert.equal(second.updatedRc, false);
  });

  it("installCompletion skips when CI and respectSkipEnv", () => {
    const prev = process.env.CI;
    process.env.CI = "1";
    try {
      const home = mkdtempSync(join(tmpdir(), "sdm-ci-"));
      const result = installCompletion(sampleProgram(), {
        shell: "zsh",
        homeDir: home,
        respectSkipEnv: true,
      });
      assert.equal(result.skipped, true);
      assert.equal(result.wroteScript, false);
    } finally {
      if (prev === undefined) delete process.env.CI;
      else process.env.CI = prev;
    }
  });
});
