## Context

Канон skills: `agents/*/SKILL.md` + `AGENTS.md`. MCP уже multi-host (`cursor`, `gigacode`). Не-goal прошлого mcp-multi-host: копирование skills. Сейчас это нужно для agent-first UX.

## Goals / Non-Goals

**Goals:**

- `sdm agent hosts` / `agent install --hosts cursor,gigacode|all`
- Mirror each skill dir that contains `SKILL.md` into host skills root
- Same host ids as MCP where possible; paths differ (skills ≠ mcp.json)
- MCP: no baked `SDM_PROJECT_ROOT` unless `--project` explicit
- MCP tools: optional `project` string

**Non-Goals:**

- Auto-detect every IDE forever (extensible registry only)
- Publishing skills to npm registry
- Changing OpenSpec workspace `.cursor/skills` for framework dev
- Full GigaCode schema reverse-engineering beyond `~/.gigacode/skills/`

## Decisions

1. **Registry parallel to MCP hosts**
   - `cursor` → `<cursorRoot>/.cursor/skills/<skillId>/SKILL.md` (default cursorRoot = cwd)
   - `gigacode` → `<gigacodeHome>/skills/<skillId>/SKILL.md` (default `~/.gigacode`) — user-global, like settings.json
   - skillId = directory name under `agents/` (e.g. `intent-loop`)

2. **Source of skills**
   - Resolve Specra package root: walk from `@spec-driven-methodology/cli` / monorepo to dir containing `agents/` with ≥1 `*/SKILL.md`
   - Override: `SDM_HOME` or `--agents-root <dir>`
   - Also copy top-level `AGENTS.md` into skills root as `sdm-AGENTS.md` (plain markdown pointer) — optional; prefer copying `AGENTS.md` next to skills as `AGENTS.md` only if host root allows. **Decision:** copy `AGENTS.md` into `<skillsRoot>/../` is messy; instead write `<skillsRoot>/specra/AGENTS.md` OR install skills with prefix. Simplest: only mirror `agents/*` dirs; document that host should load Specra `AGENTS.md` from package. Also write a small `README-specra.md` in skills root listing installed skills. Better: copy framework `AGENTS.md` to `<skillsRoot>/specra-agents.md`.

3. **Copy vs link**
   - Default: **copy** (stable when SDM_HOME moves after install)
   - `--link`: symlink each skill dir (dev convenience); fail clearly if unsupported

4. **Force**
   - Existing skill dir: skip unless `--force`

5. **MCP project model**
   - `buildMcpConfig({ projectRoot?: string | null })` — set env only if `projectRoot` is a non-empty string
   - `mcp install --project` optional; omitted → no env
   - Tools: `project?: string` → `resolveStartDir(project) = project || SDM_PROJECT_ROOT || cwd` then `findProjectRoot`

6. **CLI shape**
   ```bash
   sdm agent hosts --json
   sdm agent install --hosts cursor,gigacode [--cursor-root] [--gigacode-home] [--agents-root] [--link] [--force] --json
   ```
   Reuse `resolveHosts`-style parsing (shared or duplicated thin helper for agent hosts — same ids initially).

## Risks

- GigaCode may look in a different skills path → document experimental; `--gigacode-home` / future `--config`
- Cursor project skills collide with OpenSpec in same workspace → recommend install into methodology workspace or user home via `--cursor-root ~/.cursor` if user prefers; default cwd is explicit for agent control
- Large MCP schema churn adding `project` to every tool — keep helper `projectField` zod optional

## Migration

- Existing mcp.json with SDM_PROJECT_ROOT: leave as-is on merge if user re-installs without `--project` → **overwrite** server entry without env (intentional fix). Document: re-run `mcp install --hosts …` without `--project`.
