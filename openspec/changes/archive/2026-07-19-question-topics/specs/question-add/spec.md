## ADDED Requirements

### Requirement: Optional topics on questions
The system SHALL accept an optional `topics` string array on question YAML and on `question add`.

#### Scenario: Add question with topics
- **WHEN** an agent runs `sdm question add --to-skill docker --type open --difficulty 0.3 --text "…" --topic networking --topic images --json`
- **THEN** the written YAML includes `topics: [networking, images]`

#### Scenario: Omit topics
- **WHEN** `question add` is run without `--topic`
- **THEN** the question is valid with an empty topics list (or omitted defaulting to empty on read)

### Requirement: Optional topics on skills
The system SHALL accept optional `topics` on skill YAML and `skill add --topic`.

#### Scenario: Add skill with topics
- **WHEN** `sdm skill add sql --name SQL --topic indexes --topic transactions --json`
- **THEN** the skill file includes those topics
