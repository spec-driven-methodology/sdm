## ADDED Requirements

### Requirement: Add skill to ontology
The system SHALL provide a non-interactive command `sdm skill add` that creates a skill YAML file under `ontology/skills` validated by the shared skill schema.

#### Scenario: Create new skill
- **WHEN** an agent runs `sdm skill add kubernetes --name "Kubernetes" --category devops --desc "…"` in a methodology project
- **THEN** the system writes `ontology/skills/kubernetes.yaml` with `id: kubernetes` and the provided fields
- **AND** `depends_on` and `related_to` default to empty arrays when omitted

#### Scenario: Refuse overwrite without force
- **WHEN** the skill file already exists and `--force` is not set
- **THEN** the system fails with a stable error code
- **AND** the existing file is unchanged

#### Scenario: Force overwrite
- **WHEN** the skill file exists and `--force` is set
- **THEN** the system overwrites the skill file with the new validated payload

### Requirement: Link skill dependencies
The system SHALL provide `sdm skill link` to update `depends_on` and/or `related_to` on an existing skill.

#### Scenario: Add depends_on edges
- **WHEN** an agent runs `sdm skill link spring --depends-on java-core,sql` and those skills exist
- **THEN** the spring skill file includes those ids in `depends_on` (merged with any existing values, deduplicated)

#### Scenario: Missing dependency target
- **WHEN** `--depends-on` or `--related-to` references a skill id that does not exist in ontology
- **THEN** the system fails with a stable error code identifying the missing skill
- **AND** the skill file is not written

#### Scenario: Target skill missing
- **WHEN** `skill link` is invoked for an id with no ontology file
- **THEN** the system fails with a stable skill-not-found error

#### Scenario: Reject self-dependency
- **WHEN** `--depends-on` includes the same id as the skill being linked
- **THEN** the system fails with a validation error

### Requirement: Machine-readable skill write output
The system SHALL support `--json` on `skill add` and `skill link` for agents and CI.

#### Scenario: JSON success
- **WHEN** either command succeeds with `--json`
- **THEN** stdout contains JSON with `ok: true`, the skill payload, file path, and action name

#### Scenario: JSON failure
- **WHEN** either command fails with `--json`
- **THEN** output contains JSON with `ok: false`, stable `code`, and `message`
- **AND** the process exit code is non-zero
