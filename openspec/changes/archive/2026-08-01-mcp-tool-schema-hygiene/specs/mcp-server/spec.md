## MODIFIED Requirements

### Requirement: Stdio MCP server exposes Specra domain tools

The repository SHALL ship an `@spec-driven-methodology/mcp` package that runs an MCP server over stdio and exposes tools matching `TOOL_NAMES` / `ABOUT_MCP_TOOLS`, including: `about`, `suggest`, `doctor`, `audit`, `quality_report`, `init`, `player_sync`, `studio_sync`, `studio_push_view`, `studio_push_coverage`, `studio_pull_action`, `skill_add`, `skill_link`, `skill_graph`, `skill_impact`, `profile_create`, `cert_create`, `cert_patch`, `cert_reweight`, `cert_coverage`, `cert_gaps`, `question_add`, `question_validate`, `question_list`, `question_generate`, `export_test`, `export_matrix`, `export_learning`, `export_course`, `export_mermaid`, `export_confluence`, `index_rebuild`, and `search`. The server MUST NOT expose `studio_serve` (CLI-only HTTP static serve). Tools SHALL call `@spec-driven-methodology/core`.

#### Scenario: Tool returns JSON payload

- **WHEN** a host calls `question_list` against a methodology project cwd
- **THEN** the tool result MUST contain JSON text with `ok: true` and a `questions` array (or `ok: false` with a SdmError code on failure)

#### Scenario: Protocol uses stdout exclusively for MCP

- **WHEN** the MCP server is running
- **THEN** operational logs MUST go to stderr, not stdout

#### Scenario: Tool list includes quality and studio bridge tools

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `quality_report`, `player_sync`, `studio_sync`, `studio_push_view`, `studio_push_coverage`, and `studio_pull_action`, and MUST NOT include `studio_serve`

## ADDED Requirements

### Requirement: MCP tool input parameters have descriptions

Every property in each registered MCP tool's input schema SHALL include a non-empty `description` (via Zod `.describe()` or equivalent) so hosts (e.g. Cursor) and agents can display parameter help. Shared repeated fields (project, profile, level, force, team) SHOULD reuse one description string.

#### Scenario: All tool params describe

- **WHEN** tests inspect the published input schema for every tool in `TOOL_NAMES`
- **THEN** each property under `properties` has a non-empty string `description`

### Requirement: ABOUT MCP list matches TOOL_NAMES

`ABOUT_MCP_TOOLS` in `@spec-driven-methodology/core` SHALL list exactly the same tool names as `TOOL_NAMES` in `@spec-driven-methodology/mcp` (order may differ; equality is by set).

#### Scenario: About and TOOL_NAMES parity

- **WHEN** the MCP test suite runs
- **THEN** sorting `ABOUT_MCP_TOOLS` and `TOOL_NAMES` yields identical arrays
