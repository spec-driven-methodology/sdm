## ADDED Requirements

### Requirement: MCP studio bridge tools

The `@spec-driven-methodology/mcp` server SHALL expose tools `studio_sync`, `studio_push_view`, `studio_push_coverage`, and `studio_pull_action` that call `@spec-driven-methodology/core` studio helpers (same semantics as CLI `studio sync`, `push-view`, `push-coverage`, `pull-action`). The tool list MUST NOT require a `studio_serve` MCP tool. Each tool SHALL accept optional `project` like other methodology tools and return JSON text with `ok: true` on success or `ok: false` with SdmError code on failure.

#### Scenario: Tool list includes studio bridge tools

- **WHEN** a host lists SDM MCP tools
- **THEN** the set includes `studio_sync`, `studio_push_view`, `studio_push_coverage`, and `studio_pull_action`

#### Scenario: studio_push_coverage success

- **WHEN** a host calls `studio_push_coverage` with valid `profile` and `level` on a methodology project
- **THEN** the result JSON has `ok: true` and a coverage view was written to the studio bridge path
