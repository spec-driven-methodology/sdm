## ADDED Requirements

### Requirement: Suggest quality-report lever
When a methodology project exists, `sdm suggest` SHALL include a suggestion or lever that points agents to `quality report` (CLI hint including `--json`, and optionally `--profile`/`--level` when focus is set) for a summary ●○○ quality view distinct from raw `audit`.

#### Scenario: Lever present with profile focus
- **WHEN** suggest runs with `--profile` and `--level` on a valid project
- **THEN** at least one lever or suggestion `commandHint` references `quality report`
