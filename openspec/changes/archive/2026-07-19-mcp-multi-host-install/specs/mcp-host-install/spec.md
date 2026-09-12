## ADDED Requirements

### Requirement: MCP host registry

The system SHALL expose a registry of MCP host adapters with stable ids. Initial ids MUST include `cursor` and `gigacode`. The command `sdm mcp hosts` SHALL list hosts; with `--json` it SHALL emit machine-readable ids and titles.

#### Scenario: List hosts as JSON

- **WHEN** agent runs `sdm mcp hosts --json`
- **THEN** output includes `cursor` and `gigacode` with stable ids

#### Scenario: Unknown host rejected

- **WHEN** agent runs `sdm mcp install --hosts unknown-tool --json`
- **THEN** command fails with SdmError code `UNKNOWN_HOST`

### Requirement: Multi-host MCP install

The system SHALL merge Specra stdio MCP server config (`command`, `args`, optional `env.SDM_PROJECT_ROOT`) into each selected host via `sdm mcp install --hosts <csv>|all`. Flag `--cursor` SHALL be treated as selecting host `cursor`. Non-interactive runs without `--hosts` and without `--cursor` SHALL fail with `HOSTS_REQUIRED` (unless a future TTY selection succeeds).

#### Scenario: Install into Cursor

- **WHEN** agent runs `sdm mcp install --hosts cursor --cursor-root <dir> --project <methodology> --json`
- **THEN** `<dir>/.cursor/mcp.json` contains `mcpServers.sdm` with absolute mcp entry and `SDM_PROJECT_ROOT`

#### Scenario: Install into GigaCode

- **WHEN** agent runs `sdm mcp install --hosts gigacode --project <methodology> --json`
- **THEN** `~/.gigacode/settings.json` (or override path) is created/merged with `mcpServers.sdm` without removing unrelated settings keys

#### Scenario: Install into multiple hosts

- **WHEN** agent runs `sdm mcp install --hosts cursor,gigacode --json`
- **THEN** both host configs are written and JSON lists each resulting path

### Requirement: Host-aware MCP config preview

The command `sdm mcp config` SHALL support `--host <id>` and print (or `--json` emit) the resolved server entry and recommended config path for that host without writing files.

#### Scenario: Preview GigaCode config

- **WHEN** agent runs `sdm mcp config --host gigacode --json`
- **THEN** output includes `host: "gigacode"`, recommended `path`, and `mcpServer` payload

### Requirement: Portable connect-mcp skill is host-agnostic

Portable skill `agents/connect-mcp/` SHALL instruct agents to discover hosts via `mcp hosts`, choose an id, then call `mcp install --hosts <id>` (not Cursor-only wording as the sole path).

#### Scenario: Skill mentions multi-host

- **WHEN** an agent reads `agents/connect-mcp/SKILL.md`
- **THEN** the skill documents `--hosts` and at least `cursor` and `gigacode`
