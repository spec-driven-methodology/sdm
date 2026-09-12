## ADDED Requirements

### Requirement: MCP tool cert_reweight
The `@spec-driven-methodology/mcp` server SHALL expose tool `cert_reweight` that calls `@spec-driven-methodology/core` reweight logic and returns JSON text with `ok: true` and before/after weight maps on success, or `ok: false` with a SdmError `code` on failure. The tool SHALL accept optional `project`, required `level`, and either transfer fields (`skill`, `delta`, `from`) or a full `set` weight map.

#### Scenario: cert_reweight transfer success
- **WHEN** a host calls `cert_reweight` with a valid level, target skill, positive delta, and donor with sufficient weight
- **THEN** the tool result MUST contain JSON text with `ok: true`, `before`, and `after`

### Requirement: MCP cert_patch supports weight transfer args
The MCP `cert_patch` tool SHALL accept optional transfer arguments equivalent to CLI `--from` / `--absorb-into` so agents can add or remove requirements without silent renormalization.

#### Scenario: cert_patch add with from
- **WHEN** a host calls `cert_patch` with `addRequirements` and matching `from` transfer amounts that keep sum ≈ 1
- **THEN** the tool returns `ok: true` and the level reflects the transfer

## MODIFIED Requirements

### Requirement: Stdio MCP server exposes Specra domain tools

The repository SHALL ship an `@spec-driven-methodology/mcp` package that runs an MCP server over stdio and exposes tools for doctor, init, profile_create, skill_add, skill_link, cert_create, cert_patch, cert_reweight, cert_coverage, cert_gaps, question_add, question_list, question_generate, export_test, export_matrix, and export_mermaid that call `@spec-driven-methodology/core`.

#### Scenario: Tool returns JSON payload

- **WHEN** a host calls `question_list` against a methodology project cwd
- **THEN** the tool result MUST contain JSON text with `ok: true` and a `questions` array (or `ok: false` with a SdmError code on failure)

#### Scenario: Protocol uses stdout exclusively for MCP

- **WHEN** the MCP server is running
- **THEN** operational logs MUST go to stderr, not stdout

#### Scenario: Tool list includes export and generate

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `question_generate`, `export_test`, `export_matrix`, and `export_mermaid` in addition to coverage/CRUD tools

#### Scenario: Tool list includes profile_create

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `profile_create`

#### Scenario: Tool list includes cert_reweight

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `cert_reweight`
