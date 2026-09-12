import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { Command } from "commander";

export type ShellId = "zsh" | "bash" | "fish";

type CmdNode = {
  name: string;
  description: string;
  subcommands: CmdNode[];
};

export type InstallCompletionOptions = {
  shell?: ShellId;
  homeDir?: string;
  quiet?: boolean;
  dryRun?: boolean;
  /** Skip when CI=1 / SDM_SKIP_COMPLETION=1 (build hooks). */
  respectSkipEnv?: boolean;
};

export type InstallCompletionResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  shell: ShellId;
  scriptPath: string;
  rcPath: string | null;
  wroteScript: boolean;
  updatedRc: boolean;
};

const BEGIN_MARK = "# >>> sdm completion >>>";
const END_MARK = "# <<< sdm completion <<<";

function shellWords(value: string): string {
  return value.replace(/'/g, "'\\''");
}

function walkCommands(cmd: Command): CmdNode[] {
  return cmd.commands
    .filter((child) => {
      const name = child.name();
      return Boolean(name) && name !== "help";
    })
    .map((child) => ({
      name: child.name(),
      description: child.description() || child.name(),
      subcommands: walkCommands(child),
    }));
}

export function detectShell(envShell = process.env.SHELL ?? ""): ShellId {
  if (envShell.includes("fish")) return "fish";
  if (envShell.includes("bash")) return "bash";
  return "zsh";
}

function renderZsh(bin: string, tree: CmdNode[]): string {
  const top = tree
    .map((c) => `    '${shellWords(c.name)}:${shellWords(c.description)}'`)
    .join("\n");

  const nestedCases = tree
    .filter((c) => c.subcommands.length > 0)
    .map((c) => {
      const subs = c.subcommands
        .map((s) => `        '${shellWords(s.name)}:${shellWords(s.description)}'`)
        .join("\n");
      const deeper = c.subcommands
        .filter((s) => s.subcommands.length > 0)
        .map((s) => {
          const deepSubs = s.subcommands
            .map((d) => `            '${shellWords(d.name)}:${shellWords(d.description)}'`)
            .join("\n");
          return `          ${s.name})
            local -a __subs
            __subs=(
${deepSubs}
            )
            _describe -t commands '${bin} ${c.name} ${s.name}' __subs
            ;;`;
        })
        .join("\n");

      return `      ${c.name})
        if (( CURRENT == 2 )); then
          local -a __subs
          __subs=(
${subs}
          )
          _describe -t commands '${bin} ${c.name}' __subs
        else
          case $words[2] in
${deeper || "          *) ;;"}
          esac
        fi
        ;;`;
    })
    .join("\n");

  return `# SDM shell completion for zsh (managed by \`sdm completion install\`)

_${bin}() {
  local curcontext="$curcontext" state line
  typeset -A opt_args

  _arguments -C \\
    '1: :->cmds' \\
    '*::arg:->args'

  case $state in
    cmds)
      local -a commands
      commands=(
${top}
      )
      _describe -t commands '${bin} commands' commands
      ;;
    args)
      case $words[1] in
${nestedCases}
      esac
      ;;
  esac
}

compdef _${bin} ${bin}
`;
}

function renderBash(bin: string, tree: CmdNode[]): string {
  const topNames = tree.map((c) => c.name).join(" ");
  const cases = tree
    .filter((c) => c.subcommands.length > 0)
    .map((c) => {
      const subs = c.subcommands.map((s) => s.name).join(" ");
      const nested = c.subcommands
        .filter((s) => s.subcommands.length > 0)
        .map((s) => {
          const deep = s.subcommands.map((d) => d.name).join(" ");
          return `      ${s.name})
        COMPREPLY=( $(compgen -W "${deep}" -- "$cur") )
        return 0
        ;;`;
        })
        .join("\n");

      return `    ${c.name})
      if [[ \${COMP_CWORD} -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "${subs}" -- "$cur") )
        return 0
      fi
      case "\${COMP_WORDS[2]}" in
${nested || "      *) ;;"}
      esac
      ;;`;
    })
    .join("\n");

  return `# SDM shell completion for bash (managed by \`sdm completion install\`)

_${bin}_completions() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  local cmd="\${COMP_WORDS[1]}"

  if [[ \${COMP_CWORD} -eq 1 ]]; then
    COMPREPLY=( $(compgen -W "${topNames}" -- "$cur") )
    return 0
  fi

  case "$cmd" in
${cases}
  esac
}

complete -F _${bin}_completions ${bin}
`;
}

function renderFish(bin: string, tree: CmdNode[]): string {
  const lines: string[] = [
    `# SDM shell completion for fish (managed by \`sdm completion install\`)`,
    ``,
    `complete -c ${bin} -f`,
  ];

  for (const c of tree) {
    lines.push(
      `complete -c ${bin} -n "__fish_use_subcommand" -a "${c.name}" -d "${shellWords(c.description)}"`,
    );
    for (const s of c.subcommands) {
      lines.push(
        `complete -c ${bin} -n "__fish_seen_subcommand_from ${c.name}" -a "${s.name}" -d "${shellWords(s.description)}"`,
      );
      for (const d of s.subcommands) {
        lines.push(
          `complete -c ${bin} -n "__fish_seen_subcommand_from ${c.name}; and __fish_seen_subcommand_from ${s.name}" -a "${d.name}" -d "${shellWords(d.description)}"`,
        );
      }
    }
  }

  return `${lines.join("\n")}\n`;
}

export function renderCompletionScript(shell: ShellId, program: Command): string {
  const bin = program.name() || "sdm";
  const tree = walkCommands(program);
  switch (shell) {
    case "zsh":
      return renderZsh(bin, tree);
    case "bash":
      return renderBash(bin, tree);
    case "fish":
      return renderFish(bin, tree);
    default: {
      const _exhaustive: never = shell;
      return _exhaustive;
    }
  }
}

export function parseShellArg(raw: string | undefined): ShellId {
  const value = (raw ?? detectShell()).toLowerCase();
  if (value === "zsh" || value === "bash" || value === "fish") return value;
  throw new Error(`Unsupported shell "${raw}". Use: zsh | bash | fish`);
}

function completionsDir(home: string): string {
  return join(home, ".sdm", "completions");
}

export function completionScriptPath(shell: ShellId, home = homedir()): string {
  const base = completionsDir(home);
  switch (shell) {
    case "zsh":
      return join(base, "sdm.zsh");
    case "bash":
      return join(base, "sdm.bash");
    case "fish":
      return join(home, ".config", "fish", "completions", "sdm.fish");
  }
}

export function shellRcPath(shell: ShellId, home = homedir()): string | null {
  switch (shell) {
    case "zsh":
      return join(home, ".zshrc");
    case "bash":
      return join(home, ".bashrc");
    case "fish":
      // fish loads ~/.config/fish/completions/*.fish automatically
      return null;
  }
}

function rcSourceBlock(shell: ShellId, scriptPath: string): string {
  if (shell === "fish") return "";
  return [
    BEGIN_MARK,
    `# Updated by: sdm completion install (do not edit between markers)`,
    `[[ -r ${JSON.stringify(scriptPath)} ]] && source ${JSON.stringify(scriptPath)}`,
    END_MARK,
    "",
  ].join("\n");
}

/** Remove earlier one-liner installs so we don't double-register completion. */
export function stripLegacyCompletionLines(rcText: string): string {
  return rcText
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      return !(
        t === 'eval "$(sdm completion zsh)"' ||
        t === "eval \"$(sdm completion zsh)\"" ||
        t === 'eval "$(sdm completion bash)"' ||
        t === "eval \"$(sdm completion bash)\"" ||
        t === 'eval "$(sdm completion fish)"' ||
        t === "eval \"$(sdm completion fish)\""
      );
    })
    .join("\n");
}

