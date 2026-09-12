# agent-skills-install

## Purpose

Установка portable Specra agent skills в host-specific каталоги (Cursor, GigaCode) без ручного копирования.

## Requirements

### Requirement: Agent host registry

The CLI SHALL expose `sdm agent hosts` listing supported agent skill hosts with stable ids. At minimum the registry SHALL include `cursor` and `gigacode`. JSON output SHALL be `{ ok: true, hosts: [{ id, title, experimental? }] }`.

#### Scenario: List hosts as JSON

- **WHEN** the user runs `sdm agent hosts --json`
- **THEN** the output includes hosts with ids `cursor` and `gigacode`

### Requirement: Install portable skills into host folders

The CLI SHALL provide `sdm agent install --hosts <csv>|all` that mirrors each portable skill directory from Specra `agents/*/SKILL.md` into the selected host skills root. Non-TTY invocations without `--hosts` SHALL fail with `HOSTS_REQUIRED`. Unknown host ids SHALL fail with `UNKNOWN_HOST`.

#### Scenario: Install into Cursor skills dir

- **WHEN** the user runs `sdm agent install --hosts cursor --cursor-root <dir> --json`
- **THEN** each skill with a `SKILL.md` is written under `<dir>/.cursor/skills/<skillId>/SKILL.md`
- **AND** JSON reports `ok: true` with created/skipped paths

#### Scenario: Install into GigaCode skills dir

- **WHEN** the user runs `sdm agent install --hosts gigacode --gigacode-home <dir> --json`
- **THEN** skills are written under `<dir>/skills/<skillId>/SKILL.md`

#### Scenario: Skip existing without force

- **WHEN** a destination skill directory already exists and `--force` is not set
- **THEN** that skill is skipped (listed in `skipped`) and other skills still install

### Requirement: Resolve agents source root

Install SHALL resolve the Specra `agents/` directory from the installed package/monorepo (or `--agents-root` / `SDM_HOME/agents`). If no skills are found, it SHALL fail with `AGENTS_NOT_FOUND`.

#### Scenario: Missing agents root

- **WHEN** install cannot locate any `agents/*/SKILL.md`
- **THEN** it fails with code `AGENTS_NOT_FOUND`

### Requirement: Standalone agent install remains supported

`sdm agent install --hosts …` SHALL remain a supported way to mirror portable skills without rewriting MCP host config. Docs and `connect-mcp` MAY recommend the coupled `mcp install` path as the primary wire, but MUST NOT remove or break standalone skills install.

#### Scenario: Skills-only refresh

- **WHEN** the user runs `sdm agent install --hosts cursor --cursor-root <dir> --json` after MCP is already configured
- **THEN** portable skills are mirrored under `<dir>/.cursor/skills/`
- **AND** the command does not require rewriting `.cursor/mcp.json`

### Requirement: Shared host roots with mcp install

When `mcp install` invokes skills install for the same `--hosts` selection, it SHALL use the same host root resolution as standalone `agent install` (`--cursor-root`, `--gigacode-home`, agents root / `SDM_HOME` / `--agents-root`).

#### Scenario: Same cursor-root for coupled install

- **WHEN** agent runs `sdm mcp install --hosts cursor --cursor-root <dir> --json` without `--no-skills`
- **THEN** skills land under `<dir>/.cursor/skills/` (same root rules as `agent install --hosts cursor --cursor-root <dir>`)
