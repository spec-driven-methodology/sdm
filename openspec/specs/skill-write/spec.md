# skill-write

## Purpose

Create ontology skills and update dependency links via agent-friendly CLI commands.
## Requirements
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

### Requirement: Reject depends_on cycles on link
The system SHALL refuse `skill link` when merging the requested `depends_on` edges would introduce a directed cycle in the ontology graph.

#### Scenario: Link creates cycle
- **WHEN** skill A already depends on B, and an agent runs `sdm skill link B --depends-on A`
- **THEN** the command fails with code `CYCLE_DETECTED`
- **AND** neither skill YAML is modified

#### Scenario: Link keeps DAG
- **WHEN** linking adds a `depends_on` edge that does not create a cycle
- **THEN** the skill file is updated as today (merge + dedupe)

### Requirement: Skill topics field
The system SHALL allow optional `topics` on skills created via `skill add`.

#### Scenario: skill add with topics
- **WHEN** `skill add` receives one or more `--topic` flags
- **THEN** the skill YAML stores them under `topics`

### Requirement: Optional skillGate for description and topics

The system SHALL accept `quality.skillGate` in `sdm.yaml` with values `off`, `soft`, or `strict`, defaulting to `off`. When `soft`, `skill add` MAY succeed with JSON warnings if description is empty/too short or topics length is below the configured minimum (default 3). When `strict`, `skill add` MUST fail with a stable SdmError code and MUST NOT write the skill file.

#### Scenario: Strict skillGate rejects empty topics

- **WHEN** `quality.skillGate` is `strict` and an agent runs `skill add` without enough topics
- **THEN** the command fails with a stable error code
- **AND** no skill YAML is written

#### Scenario: Off skillGate preserves current behavior

- **WHEN** `quality.skillGate` is `off` or omitted
- **THEN** `skill add` succeeds with empty description/topics as today (subject to existing schema defaults)

