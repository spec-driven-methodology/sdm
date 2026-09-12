## ADDED Requirements

### Requirement: MCP install wires portable skills by default

Successful `sdm mcp install --hosts …` SHALL also install portable Specra skills into the same selected hosts (same host flags / roots as `sdm agent install`), unless the caller passes `--no-skills`. With `--json`, the payload SHALL include a `skills` object describing the skills install result when skills ran, or `skills: null` when `--no-skills` was set. If MCP config write succeeds but skills install fails, the command SHALL fail with a stable SdmError code (non-zero exit) and MUST still report which MCP paths were written when `--json` is used.

#### Scenario: Default mcp install also installs skills into Cursor

- **WHEN** agent runs `sdm mcp install --hosts cursor --cursor-root <dir> --json` without `--no-skills`
- **THEN** `<dir>/.cursor/mcp.json` contains `mcpServers.Specra`
- **AND** `<dir>/.cursor/skills/` contains mirrored portable skills including `intent-loop`
- **AND** JSON includes `skills` with `ok: true` and `skillIds` containing `intent-loop`

#### Scenario: Opt out of skills

- **WHEN** agent runs `sdm mcp install --hosts cursor --cursor-root <dir> --no-skills --json`
- **THEN** MCP config is written
- **AND** JSON has `skills: null`
- **AND** skills directories are not required to be created by this command

### Requirement: Reinstall without --project clears baked project env

When `mcp install` runs without `--project`, the written Specra server entry SHALL omit `env.SDM_PROJECT_ROOT` even if a previous entry on that host had that env set (full replace of the Specra server object for the chosen key).

#### Scenario: Stale SDM_PROJECT_ROOT removed

- **WHEN** `<dir>/.cursor/mcp.json` has `mcpServers.Specra.env.SDM_PROJECT_ROOT` set to a methodology path
- **AND** agent runs `sdm mcp install --hosts cursor --cursor-root <dir> --json` without `--project`
- **THEN** the Specra server entry has no `SDM_PROJECT_ROOT` env

## MODIFIED Requirements

### Requirement: Multi-host MCP install

The system SHALL merge Specra stdio MCP server config (`command`, `args`, optional `env.SDM_PROJECT_ROOT`) into each selected host via `sdm mcp install --hosts <csv>|all`. Flag `--cursor` SHALL be treated as selecting host `cursor`. Non-interactive runs without `--hosts` and without `--cursor` SHALL fail with `HOSTS_REQUIRED` (unless a future TTY selection succeeds).

The default MCP servers map key SHALL be `Specra` (capital S) so host UIs that display the config key (e.g. Cursor sidebar) show the product brand. Callers MAY override the key with `--name` / `serverName`. The MCP protocol implementation `name` field remains the logical id `sdm` and is independent of the host config key.

When installing with the default key `Specra`, if a legacy key `sdm` already exists for a SDM MCP entry, the install SHALL write under `Specra` and SHALL remove the legacy `sdm` key to avoid duplicate servers.

`SDM_PROJECT_ROOT` SHALL be written into the server `env` **only** when the caller passes an explicit `--project <dir>` (or equivalent API option). When `--project` is omitted, the installed server entry SHALL omit `env.SDM_PROJECT_ROOT` so one MCP instance can serve many methodology projects via per-tool `project` arguments.

Unless `--no-skills` is passed, `mcp install` SHALL also mirror portable skills into the same hosts (see Requirement: MCP install wires portable skills by default).

#### Scenario: Install into Cursor without binding a project

- **WHEN** agent runs `sdm mcp install --hosts cursor --cursor-root <dir> --json` without `--project`
- **THEN** `<dir>/.cursor/mcp.json` contains `mcpServers.Specra` with absolute mcp entry and **no** `SDM_PROJECT_ROOT` env

#### Scenario: Install into Cursor with optional default project

- **WHEN** agent runs `sdm mcp install --hosts cursor --cursor-root <dir> --project <methodology> --json`
- **THEN** `<dir>/.cursor/mcp.json` contains `mcpServers.Specra` with `SDM_PROJECT_ROOT` set to that methodology path

#### Scenario: Install into GigaCode

- **WHEN** agent runs `sdm mcp install --hosts gigacode --json`
- **THEN** `~/.gigacode/settings.json` (or override path) is created/merged with `mcpServers.Specra` without removing unrelated settings keys

#### Scenario: Install into multiple hosts

- **WHEN** agent runs `sdm mcp install --hosts cursor,gigacode --json`
- **THEN** both host configs are written under key `Specra` and JSON lists each resulting path

#### Scenario: Legacy lowercase key is migrated on default install

- **WHEN** `<dir>/.cursor/mcp.json` already has `mcpServers.sdm` and agent runs default `mcp install --hosts cursor --cursor-root <dir>` without `--name`
- **THEN** the file contains `mcpServers.Specra` and MUST NOT still contain `mcpServers.sdm`

#### Scenario: Custom --name is preserved

- **WHEN** agent runs `sdm mcp install --hosts cursor --cursor-root <dir> --name my-sdm --json`
- **THEN** `<dir>/.cursor/mcp.json` contains `mcpServers["my-sdm"]` (not necessarily `Specra`)

### Requirement: Portable connect-mcp skill is host-agnostic

Portable skill `agents/connect-mcp/` SHALL instruct agents to discover hosts via `mcp hosts`, choose an id, then call `mcp install --hosts <id>` (not Cursor-only wording as the sole path). It SHALL state that default `mcp install` also installs portable skills (opt-out `--no-skills`), that happy-path omits `--project`, and that agents MUST pass tool arg `project` per methodology. It SHALL tell agents to re-run `mcp install` after upgrades and when clearing a stale baked project env.

#### Scenario: Skill mentions multi-host and skills coupling

- **WHEN** an agent reads `agents/connect-mcp/SKILL.md`
- **THEN** the skill documents `--hosts`, at least `cursor` and `gigacode`, default skills install, and multi-project (`project` arg / no default `--project`)
