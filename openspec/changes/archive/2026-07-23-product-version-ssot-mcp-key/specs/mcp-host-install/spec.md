## MODIFIED Requirements

### Requirement: Multi-host MCP install

The system SHALL merge Specra stdio MCP server config (`command`, `args`, optional `env.SDM_PROJECT_ROOT`) into each selected host via `sdm mcp install --hosts <csv>|all`. Flag `--cursor` SHALL be treated as selecting host `cursor`. Non-interactive runs without `--hosts` and without `--cursor` SHALL fail with `HOSTS_REQUIRED` (unless a future TTY selection succeeds).

The default MCP servers map key SHALL be `Specra` (capital S) so host UIs that display the config key (e.g. Cursor sidebar) show the product brand. Callers MAY override the key with `--name` / `serverName`. The MCP protocol implementation `name` field remains the logical id `sdm` and is independent of the host config key.

When installing with the default key `Specra`, if a legacy key `sdm` already exists for a SDM MCP entry, the install SHALL write under `Specra` and SHALL remove the legacy `sdm` key to avoid duplicate servers.

`SDM_PROJECT_ROOT` SHALL be written into the server `env` **only** when the caller passes an explicit `--project <dir>` (or equivalent API option). When `--project` is omitted, the installed server entry SHALL omit `env.SDM_PROJECT_ROOT` so one MCP instance can serve many methodology projects via per-tool `project` arguments.

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

## ADDED Requirements

### Requirement: Connect-mcp documents Specra install key

Portable skill `agents/connect-mcp/` SHALL document that the default host config key is `Specra` (Cursor/GigaCode sidebar label) and that hosts often show the config key rather than MCP `title`. It SHALL tell agents to re-run `mcp install` after upgrades when the key or entry path changes.

#### Scenario: Skill mentions Specra key and sidebar behavior

- **WHEN** an agent reads `agents/connect-mcp/SKILL.md`
- **THEN** the skill mentions default key `Specra` and that Cursor may display the `mcp.json` key
