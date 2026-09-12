## ADDED Requirements

### Requirement: Coverage reports blueprint fields when enabled

When `quality.coverageMode` is `blueprint`, `sdm cert coverage --json` SHALL include per-skill `reasons` (and MAY include `workItems` at the report root or per skill) reflecting blueprint classification. When mode is `legacy`, the existing coverage JSON fields and status heuristics MUST remain unchanged.

#### Scenario: Blueprint coverage JSON includes reasons

- **WHEN** an agent runs `cert coverage --profile X --level Y --json` with blueprint mode and a thin skill due to topic gaps
- **THEN** the skill entry includes a non-empty `reasons` list explaining why status is not `ok`
