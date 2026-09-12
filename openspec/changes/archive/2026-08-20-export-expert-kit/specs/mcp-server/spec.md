## ADDED Requirements

### Requirement: MCP export_kit tool

The MCP server SHALL expose tool `export_kit` with parameters `project`, `profile`, `level`, optional `format` (`json`|`html`), optional `strict`, and optional `json` response envelope.

#### Scenario: export_kit returns kit document

- **WHEN** MCP `export_kit` runs with valid profile and level
- **THEN** the tool result includes a kit document with schema `sdm.export.kit/v1`
