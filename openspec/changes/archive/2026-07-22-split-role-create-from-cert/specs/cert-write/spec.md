## MODIFIED Requirements

### Requirement: Create certification role and level
The system SHALL provide a non-interactive command `sdm cert create` that writes a level file under `certifications/levels` for an **existing** role under `certifications/roles`, validated by the shared role and level schemas. The command SHALL append the new level id to the role’s `levels` list and MUST NOT create a missing role file.

#### Scenario: Create level for existing role with requirements
- **WHEN** role `qa-engineer` already exists and skill `java-core` exists
- **AND** an agent runs `sdm cert create --role qa-engineer --level qa-middle --level-title "Middle QA" --requirement java-core:0.5:1.0`
- **THEN** the system writes `certifications/levels/qa-middle.yaml` with matching `role`, requirements, and default or provided threshold
- **AND** updates `certifications/roles/qa-engineer.yaml` so `levels` includes `qa-middle` without removing existing level ids (deduplicated)
- **AND** preserves the existing role `title`

#### Scenario: Role missing
- **WHEN** `cert create` is run for a role id with no file under `certifications/roles`
- **THEN** the system fails with stable error code `ROLE_NOT_FOUND`
- **AND** no level file is written

#### Scenario: Refuse level overwrite without force
- **WHEN** the level file already exists and `--force` is not set
- **THEN** the system fails with a stable level-exists error
- **AND** the level file is unchanged

#### Scenario: Requirement skill missing
- **WHEN** a `--requirement` references a skill not present in ontology
- **THEN** the system fails with a stable skill-not-found error
- **AND** no incomplete certification files are left from the failed write (best effort: do not write level; do not mutate role until validations pass)

## ADDED Requirements

### Requirement: cert create does not invent role title
`sdm cert create` SHALL NOT require `--role-title` to create a new role. Optional `--role-title`, if provided, MUST match the existing role title or the command fails with `VALIDATION_FAILED`.

#### Scenario: Optional role title mismatch
- **WHEN** the role exists with title `QA` and `cert create` passes `--role-title "Other"`
- **THEN** the system fails with `VALIDATION_FAILED` and does not write the level

#### Scenario: cert create without role-title
- **WHEN** the role exists and `cert create` omits `--role-title`
- **THEN** the level is created successfully using the stored role identity
