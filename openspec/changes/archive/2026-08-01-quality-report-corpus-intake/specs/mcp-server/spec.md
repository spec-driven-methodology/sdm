## ADDED Requirements

### Requirement: MCP tool quality_report
The `@spec-driven-methodology/mcp` server SHALL expose tool `quality_report` that calls `@spec-driven-methodology/core` quality-report helpers with the same semantics as CLI `quality report` (modes methodology/corpus/diff via args `sources`, `profile`, `level`, `diff`, `save`, `locale`). On success it SHALL return JSON text with `ok: true` and `document` (`sdm.quality.report/v1`). On failure it SHALL return `ok: false` with a SdmError code. Arg `save` SHALL default to `true`. Optional `project` SHALL behave like other methodology tools.

#### Scenario: Tool listed and succeeds on methodology project
- **WHEN** a client lists tools and then calls `quality_report` with `profile` and `level` on a valid project
- **THEN** `quality_report` is in the tool list and the response JSON has `ok: true` and `document.schemaVersion` `sdm.quality.report/v1`
