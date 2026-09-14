# SDM Quick Start

**SDM (Spec-Driven Methodology)** treats methodology artifacts as specifications: ontology → profile → coverage → export; the primary UX is through an AI agent (intent → plan → confirm → CLI/MCP), not manual flag typing.

Goal: download sdm-cli, build CLI/MCP, create a methodology project, and wire your agent host so it sees SDM tools.

Packages are **not** published to npm yet — install from git (GitHub: `spec-driven-methodology/sdm`).

## 1. Requirements

- **Node.js** ≥ 20.19 and npm
- **git**
- One of the supported agent hosts: Cursor, MultiTool/OpenCode, or GigaCode

## 2. Clone, build, link

```bash
git clone <sdm-repo-url>
cd sdm
npm install
npm run link:cli       # build + link CLI/MCP (prerelease: auto …-alpha.N)
# or without bumping identity:
npm run link:refresh   # compile + link CLI/MCP + completion
# + reinstall MCP into hosts:
# npm run link:refresh -- --mcp
```

Verify:

```bash
sdm --version          # ASCII SDM + core … / mcp … (see VERSIONING.md)
sdm mcp hosts --json
```

Expect two version lines with the same identity (`core` and `mcp`). Format and bump: [`VERSIONING.md`](./VERSIONING.md).

Tab-completion installs on `build` / `link:cli` / `link:refresh`. `link:cli` on prerelease bumps `…-alpha.N`; `link:refresh` does not. After first run: `source ~/.zshrc` (or new terminal), then `sdm `<Tab> / `sk`<Tab>.

Expect to see `cursor`, `gigacode` (experimental), and `multitool` in the host list.

If you move the clone to another path — run `link:refresh -- --mcp` again (or `build` + `mcp install`), otherwise old absolute paths remain in settings. After refresh, restart MCP in the host and check `about` / `--version`.

## 3. Methodology project

A separate directory (not necessarily inside the SDM repo):

```bash
mkdir ~/my-methodology && cd ~/my-methodology
sdm init --with-examples
sdm doctor
```

Expect: `OK: SDM project at …`. Examples are synthetic (`java-developer` / `middle`) — no real data.

## 4. Wire MCP + skills to your host

`sdm init` creates a methodology project but does **not** install MCP/skills into your IDE. Wiring is a separate step.

```bash
# preview: settings path, mcpEntry (no single methodology binding)
sdm mcp config --host cursor --json

# single MCP per host + portable skills (intent-loop, …) installed by default
# don't pass --project — multi-project; pass tool arg project = methodology
sdm mcp install --hosts cursor --cursor-root <ide-workspace-root> --json
# other hosts:
sdm mcp install --hosts multitool --json       # MultiTool / OpenCode
sdm mcp install --hosts gigacode --json        # GigaCode (experimental)

# MCP only without skills: add --no-skills
# skills separately (if MCP was already installed): sdm agent install --hosts cursor --json
```

Claude Desktop is not a supported `--hosts` target; wire SDM manually if you use it.

Do **not** hand-edit paths to `packages/mcp/dist/index.js` — use the CLI only.
Running `mcp install` again without `--project` removes any stale `SDM_PROJECT_ROOT`.

## 5. Reload in your host

Restart the agent host / reload MCP **and skills** (how to do this depends on your host — often `/mcp` or a settings panel command).

Verify the SDM server is listed in MCP and tools are available, and that portable skills are visible.

## 6. Smoke checklist

- [ ] The MCP tool **`doctor`** is callable with arg `project` = absolute path to methodology → success
- [ ] (optional) agent or CLI: `sdm doctor` in the methodology directory
- [ ] Quality summary report: MCP **`quality_report`** or `sdm quality report --profile … --level … --json` (●○○ matrix); for raw `.md` sources — `--sources <dir>` before bootstrap
- [ ] (optional) Content staleness: MCP **`content_stale`** or `sdm content stale --profile … --level … --json` after ontology edits
- [ ] MCP tools include `quality_report` and `content_stale` (if not — rebuild + reload MCP in the host)
- [ ] The agent sees portable SDM skills (`intent-loop`, `quality-report`, `close-staleness`, …) after `mcp install` (or standalone `agent install`)

