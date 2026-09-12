## ADDED Requirements

### Requirement: studio sync installs or updates studio assets

The system SHALL provide a non-interactive command `sdm studio sync` that copies the shipped Methodology Studio template into `<project>/studio/` of the current methodology project. Without `--force`, existing files under `studio/` SHALL be left unchanged (skipped). With `--force`, only files under `studio/` SHALL be overwritten from the template; methodology YAML and other project roots (including `player/`) MUST NOT be modified by this command.

#### Scenario: Sync into project without studio

- **WHEN** a methodology project has no `studio/` directory and the user runs `sdm studio sync`
- **THEN** `studio/index.html` and accompanying assets are created from the Specra template

#### Scenario: Sync without force skips existing files

- **WHEN** `studio/index.html` already exists and `sdm studio sync` runs without `--force`
- **THEN** that file is not overwritten
- **AND** the command still succeeds (exit 0)

#### Scenario: Sync with force refreshes studio only

- **WHEN** `sdm studio sync --force` runs in a methodology project that already has `studio/` and customized methodology files
- **THEN** files under `studio/` match the current template
- **AND** `sdm.yaml`, `library/`, `ontology/`, `certifications/`, and `player/` are unchanged

#### Scenario: Not a methodology project

- **WHEN** `sdm studio sync` is run outside a SDM methodology project
- **THEN** the command fails with a stable `NOT_A_PROJECT` (or equivalent) error and non-zero exit

### Requirement: Agent-readable studio sync output

`sdm studio sync` SHALL support `--json` returning success with created/skipped path lists (or counts) and failure with `{ ok: false, code, message }`.

#### Scenario: JSON success

- **WHEN** `sdm studio sync --json` succeeds
- **THEN** stdout JSON has `ok: true` and reports created and skipped entries for the studio sync
