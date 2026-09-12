## ADDED Requirements

### Requirement: MCP tool suggest

The `@spec-driven-methodology/mcp` server SHALL expose tool `suggest` that returns JSON text with the same suggest payload as `sdm suggest --json` (`ok: true`, snapshot, suggestions with levers). The tool SHALL accept optional `project`, `profile`, and `level`. On missing methodology project it SHALL return `ok: false` with the same SdmError code as the CLI.

#### Scenario: suggest tool success

- **WHEN** a host calls `suggest` with a valid `project` and resolvable profile/level focus
- **THEN** the tool result MUST contain JSON text with `ok: true` and a `suggestions` array of length 1 to 5

#### Scenario: suggest without project fails like CLI

- **WHEN** a host calls `suggest` with no resolvable methodology project
- **THEN** the tool returns `ok: false` with a stable SdmError code

### Requirement: Tool list includes suggest

When a host lists SDM MCP tools, the set MUST include `suggest`.

#### Scenario: suggest is listed

- **WHEN** a host lists SDM MCP tools
- **THEN** the set includes `suggest`
