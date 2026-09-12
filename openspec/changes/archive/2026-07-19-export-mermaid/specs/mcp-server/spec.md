## ADDED Requirements

### Requirement: MCP tool for Mermaid export
The `@spec-driven-methodology/mcp` server SHALL expose tool `export_mermaid` that calls `@spec-driven-methodology/core` Mermaid export and returns JSON text with `ok: true`, `format`, and `document` on success, or `ok: false` with a SdmError `code` on failure.

#### Scenario: export_mermaid tool success
- **WHEN** a host calls `export_mermaid` with role and level against a valid methodology project cwd
- **THEN** the tool result MUST contain JSON text with `ok: true` and a `document` including `schemaVersion` `sdm.export.mermaid/v1`
