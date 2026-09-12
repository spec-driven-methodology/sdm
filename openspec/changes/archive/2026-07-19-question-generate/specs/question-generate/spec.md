## ADDED Requirements

### Requirement: Generate question drafts without writing files

The system SHALL provide `sdm question generate --to-skill` that returns generation context and draft stubs with `--json`, without writing library YAML.

#### Scenario: Drafts for existing skill

- **WHEN** an agent runs `sdm question generate --to-skill docker --count 2 --json`
- **THEN** the JSON MUST include `ok: true`, `context` with skill metadata and existing question texts, and `drafts` of length 2
- **AND** no new files MUST be created under `library/questions/`

#### Scenario: Missing skill fails

- **WHEN** generate is invoked for a skill not in ontology
- **THEN** the system MUST fail with `SKILL_NOT_FOUND`
