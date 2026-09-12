## MODIFIED Requirements

### Requirement: Multi-host MCP install

The system SHALL merge Specra stdio MCP server config (`command`, `args`, optional `env.SDM_PROJECT_ROOT`) into each selected host via `sdm mcp install --hosts <csv>|all`. Flag `--cursor` SHALL be treated as selecting host `cursor`. Non-interactive runs without `--hosts` and without `--cursor` SHALL fail with `HOSTS_REQUIRED` (unless a future TTY selection succeeds).

`SDM_PROJECT_ROOT` SHALL be written into the server `env` **only** when the caller passes an explicit `--project <dir>` (or equivalent API option). When `--project` is omitted, the installed server entry SHALL omit `env.SDM_PROJECT_ROOT` so one MCP instance can serve many methodology projects via per-tool `project` arguments.

#### Scenario: Install into Cursor without binding a project

- **WHEN** agent runs `sdm mcp install --hosts cursor --cursor-root <dir> --json` without `--project`
- **THEN** `<dir>/.cursor/mcp.json` contains `mcpServers.sdm` with absolute mcp entry and **no** `SDM_PROJECT_ROOT` env

#### Scenario: Install into Cursor with optional default project

- **WHEN** agent runs `sdm mcp install --hosts cursor --cursor-root <dir> --project <methodology> --json`
- **THEN** `<dir>/.cursor/mcp.json` contains `mcpServers.sdm` with `SDM_PROJECT_ROOT` set to that methodology path

#### Scenario: Install into GigaCode

- **WHEN** agent runs `sdm mcp install --hosts gigacode --json`
- **THEN** `~/.gigacode/settings.json` (or override path) is created/merged with `mcpServers.sdm` without removing unrelated settings keys

#### Scenario: Install into multiple hosts

- **WHEN** agent runs `sdm mcp install --hosts cursor,gigacode --json`
- **THEN** both host configs are written and JSON lists each resulting path
