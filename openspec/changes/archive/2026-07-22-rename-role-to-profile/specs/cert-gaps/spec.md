## ADDED Requirements

### Requirement: Gaps uses profile flag
`sdm cert gaps` SHALL accept `--profile <id>` and return gaps for that profile’s level; `--json` payloads SHALL name the profile field `profile`.

#### Scenario: Gaps by profile
- **WHEN** an agent runs `sdm cert gaps --profile java-developer --level middle --json`
- **THEN** stdout JSON has `ok: true` and identifies the profile without a `role` entity field
