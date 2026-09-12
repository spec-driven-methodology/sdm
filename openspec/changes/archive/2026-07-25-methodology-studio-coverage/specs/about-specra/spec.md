## ADDED Requirements

### Requirement: About capabilities list studio push-coverage

When `sdm studio push-coverage` ships, the about payload `capabilities.cli` SHALL include `studio push-coverage`.

#### Scenario: About lists push-coverage

- **WHEN** a client calls `sdm about --json` after push-coverage ships
- **THEN** `capabilities.cli` includes `studio push-coverage`
