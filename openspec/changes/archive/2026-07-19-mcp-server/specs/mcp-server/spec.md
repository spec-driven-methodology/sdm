## ADDED Requirements

### Requirement: Stdio MCP server exposes Specra domain tools

The repository SHALL ship an `@spec-driven-methodology/mcp` package that runs an MCP server over stdio and exposes tools for doctor, init, skill_add, skill_link, cert_create, cert_coverage, cert_gaps, question_add, and question_list that call `@spec-driven-methodology/core`.

#### Scenario: Tool returns JSON payload

- **WHEN** a host calls `question_list` against a methodology project cwd
- **THEN** the tool result MUST contain JSON text with `ok: true` and a `questions` array (or `ok: false` with a SdmError code on failure)

#### Scenario: Protocol uses stdout exclusively for MCP

- **WHEN** the MCP server is running
- **THEN** operational logs MUST go to stderr, not stdout
