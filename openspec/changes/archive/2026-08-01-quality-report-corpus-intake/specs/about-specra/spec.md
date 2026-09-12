## ADDED Requirements

### Requirement: About capabilities list quality report
The about payload `capabilities.cli` SHALL include `quality report` and `capabilities.mcp` SHALL include `quality_report`, kept in sync with CLI and MCP registration.

#### Scenario: About JSON lists quality surfaces
- **WHEN** an agent runs `sdm about --json`
- **THEN** `capabilities.cli` contains `quality report` and `capabilities.mcp` contains `quality_report`
