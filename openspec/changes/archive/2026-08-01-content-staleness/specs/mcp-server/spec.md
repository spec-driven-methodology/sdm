## ADDED Requirements

### Requirement: MCP content_stale tool

The MCP server SHALL expose tool `content_stale` mirroring `sdm content stale` with JSON payload (`ok`, stale document). Optional args SHALL include `skill`, `profile`, `level`, and `project` consistent with other domain tools.

#### Scenario: content_stale tool success

- **WHEN** an MCP client calls `content_stale` with a valid `skill` against a methodology project
- **THEN** the tool returns JSON text with `ok: true` and a document whose `schemaVersion` is `sdm.content.stale/v1`

### Requirement: MCP skill_impact returns artifact fields

MCP `skill_impact` SHALL return the expanded impact document including `questions` and `exports` arrays and schema `sdm.skill.impact/v2` (or newer), matching core/CLI.

#### Scenario: skill_impact includes questions key

- **WHEN** an MCP client calls `skill_impact` with a skill id
- **THEN** the JSON impact document includes `questions` and `exports` arrays (possibly empty)
