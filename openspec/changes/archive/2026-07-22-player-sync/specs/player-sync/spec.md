## ADDED Requirements

### Requirement: player sync installs or updates player assets

The system SHALL provide a non-interactive command `sdm player sync` that copies the shipped export-test player template into `<project>/player/` of the current methodology project. Without `--force`, existing files under `player/` SHALL be left unchanged (skipped). With `--force`, only files under `player/` SHALL be overwritten from the template; methodology YAML and other project roots MUST NOT be modified.

#### Scenario: Sync into project without player

- **WHEN** a methodology project has no `player/` directory and the user runs `sdm player sync`
- **THEN** `player/index.html` and accompanying assets are created from the Specra template

#### Scenario: Sync without force skips existing files

- **WHEN** `player/index.html` already exists and `sdm player sync` runs without `--force`
- **THEN** that file is not overwritten
- **AND** the command still succeeds (exit 0)

#### Scenario: Sync with force refreshes player only

- **WHEN** `sdm player sync --force` runs in a methodology project that already has `player/` and customized `README.md` elsewhere
- **THEN** files under `player/` match the current template
- **AND** `sdm.yaml`, `library/`, `ontology/`, and `certifications/` are unchanged

#### Scenario: Not a methodology project

- **WHEN** `sdm player sync` is run outside a SDM methodology project
- **THEN** the command fails with a stable `NOT_A_PROJECT` (or equivalent) error and non-zero exit

### Requirement: Agent-readable player sync output

`sdm player sync` SHALL support `--json` returning success with created/skipped path lists (or counts) and failure with `{ ok: false, code, message }`.

#### Scenario: JSON success

- **WHEN** `sdm player sync --json` succeeds
- **THEN** stdout JSON has `ok: true` and reports created and skipped entries for the player sync
