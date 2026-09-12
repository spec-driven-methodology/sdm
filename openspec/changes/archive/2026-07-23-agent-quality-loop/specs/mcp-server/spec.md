## ADDED Requirements

### Requirement: MCP tool question_validate

The MCP server SHALL expose tool `question_validate` that invokes the shared question validate pipeline in `@spec-driven-methodology/core` and returns JSON with `ok`, `errors`, and `findings` (or equivalent warning fields) for agent rewrite loops. The tool MUST support the optional `project` argument used by other domain tools.

#### Scenario: Tool list includes question_validate

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `question_validate`

#### Scenario: question_validate returns structured JSON

- **WHEN** a host calls `question_validate` with a draft bound to an existing skill
- **THEN** the tool result JSON includes `ok` and arrays for blocking errors and advisory findings (possibly empty)

### Requirement: MCP gaps and generate expose quality-loop fields

MCP `cert_gaps` SHALL pass through blueprint `workItems` when present. MCP `question_generate` SHALL pass through per-draft brief fields. MCP `question_add` SHALL pass through soft-mode warnings/findings when the write succeeds under `writeGate: soft`. MCP `suggest` SHALL reflect quality-hardening suggestions when applicable.

#### Scenario: cert_gaps includes workItems in blueprint mode

- **WHEN** a host calls `cert_gaps` for a blueprint-mode project with thin coverage
- **THEN** the JSON payload includes `workItems` when the core gaps result defines them
