## ADDED Requirements

### Requirement: About capabilities list content stale

When `sdm content stale` ships as a public CLI command, the about payload `capabilities.cli` SHALL include the identifier `content stale`. When MCP tool `content_stale` ships, `capabilities.mcp` SHALL include `content_stale`.

#### Scenario: About lists content stale CLI

- **WHEN** a client calls `sdm about --json` after content stale ships
- **THEN** `capabilities.cli` includes `content stale`

#### Scenario: About lists content_stale MCP

- **WHEN** a client calls `sdm about --json` after the MCP tool ships
- **THEN** `capabilities.mcp` includes `content_stale`
