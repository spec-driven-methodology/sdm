## ADDED Requirements

### Requirement: Patch certification level requirements

The system SHALL provide `sdm cert patch --level` to add, upsert, or remove requirement triples on an existing level without recreating it, with `--json` for agents.

#### Scenario: Add requirement to existing level

- **WHEN** an agent runs `sdm cert patch --level mid --add-requirement linux:0.5:0.5 --json` and skill `linux` exists
- **THEN** the level YAML MUST include the linux requirement and JSON MUST report `ok: true`

#### Scenario: Remove requirement

- **WHEN** an agent runs `sdm cert patch --level mid --remove-requirement docker --json`
- **THEN** docker MUST be absent from level requirements (and remaining requirements MUST be non-empty)
