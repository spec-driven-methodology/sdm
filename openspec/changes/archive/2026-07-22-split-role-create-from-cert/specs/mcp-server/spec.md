## MODIFIED Requirements

### Requirement: Stdio MCP server exposes Specra domain tools

The repository SHALL ship an `@spec-driven-methodology/mcp` package that runs an MCP server over stdio and exposes tools for doctor, init, role_create, skill_add, skill_link, cert_create, cert_patch, cert_coverage, cert_gaps, question_add, question_list, question_generate, export_test, export_matrix, and export_mermaid that call `@spec-driven-methodology/core`.

#### Scenario: Tool returns JSON payload

- **WHEN** a host calls `question_list` against a methodology project cwd
- **THEN** the tool result MUST contain JSON text with `ok: true` and a `questions` array (or `ok: false` with a SdmError code on failure)

#### Scenario: Protocol uses stdout exclusively for MCP

- **WHEN** the MCP server is running
- **THEN** operational logs MUST go to stderr, not stdout

#### Scenario: Tool list includes export and generate

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `question_generate`, `export_test`, `export_matrix`, and `export_mermaid` in addition to coverage/CRUD tools

#### Scenario: Tool list includes role_create

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `role_create`

## ADDED Requirements

### Requirement: MCP role_create tool
The `@spec-driven-methodology/mcp` server SHALL expose tool `role_create` that calls `@spec-driven-methodology/core` role creation and returns JSON text with `ok: true` and the role payload on success, or `ok: false` with a SdmError `code` on failure.

#### Scenario: role_create tool success
- **WHEN** a host calls `role_create` with role id and title against a valid methodology project cwd and the role does not exist
- **THEN** the tool result MUST contain JSON text with `ok: true` and a role document with empty `levels`

### Requirement: MCP cert_create requires existing role
The MCP `cert_create` tool SHALL fail with `ROLE_NOT_FOUND` when the role file is missing and MUST NOT create the role. It SHALL create the level when the role exists and skills in requirements exist.

#### Scenario: cert_create without role
- **WHEN** a host calls `cert_create` for a role that has not been created
- **THEN** the tool result MUST contain JSON with `ok: false` and code `ROLE_NOT_FOUND`
