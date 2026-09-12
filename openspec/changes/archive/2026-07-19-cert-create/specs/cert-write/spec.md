## ADDED Requirements

### Requirement: Create certification role and level
The system SHALL provide a non-interactive command `sdm cert create` that writes a role file under `certifications/roles` and a level file under `certifications/levels`, validated by the shared role and level schemas.

#### Scenario: Create role and level with requirements
- **WHEN** an agent runs `sdm cert create --role qa-engineer --role-title "QA" --level qa-middle --level-title "Middle QA" --requirement java-core:0.5:1.0` and skill `java-core` exists
- **THEN** the system writes `certifications/roles/qa-engineer.yaml` listing level `qa-middle`
- **AND** writes `certifications/levels/qa-middle.yaml` with matching `role`, requirements, and default or provided threshold

#### Scenario: Upsert role levels list
- **WHEN** the role file already exists and `cert create` adds another level id
- **THEN** the role `levels` array includes the new level id without removing existing ones (deduplicated)

#### Scenario: Refuse level overwrite without force
- **WHEN** the level file already exists and `--force` is not set
- **THEN** the system fails with a stable level-exists error
- **AND** the level file is unchanged

#### Scenario: Requirement skill missing
- **WHEN** a `--requirement` references a skill not present in ontology
- **THEN** the system fails with a stable skill-not-found error
- **AND** no incomplete certification files are left from the failed write (best effort: do not write level; role upsert only after validations pass)

### Requirement: Parse requirement triples
The system SHALL accept repeatable `--requirement <skill:depth:weight>` flags and map them to level requirements.

#### Scenario: Invalid requirement format
- **WHEN** a `--requirement` value cannot be parsed as skill:depth:weight with numeric depth/weight in 0..1
- **THEN** the system fails with a validation error

### Requirement: Machine-readable cert create output
The system SHALL support `--json` on `sdm cert create` for agents and CI.

#### Scenario: JSON success
- **WHEN** `cert create` succeeds with `--json`
- **THEN** stdout contains JSON with `ok: true`, role and level payloads, and file paths

#### Scenario: JSON failure
- **WHEN** `cert create` fails with `--json`
- **THEN** output contains JSON with `ok: false`, stable `code`, and `message`
- **AND** the process exit code is non-zero

### Requirement: New certification is readable by coverage
After a successful `cert create`, `sdm cert coverage --role <role> --level <level>` SHALL be able to load the level and report coverage for its requirements.

#### Scenario: Coverage runs on created cert
- **WHEN** a certification was created with at least one requirement skill
- **AND** the agent runs `cert coverage` for that role and level
- **THEN** the command loads the level successfully and reports per-skill coverage rows
