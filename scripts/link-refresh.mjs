#!/usr/bin/env node
/**
 * Refresh global npm links for CLI/MCP without prerelease auto-bump.
 *
 *   npm run link:refresh
 *   npm run link:refresh -- --mcp
 *   npm run link:refresh -- --mcp --hosts cursor --cursor-root ..
 *
 * Contrast: `npm run link:cli` runs `build` (auto …-alpha.N bump on prerelease).
 */
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function usage() {
  console.log(`Usage: node scripts/link-refresh.mjs [options]

  compile + npm link @spec-driven-methodology/cli + @spec-driven-methodology/mcp + shell completion
  (no version bump — unlike npm run link:cli / build)

Options:
  --mcp                 also run: sdm mcp install --hosts <hosts> --json
  --hosts <list>        comma-separated hosts for --mcp (default: cursor,gigacode)
  --cursor-root <dir>   for host cursor (default: parent of SDM root)
  -h, --help            show this help
`);
}

function parseArgs(argv) {
  const out = {
    mcp: false,
    hosts: "cursor,gigacode",
    cursorRoot: null,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      out.help = true;
    } else if (a === "--mcp") {
      out.mcp = true;
    } else if (a === "--hosts") {
      out.hosts = argv[++i];
      if (!out.hosts) throw new Error("--hosts requires a value");
    } else if (a.startsWith("--hosts=")) {
      out.hosts = a.slice("--hosts=".length);
    } else if (a === "--cursor-root") {
      out.cursorRoot = argv[++i];
      if (!out.cursorRoot) throw new Error("--cursor-root requires a value");
    } else if (a.startsWith("--cursor-root=")) {
      out.cursorRoot = a.slice("--cursor-root=".length);
    } else {
      throw new Error(`Unknown arg: ${a}`);
    }
  }
  return out;
}

function run(cmd, args, label = `${cmd} ${args.join(" ")}`) {
  console.log(`→ ${label}`);
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: false,
  });
  if (r.error) {
    console.error(r.error.message);
    process.exit(1);
  }
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    usage();
    process.exit(2);
  }
  if (opts.help) {
    usage();
    process.exit(0);
  }

  run("npm", ["run", "compile"], "npm run compile");
  run("npm", ["link", "-w", "@spec-driven-methodology/cli"], "npm link -w @spec-driven-methodology/cli");
  run("npm", ["link", "-w", "@spec-driven-methodology/mcp"], "npm link -w @spec-driven-methodology/mcp");
  run(
    "node",
    ["packages/cli/dist/index.js", "completion", "install"],
    "sdm completion install",
  );

  run("node", ["packages/cli/dist/index.js", "--version"], "sdm --version");

  if (opts.mcp) {
    const cursorRoot = resolve(opts.cursorRoot ?? join(root, ".."));
    const hosts = opts.hosts
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    if (hosts.length === 0) {
      console.error("--hosts produced an empty list");
      process.exit(2);
    }
    const mcpArgs = [
      "packages/cli/dist/index.js",
      "mcp",
      "install",
      "--hosts",
      hosts.join(","),
      "--json",
    ];
    if (hosts.includes("cursor")) {
      mcpArgs.push("--cursor-root", cursorRoot);
    }
    run("node", mcpArgs, `sdm mcp install --hosts ${hosts.join(",")}`);
  }

  console.log(`
link:refresh done (no version bump).
Reload MCP in the IDE (Cursor: Restart SDM MCP / Reload Window).
Smoke: sdm --version  ·  MCP about → version matches.
`);
}

main();
