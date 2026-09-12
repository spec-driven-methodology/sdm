## ADDED Requirements

### Requirement: Generate drafts honor type-mix preset

The system SHALL accept an optional mix preset on `sdm question generate` (CLI flag such as `--mix`, and MCP equivalent) with values `single`, `mixed`, or `full`. When mix is omitted and `--type` is omitted, behavior SHALL remain equivalent to homogeneous `single_choice` (backward compatible). When `--mix` is set, each returned draft stub SHALL use the type from the type-mix assignment for its index, and the JSON payload SHALL include the effective `typeMix` and per-draft `type`. The command MUST still not write library YAML.

#### Scenario: Mixed generate returns varied stub types

- **WHEN** an agent runs `sdm question generate --to-skill docker --count 3 --mix mixed --json` for an existing skill
- **THEN** `ok` is true, `typeMix` is `mixed`, and the three drafts have types `single_choice`, `multi_choice`, and `open` respectively
- **AND** no new files are created under `library/questions/`

#### Scenario: Default remains single_choice

- **WHEN** an agent runs `sdm question generate --to-skill docker --count 2 --json` without `--mix` or `--type`
- **THEN** both drafts have `type` `single_choice`

#### Scenario: Homogeneous --type unchanged

- **WHEN** an agent runs `sdm question generate --to-skill docker --count 2 --type multi_choice --json`
- **THEN** both drafts have `type` `multi_choice`

### Requirement: Open drafts under mix include expected guidance

When a draft is assigned `type: open`, the stub and/or `agentPrompt` SHALL instruct the agent to supply a short answer and persist an unambiguous expected answer via `question add` (using `expected` when that field is available). Choice-type drafts SHALL continue to include options/correct placeholders.

#### Scenario: Open stub is not a choice shell

- **WHEN** generate runs with `--mix mixed` and count ≥ 3
- **THEN** the `open` draft does not require fake multiple-choice options as the persistence shape
- **AND** the agent-facing instructions mention filling a short textual answer (and `expected` when supported)
