## ADDED Requirements

### Requirement: Audit optional scope uses profile
`sdm audit` optional certification scope SHALL use `--profile` and `--level`; help and JSON SHALL say profile, not role.

#### Scenario: Audit with profile scope
- **WHEN** an agent runs `sdm audit --profile java-developer --level middle --json`
- **THEN** coverage-related audit sections resolve that profile/level
