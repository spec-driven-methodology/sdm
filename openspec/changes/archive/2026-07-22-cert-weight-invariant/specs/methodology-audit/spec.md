## ADDED Requirements

### Requirement: Audit reports invalid weight sums
The methodology audit SHALL detect certification levels whose requirement weights do not sum to 1 within ε (`1e-6`) and include a deterministic finding for each such level (level id, actual sum, delta from 1) without mutating files.

#### Scenario: Level with drifted weights
- **WHEN** a project contains a level whose requirement weights sum to 1.1
- **AND** an agent runs `sdm audit --json`
- **THEN** the audit document includes a finding identifying that level and the weight-sum violation
- **AND** recommendations prioritize fixing weights via `cert reweight` (or equivalent)

#### Scenario: Healthy weight sums
- **WHEN** all levels have requirement weights summing to 1 within ε
- **THEN** the audit MUST NOT report a weight-sum violation for those levels
