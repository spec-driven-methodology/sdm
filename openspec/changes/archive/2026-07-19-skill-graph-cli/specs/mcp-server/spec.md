## ADDED Requirements

### Requirement: MCP skill_graph and skill_impact tools
The MCP server SHALL expose tools `skill_graph` and `skill_impact` mirroring the CLI domain operations with JSON payloads.

#### Scenario: skill_graph tool
- **WHEN** an MCP client calls `skill_graph` with role and level
- **THEN** the tool returns JSON with `ok: true` and a graph document

#### Scenario: skill_impact tool
- **WHEN** an MCP client calls `skill_impact` with a skill id
- **THEN** the tool returns JSON with `ok: true` and an impact document
