## ADDED Requirements

### Requirement: About MCP capabilities match registration

The about payload `capabilities.mcp` SHALL list the same tool names as `@spec-driven-methodology/mcp` `TOOL_NAMES` (set equality), kept in sync when tools are added or removed.

#### Scenario: About JSON mcp list matches TOOL_NAMES

- **WHEN** an agent reads `about` JSON and compares `capabilities.mcp` to MCP `TOOL_NAMES`
- **THEN** the sets are equal
