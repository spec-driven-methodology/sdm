## ADDED Requirements

### Requirement: Methodology quality audit
The system SHALL provide a read-only methodology audit that reports skill count, isolated skills, skills unused by certification levels, question count, same-skill lexical near duplicates, prioritized recommendations, and optional role/level coverage.

#### Scenario: Audit a project without coverage target
- **WHEN** an agent runs the audit in a valid methodology project
- **THEN** the result contains ontology and library findings and deterministic recommendations

#### Scenario: Audit coverage target
- **WHEN** an agent supplies both a role and level
- **THEN** the result includes the existing coverage result and recommendations for missing or thin skills

### Requirement: Agent interfaces for audit
The system SHALL expose the audit through `sdm audit [--role <id> --level <id>] [--json]` and an MCP `audit` tool with equivalent JSON payloads.

#### Scenario: JSON audit
- **WHEN** an agent invokes `sdm audit --json`
- **THEN** stdout contains an `{ ok: true, document, projectRoot }` envelope

#### Scenario: Invalid project
- **WHEN** an agent invokes audit outside a methodology project
- **THEN** the interface returns the existing structured `SdmError` code
