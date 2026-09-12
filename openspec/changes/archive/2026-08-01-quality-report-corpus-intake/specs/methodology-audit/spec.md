## ADDED Requirements

### Requirement: Audit remains the detailed live check beside quality report
The methodology audit (`sdm.audit/v1`) SHALL remain available and unchanged in its required document shape. Quality report is a sibling summary artifact and MUST NOT replace or rename the `audit` CLI/MCP tool.

#### Scenario: Audit schema stable
- **WHEN** `sdm audit --json` runs
- **THEN** `document.schemaVersion` is `sdm.audit/v1` and includes `ontology` and `library` sections
