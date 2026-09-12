## ADDED Requirements

### Requirement: MCP tools for methodology export
The `@spec-driven-methodology/mcp` server SHALL expose tools `export_test` and `export_matrix` that call `@spec-driven-methodology/core` export assemblers and return JSON text with `ok: true` and the export `document` (plus `format`) on success, or `ok: false` with a SdmError `code` on failure.

#### Scenario: export_test tool success
- **WHEN** a host calls `export_test` with role and level against a valid methodology project cwd
- **THEN** the tool result MUST contain JSON text with `ok: true`, `format`, and `document` for the assembled test package

#### Scenario: export_matrix tool success
- **WHEN** a host calls `export_matrix` with role against a valid methodology project cwd
- **THEN** the tool result MUST contain JSON text with `ok: true`, `format`, and `document` for the assembled matrix
