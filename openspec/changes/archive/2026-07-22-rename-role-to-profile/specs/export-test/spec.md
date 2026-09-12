## ADDED Requirements

### Requirement: Export test uses profile
`sdm export test` SHALL take `--profile` and emit document fields naming `profile` (not `role`).

#### Scenario: Export test by profile
- **WHEN** an agent runs `sdm export test --profile java-developer --level middle --json`
- **THEN** the document identifies the profile under `profile` and includes selected questions
