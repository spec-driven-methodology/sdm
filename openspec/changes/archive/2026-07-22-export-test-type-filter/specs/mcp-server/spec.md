## ADDED Requirements

### Requirement: export_test supports type filter args

The MCP tool `export_test` SHALL accept optional `includeTypes` and `excludeTypes` as arrays of question type strings, with the same semantics and mutual exclusion as CLI `--include-type` / `--exclude-type`. On success the returned `document` SHALL reflect the filtered package and `meta.typeFilter` when a filter was applied. On conflict or invalid type the tool SHALL return `ok: false` with the same SdmError codes as the CLI (`EXPORT_TYPE_FILTER_CONFLICT`, `EXPORT_TYPE_INVALID`).

#### Scenario: MCP exclude open

- **WHEN** a host calls `export_test` with `excludeTypes: ["open"]` against a valid project
- **THEN** the tool returns `ok: true` and `document.questions` has no `open` items

#### Scenario: MCP include/exclude conflict

- **WHEN** a host calls `export_test` with both non-empty `includeTypes` and `excludeTypes`
- **THEN** the tool returns `ok: false` with code `EXPORT_TYPE_FILTER_CONFLICT`
