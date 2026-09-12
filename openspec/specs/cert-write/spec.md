# cert-write

## Purpose

Create certification levels with requirements for an existing profile via agent-friendly CLI.

## Requirements

### Requirement: Create certification level for existing profile
The system SHALL provide a non-interactive command `sdm cert create` that writes a level file under `certifications/levels` for an **existing** profile under `certifications/profiles` (or a legacy `roles/` profile resolved via loaders), validated by the shared profile and level schemas. The command SHALL append the new level id to the profile’s `levels` list and MUST NOT invent a missing profile file.

#### Scenario: Create level for existing profile with requirements
- **WHEN** profile `qa-engineer` already exists and skill `java-core` exists
- **AND** an agent runs `sdm cert create --profile qa-engineer --level qa-middle --level-title "Middle QA" --requirement java-core:0.5:1.0`
- **THEN** the system writes `certifications/levels/qa-middle.yaml` with matching `profile`, requirements, and default or provided threshold
- **AND** updates `certifications/profiles/qa-engineer.yaml` so `levels` includes `qa-middle` without removing existing level ids (deduplicated)
- **AND** preserves the existing profile `title`

#### Scenario: Profile missing
- **WHEN** `cert create` is run for a profile id with no resolvable profile file
- **THEN** the system fails with stable error code `PROFILE_NOT_FOUND`
- **AND** no level file is written

#### Scenario: Legacy roles profile migrates on write
- **WHEN** the profile exists only under `certifications/roles/` with YAML key `role`
- **AND** `cert create` succeeds for that profile id
- **THEN** the updated profile is written under `certifications/profiles/` with YAML key `profile`

#### Scenario: Refuse level overwrite without force
- **WHEN** the level file already exists and `--force` is not set
- **THEN** the system fails with a stable level-exists error
- **AND** the level file is unchanged

#### Scenario: Requirement skill missing
- **WHEN** a `--requirement` references a skill not present in ontology
- **THEN** the system fails with a stable skill-not-found error
- **AND** no incomplete certification files are left from the failed write (best effort: do not write level; do not mutate profile until validations pass)

### Requirement: Parse requirement triples
The system SHALL accept repeatable `--requirement <skill:depth:weight>` flags and map them to level requirements.

#### Scenario: Invalid requirement format
- **WHEN** a `--requirement` value cannot be parsed as skill:depth:weight with numeric depth/weight in 0..1
- **THEN** the system fails with a validation error

### Requirement: Machine-readable cert create output
The system SHALL support `--json` on `sdm cert create` for agents and CI.

#### Scenario: JSON success
- **WHEN** `cert create` succeeds with `--json`
- **THEN** stdout contains JSON with `ok: true`, profile and level payloads, and file paths

#### Scenario: JSON failure
- **WHEN** `cert create` fails with `--json`
- **THEN** output contains JSON with `ok: false`, stable `code`, and `message`
- **AND** the process exit code is non-zero

### Requirement: Level weight sum invariant on create
The system SHALL treat requirement `weight` values as score shares. After a successful `sdm cert create`, the sum of persisted requirement weights MUST equal 1 within ε (`1e-6`).

#### Scenario: Normalize relative weights on create
- **WHEN** an agent runs `sdm cert create` with requirements whose weights are positive and sum to a value other than 1 (e.g. `4`, `3`, `2`, `1` scaled into 0..1 triples, or shares that sum to 0.9)
- **AND** `--no-normalize-weights` is not set
- **THEN** the system persists proportionally normalized shares summing to 1 within ε
- **AND** JSON success payload includes the persisted requirements and indicates weights were normalized

#### Scenario: Strict create rejects non-unit sum
- **WHEN** an agent runs `cert create` with `--no-normalize-weights` and requirement weights do not sum to 1 within ε
- **THEN** the system fails with stable error code `WEIGHT_SUM_INVALID`
- **AND** no level file is written and the profile is not mutated

#### Scenario: Zero total weight rejected
- **WHEN** all requirement weights are 0
- **THEN** the system fails with stable error code `WEIGHT_SUM_INVALID`
- **AND** no incomplete certification files are left from the failed write

### Requirement: Create JSON exposes final shares
On successful `cert create --json`, the system SHALL return the final per-requirement weights as stored on disk (post-normalization when applicable).

#### Scenario: JSON includes persisted weights
- **WHEN** `cert create` succeeds with `--json` after normalizing weights
- **THEN** the level payload in JSON matches the written YAML weights

### Requirement: New certification is readable by coverage
After a successful `cert create`, `sdm cert coverage --profile <profile> --level <level>` SHALL be able to load the level and report coverage for its requirements.

#### Scenario: Coverage runs on created cert
- **WHEN** a certification was created with at least one requirement skill
- **AND** the agent runs `cert coverage` for that profile and level
- **THEN** the command loads the level successfully and reports per-skill coverage rows
