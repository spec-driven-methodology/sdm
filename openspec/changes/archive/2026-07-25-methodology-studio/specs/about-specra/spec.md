## ADDED Requirements

### Requirement: About capabilities list studio sync

When `sdm studio sync` ships as a public CLI command, the about payload `capabilities.cli` SHALL include the identifier `studio sync`. MCP tool `studio_sync` is NOT required in the same release if MCP is out of scope for that slice.

#### Scenario: About lists studio sync

- **WHEN** a client calls `sdm about --json` after studio sync ships
- **THEN** `capabilities.cli` includes `studio sync`
