## ADDED Requirements

### Requirement: MCP tools use profile arguments
MCP tools that previously took `role` SHALL take `profile` instead. Tool results and docs MUST use Profile terminology. A `profile_create` tool SHALL exist when profile creation is exposed (aligned with CLI `profile create`).

#### Scenario: Tool args prefer profile
- **WHEN** a host lists input schemas for `cert_coverage`, `cert_gaps`, `export_test`, `skill_graph`, or `cert_create`
- **THEN** profile identity is named `profile` (not `role`)

#### Scenario: No role_create tool name
- **WHEN** a host lists SDM MCP tools after this change
- **THEN** the public tool list does not include `role_create` as the canonical create-profile tool