/**
 * Upsert a managed marker block in shell rc. Returns whether the file changed.
 */
export function upsertRcBlock(rcPath: string, block: string, dryRun = false): boolean {
  const raw = existsSync(rcPath) ? readFileSync(rcPath, "utf8") : "";
  const existing = stripLegacyCompletionLines(raw);
  const begin = existing.indexOf(BEGIN_MARK);
  const end = existing.indexOf(END_MARK);

  let next: string;
  if (begin !== -1 && end !== -1 && end > begin) {
    const afterEnd = end + END_MARK.length;
    const suffix = existing.slice(afterEnd).replace(/^\n/, "");
    next = `${existing.slice(0, begin)}${block}${suffix}`;
  } else if (existing.includes(BEGIN_MARK) || existing.includes(END_MARK)) {
    // Broken markers — append a fresh block
    const trimmed = existing.replace(/\s*$/, "");
    next = `${trimmed}\n\n${block}`;
  } else {
    const trimmed = existing.replace(/\s*$/, "");
    next = trimmed ? `${trimmed}\n\n${block}` : block;
  }

  if (next === raw) return false;
  if (!dryRun) {
    mkdirSync(dirname(rcPath), { recursive: true });
    writeFileSync(rcPath, next, "utf8");
  }
  return true;
}

function shouldSkipInstall(respectSkipEnv: boolean): string | null {
  if (!respectSkipEnv) return null;
  if (process.env.SDM_SKIP_COMPLETION === "1") {
    return "SDM_SKIP_COMPLETION=1";
  }
  if (process.env.CI === "true" || process.env.CI === "1") {
    return "CI=1";
  }
  return null;
}

