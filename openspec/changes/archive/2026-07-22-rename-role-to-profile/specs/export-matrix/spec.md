## ADDED Requirements

### Requirement: Export matrix uses profile
`sdm export matrix` SHALL take `--profile` and emit matrix document fields for `profile` / title / levels (not `role`).

#### Scenario: Matrix by profile
- **WHEN** an agent runs `sdm export matrix --profile java-developer --json`
- **THEN** stdout JSON document identifies the profile id and title under profile-oriented fields
