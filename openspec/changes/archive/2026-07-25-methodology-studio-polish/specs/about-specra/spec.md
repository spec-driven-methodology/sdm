## ADDED Requirements

### Requirement: About MCP capabilities list studio tools

When studio MCP tools ship, the about payload `capabilities.mcp` SHALL include `studio_sync`, `studio_push_view`, `studio_push_coverage`, and `studio_pull_action`.

#### Scenario: About lists studio MCP tools

- **WHEN** a client calls `sdm about --json` after studio MCP tools ship
- **THEN** `capabilities.mcp` includes those four tool names
