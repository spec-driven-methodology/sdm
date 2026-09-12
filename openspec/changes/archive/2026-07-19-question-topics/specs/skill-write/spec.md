## ADDED Requirements

### Requirement: Skill topics field
The system SHALL allow optional `topics` on skills created via `skill add`.

#### Scenario: skill add with topics
- **WHEN** `skill add` receives one or more `--topic` flags
- **THEN** the skill YAML stores them under `topics`
