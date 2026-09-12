## ADDED Requirements

### Requirement: Optional skillGate for description and topics

The system SHALL accept `quality.skillGate` in `sdm.yaml` with values `off`, `soft`, or `strict`, defaulting to `off`. When `soft`, `skill add` MAY succeed with JSON warnings if description is empty/too short or topics length is below the configured minimum (default 3). When `strict`, `skill add` MUST fail with a stable SdmError code and MUST NOT write the skill file.

#### Scenario: Strict skillGate rejects empty topics

- **WHEN** `quality.skillGate` is `strict` and an agent runs `skill add` without enough topics
- **THEN** the command fails with a stable error code
- **AND** no skill YAML is written

#### Scenario: Off skillGate preserves current behavior

- **WHEN** `quality.skillGate` is `off` or omitted
- **THEN** `skill add` succeeds with empty description/topics as today (subject to existing schema defaults)
