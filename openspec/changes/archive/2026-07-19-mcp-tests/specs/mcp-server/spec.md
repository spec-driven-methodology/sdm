## MODIFIED Requirements

### Requirement: Stdio MCP server exposes Specra domain tools

The repository SHALL ship an `@spec-driven-methodology/mcp` package that runs an MCP server over stdio and exposes tools for doctor, init, skill_add, skill_link, cert_create, cert_patch, cert_coverage, cert_gaps, question_add, question_list, question_generate, export_test, and export_matrix that call `@spec-driven-methodology/core`.

#### Scenario: Tool returns JSON payload

- **WHEN** a host calls `question_list` against a methodology project cwd
- **THEN** the tool result MUST contain JSON text with `ok: true` and a `questions` array (or `ok: false` with a SdmError code on failure)

#### Scenario: Protocol uses stdout exclusively for MCP

- **WHEN** the MCP server is running
- **THEN** operational logs MUST go to stderr, not stdout

#### Scenario: Tool list includes export and generate

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `question_generate`, `export_test`, and `export_matrix` in addition to coverage/CRUD tools

## ADDED Requirements

### Requirement: MCP tool registration is import-safe
Importing the MCP tool registration module MUST NOT start the stdio transport. Stdio connect SHALL occur only from the package entrypoint (`index` / `sdm-mcp` bin).

#### Scenario: Tests import handlers without hanging
- **WHEN** the test suite imports the tool registration / handler module
- **THEN** the process MUST NOT block waiting on stdio MCP transport
