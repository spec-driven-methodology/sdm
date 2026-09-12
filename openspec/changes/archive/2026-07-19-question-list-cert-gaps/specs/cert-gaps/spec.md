## ADDED Requirements

### Requirement: Report certification gaps

The system SHALL provide `sdm cert gaps --role --level` that returns only skills with coverage status `missing` or `thin`, with `--json` for agents.

#### Scenario: Gaps exclude ok skills

- **WHEN** a level has one ok skill and one missing skill
- **THEN** `cert gaps --json` MUST include the missing skill in `gaps` and MUST NOT include the ok skill in `gaps`
