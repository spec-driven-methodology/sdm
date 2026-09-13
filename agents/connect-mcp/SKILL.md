---
name: sdm-connect-mcp
description: >-
  Connect SDM MCP to an AI host (GigaCode first, also Cursor) without
  hand-editing absolute paths. Use when the user says «подключи SDM MCP»,
  «enable SDM MCP», or asks to wire settings / mcp.json. Default
  `mcp install` also mirrors portable skills (`intent-loop`, …).
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm`) on PATH and a built `@spec-driven-methodology/mcp`.
metadata:
  author: sdm
  version: "0.5.0"
---

# Connect SDM MCP

Do **not** invent absolute paths to `packages/mcp/dist/index.js`. Resolve and write config via CLI.

New machine / OSS checkout: follow [`GETTING_STARTED.md`](../../GETTING_STARTED.md) (GigaCode-first).

## Goal

Make SDM MCP tools **and** portable skills available in the chosen agent host with:

- absolute `command` / `args` resolved from the installed `@spec-driven-methodology/mcp`
- **one MCP server instance per host** (not one per methodology folder)
- default host config key **`SDM`** (Cursor/GigaCode sidebars often show the `mcp.json` / settings **key**, not MCP `title`; protocol `name` stays `sdm`)
- **do not** put product version into the mcpServers key — freshness is `serverInfo.version` / MCP `about` / `sdm --version` (`core` + `mcp` lines; see [`VERSIONING.md`](../../VERSIONING.md))
- portable skills (`intent-loop`, `close-coverage`, …) mirrored by default with `mcp install`
- after upgrades that change the key or entry path, re-run `mcp install` (default install migrates legacy lowercase key `sdm` → `SDM`)
- after `npm run build` / `link:cli` / `link:refresh`, **restart MCP** in the host; smoke with MCP `about` or `sdm --version` (both lines should match). Prefer `npm run link:refresh` (no auto-bump); add `-- --mcp` to re-run `mcp install`
- methodology selected per call via tool arg `project` (optional env `SDM_PROJECT_ROOT` only if the user explicitly wants a default)
- **multi-project**: install **once** without `--project`; the agent resolves the current methodology with `locate_project` / `list_projects` and passes `project` (= the located root) to every subsequent tool call. Do **not** hardcode one project in the MCP config.
- re-run `mcp install` **without** `--project` to clear a stale baked `SDM_PROJECT_ROOT`

**Primary host in docs: GigaCode** (`gigacode`, experimental → `~/.gigacode/settings.json`). Cursor is supported as an alternative.

## Preconditions

1. SDM monorepo is built (see GETTING_STARTED):
   ```bash
   cd <sdm-repo>
   npm install && npm run build
   npm link -w @spec-driven-methodology/cli
   ```
2. Host ids:
   ```bash
   sdm mcp hosts --json
   sdm agent hosts --json
   ```

## Steps (GigaCode first)

1. **Preview**:
   ```bash
   sdm mcp config --host gigacode --json
   ```
   Expect `ok: true`, absolute `mcpEntry`, `path` (usually `~/.gigacode/settings.json`), `projectRoot: null`.

2. **Install MCP + skills** (merge, does not wipe other servers):
   ```bash
   sdm mcp install --hosts gigacode --json
   ```
   Non-default settings location:
   ```bash
   sdm mcp install --hosts gigacode --gigacode-home <dir> --json
   ```
   Or `--config <file>`.

   - Default: also installs portable skills into the same host.
   - MCP only: `--no-skills`.
   - Skills-only refresh later: `sdm agent install --hosts gigacode --json`.
   - Optional default project (usually **omit**): `--project <methodology>` sets `SDM_PROJECT_ROOT`. Prefer tool arg `project` when the user has many methodology folders.

3. Tell the human to **reload MCP and skills** in GigaCode (restart / `/mcp` as applicable).

4. Smoke: call MCP tool `doctor` with `project` = absolute path to a methodology (`sdm.yaml`). Prefer MCP over shell once connected. Confirm the host sees skill **intent-loop**.

## Working across multiple methodology folders

One MCP server instance serves **any number** of methodology projects — do not install a server per folder.

To operate in the folder the user is working in:

1. Resolve it: call `locate_project` with the user's working directory (`dir`), or `list_projects` with the workspace root to enumerate candidates.
2. Pass the returned `root` as the `project` argument to every other SDM tool call for that session.
3. When the user switches to another methodology folder, re-resolve with `locate_project` / `list_projects` — never reuse a stale `project`.

This is what "multi-project MCP" means: one server, per-call `project`.

## Alternative: Cursor

```bash
sdm mcp install --hosts cursor --cursor-root <cursor-workspace-root> --json
```

`--cursor-root` is the **IDE workspace** root (may differ from the methodology directory). Alias: `--cursor` instead of `--hosts cursor` for MCP. Several hosts: `--hosts cursor,gigacode`.

## Do not

- Paste placeholder paths like `/path/to/sdm/...` into settings.json / mcp.json
- Hand-edit YAML methodology files to “enable” MCP
- Bind MCP to a single methodology folder when the user has many projects (omit `--project`)
- Call tools without `project` when the working directory is not the methodology root — resolve it first (see "Working across multiple methodology folders")
- Assume `sdm init` alone wired the IDE (it only creates the methodology tree)

## Failure codes

| Code | Meaning |
|------|---------|
| `MCP_NOT_FOUND` | Build `@spec-driven-methodology/mcp` first (`npm run build`) |
| `AGENTS_NOT_FOUND` | Cannot locate `agents/*/SKILL.md` — pass `--agents-root` / `SDM_HOME` |
| `HOSTS_REQUIRED` | Pass `--hosts` / `--cursor` (non-TTY) |
| `UNKNOWN_HOST` | Unknown id — run `sdm mcp hosts` / `sdm agent hosts` |
| `VALIDATION_FAILED` | Existing host config is not valid JSON |