/**
 * Write completion script under ~/.sdm (or fish completions dir) and
 * ensure shell rc sources it. Safe to re-run after every build/link.
 */
export function installCompletion(
  program: Command,
  options: InstallCompletionOptions = {},
): InstallCompletionResult {
  const skipReason = shouldSkipInstall(options.respectSkipEnv ?? false);
  const shell = options.shell ?? detectShell();
  const home = options.homeDir ?? homedir();
  const scriptPath = completionScriptPath(shell, home);
  const rcPath = shellRcPath(shell, home);

  if (skipReason) {
    return {
      ok: true,
      skipped: true,
      reason: skipReason,
      shell,
      scriptPath,
      rcPath,
      wroteScript: false,
      updatedRc: false,
    };
  }

  const script = renderCompletionScript(shell, program);
  let wroteScript = false;
  const prev = existsSync(scriptPath) ? readFileSync(scriptPath, "utf8") : null;
  if (prev !== script) {
    wroteScript = true;
    if (!options.dryRun) {
      mkdirSync(dirname(scriptPath), { recursive: true });
      writeFileSync(scriptPath, script, "utf8");
    }
  }

  let updatedRc = false;
  if (rcPath) {
    updatedRc = upsertRcBlock(rcPath, rcSourceBlock(shell, scriptPath), options.dryRun);
  }

  return {
    ok: true,
    shell,
    scriptPath,
    rcPath,
    wroteScript,
    updatedRc,
  };
}

/**
 * Register `sdm completion …`. Call after all other commands, before parseAsync.
 */
export function registerCompletion(program: Command): void {
  const completion = program
    .command("completion")
    .description("Shell tab-completion (print or install/update)");

  completion
    .command("install")
    .description(
      "Install/update shell completion (writes ~/.sdm/completions + hooks rc). Safe to re-run after build/link.",
    )
    .option("-s, --shell <shell>", "zsh | bash | fish (default: from $SHELL)")
    .option("-q, --quiet", "Only print errors", false)
    .option("--dry-run", "Show actions without writing", false)
    .option("--json", "Machine-readable JSON", false)
    .option(
      "--from-hook",
      "Build/link hook mode: skip on CI / SDM_SKIP_COMPLETION=1; never fail the parent script",
      false,
    )
    .action(
      (opts: {
        shell?: string;
        quiet?: boolean;
        dryRun?: boolean;
        json?: boolean;
        fromHook?: boolean;
      }) => {
        try {
          const shell = opts.shell ? parseShellArg(opts.shell) : detectShell();
          const result = installCompletion(program, {
            shell,
            quiet: opts.quiet,
            dryRun: opts.dryRun,
            respectSkipEnv: Boolean(opts.fromHook),
          });
          if (result.skipped) {
            if (opts.json) {
              console.log(JSON.stringify({ ...result }, null, 2));
            }
            return;
          }
          if (opts.json) {
            console.log(JSON.stringify({ ...result }, null, 2));
          } else if (!opts.quiet) {
            const verb = opts.dryRun ? "Would install" : "Installed";
            console.log(`${verb} ${result.shell} completion → ${result.scriptPath}`);
            if (result.rcPath) {
              console.log(
                result.updatedRc
                  ? `  rc: updated ${result.rcPath}`
                  : `  rc: already hooked ${result.rcPath}`,
              );
            } else {
              console.log("  rc: fish loads completions dir automatically");
            }
            if (!opts.dryRun && result.updatedRc) {
              console.log("  Reload shell: source ~/.zshrc  (or open a new terminal)");
            }
          } else if (opts.fromHook && (result.wroteScript || result.updatedRc)) {
            console.log(
              `[sdm] completion updated (${result.shell}) → ${result.scriptPath}`,
            );
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if (opts.fromHook) {
            console.warn(`[sdm] completion install skipped: ${message}`);
            return;
          }
          console.error(message);
          process.exitCode = 1;
        }
      },
    );

  completion
    .command("print")
    .description("Print completion script to stdout")
    .argument("[shell]", "zsh | bash | fish (default: from $SHELL)")
    .action((shellArg: string | undefined) => {
      try {
        const shell = parseShellArg(shellArg);
        process.stdout.write(renderCompletionScript(shell, program));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(message);
        process.exitCode = 1;
      }
    });

  // Backward-compatible: `sdm completion zsh`
  for (const shell of ["zsh", "bash", "fish"] as const) {
    completion
      .command(shell, { hidden: true })
      .description(`Print ${shell} completion script`)
      .action(() => {
        process.stdout.write(renderCompletionScript(shell, program));
      });
  }

  completion.addHelpText(
    "after",
    `
Examples:
  sdm completion install          # write + hook shell rc (also run from npm build/link)
  sdm completion print zsh        # print script only
  sdm completion zsh              # alias for print
`,
  );
}
