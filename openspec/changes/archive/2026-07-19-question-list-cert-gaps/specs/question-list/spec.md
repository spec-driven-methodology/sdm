## ADDED Requirements

### Requirement: List questions in the library

The system SHALL provide `sdm question list` that lists methodology library questions with optional `--skill` filter and `--json` output.

#### Scenario: List filtered by skill

- **WHEN** an agent runs `sdm question list --skill docker --json`
- **THEN** the JSON MUST include only questions bound to `docker` with id, skill, type, and difficulty fields
