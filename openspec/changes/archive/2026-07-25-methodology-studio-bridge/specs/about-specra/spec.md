## ADDED Requirements

### Requirement: About capabilities list studio bridge commands

When studio bridge CLI commands ship, the about payload `capabilities.cli` SHALL include `studio push-view`, `studio pull-action`, and `studio serve`.

#### Scenario: About lists bridge commands

- **WHEN** a client calls `sdm about --json` after the bridge ships
- **THEN** `capabilities.cli` includes `studio push-view`, `studio pull-action`, and `studio serve`
