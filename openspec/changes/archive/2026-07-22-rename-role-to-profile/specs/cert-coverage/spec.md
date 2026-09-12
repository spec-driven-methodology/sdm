## ADDED Requirements

### Requirement: Coverage uses profile flag
`sdm cert coverage` SHALL accept `--profile <id>` (not `--role`) and resolve the profile via the profile-domain layout/compat rules.

#### Scenario: Coverage by profile
- **WHEN** an agent runs `sdm cert coverage --profile java-developer --level middle --json`
- **THEN** the command loads that profile’s level and returns coverage JSON referencing `profile`
