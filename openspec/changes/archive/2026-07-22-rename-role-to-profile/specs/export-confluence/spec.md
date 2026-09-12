## ADDED Requirements

### Requirement: Export confluence uses profile
`sdm export confluence` SHALL take `--profile` (and optional level/team) using Profile terminology in flags and payloads.

#### Scenario: Confluence export by profile
- **WHEN** an agent runs `sdm export confluence --profile java-developer --json`
- **THEN** the command succeeds with JSON naming the profile, not role