## 6.1. Next — as a user (no CLI)

**CLI and flags are for the agent and CI, not for the methodologist.** You describe your intent to the agent.

Example:

> I want a foundation for a Java Developer profile, Middle level, backend focus. First clarify details and show a plan — don't write anything until I confirm.

The agent should run the **intent-loop**: clarification → plan → confirm → execution → result (coverage / what was created).

Methodology entity: **profile**, not a job title "role".

Skill: [`agents/intent-loop/`](./agents/intent-loop/SKILL.md). For agents (appendix): [`AGENTS.md`](./AGENTS.md).

### 6.2. Multi-project: one MCP for N methodology folders

One SDM MCP server (one `mcp install`) works with any number of projects. On each call the agent:

1. Discovers the current project: **`locate_project({ dir: <user's working directory> })`** → gets `root` + `name`
2. Passes `project: <root>` to all other MCP tools

When switching between directories — call `locate_project` again. `locate_project` and `list_projects` are available in MCP since version 1.1.0.

## 7. Troubleshooting

| Symptom / code | What to do |
|---|---|
| `MCP_NOT_FOUND` | `npm run build` in the SDM clone; check that `@spec-driven-methodology/mcp` builds |
| `HOSTS_REQUIRED` | Pass `--hosts <names>` (e.g. `cursor,gigacode,multitool`) in non-TTY |
| `UNKNOWN_HOST` | `sdm mcp hosts --json` |
| `VALIDATION_FAILED` | Fix JSON in `settings.json` / pass `--config` |
| `doctor` / Not a SDM project | Pass tool arg `project` (or optional `SDM_PROJECT_ROOT`) to the directory with `sdm.yaml` |
| MCP is "broken" after moving the clone | Run `mcp install --hosts <name>` again (paths to dist are rewritten) |
| `AGENTS_NOT_FOUND` | `agent install`: specify `--agents-root` or `SDM_HOME` |
| `npm install` fails behind proxy | Set registry/proxy in your environment; SDM does not bypass it |

## 8. Action log

SDM writes NDJSON logs in the methodology project:

- `.sdm/logs/sdm.log` — all CLI/MCP calls
- `.sdm/logs/error.log` — errors only (duplicate from the main stream)

Rotation by size (see optional `logging` block in `sdm.yaml`). Disable: `SDM_LOG=0`. The `.sdm/logs/` directory is in `.gitignore`.

## 9. Other hosts (MultiTool, GigaCode)

```bash
sdm mcp install --hosts multitool --json
sdm mcp install --hosts gigacode --json
```

List all adapters: `sdm mcp hosts --json` / `sdm agent hosts --json`.

Product details: [`README.md`](./README.md), changelog: [`CHANGELOG.md`](./CHANGELOG.md).

## 10. Obsidian integration (no plugin needed)

SDM does not require its own Obsidian plugin. Use **Cortex** (MCP bridge to vault) and **OpenCode** (agent inside Obsidian).

```bash
# from the vault root — one command sets everything up
./scripts/obsidian-setup.sh

# rollback (removes created artifacts, with backup)
./scripts/obsidian-setup.sh --undo
```

The script: checks dependencies → locates vault → scans for SDM projects → writes `opencode.json` (SDM + Cortex) → places `AGENTS.md`. Details: `docs/obsidian-integration.md`.

Rollback: `--undo` removes `opencode.json` and `AGENTS.md` (with backup by default, `--purge` without backup). Only vault-local artifacts are removed; global MCP configs (Cursor, etc.) are warned about but not touched.

**Installing Obsidian plugins (once):**
- **Cortex** (search Community Plugins) — MCP server inside Obsidian on port 27182
- **OpenCode** (search Community Plugins) — OpenCode terminal in the sidebar

Multi-project: a vault may contain multiple `sdm.yaml` files. The agent uses `list_projects` / `locate_project` to find the right project and passes `project` to each MCP call.