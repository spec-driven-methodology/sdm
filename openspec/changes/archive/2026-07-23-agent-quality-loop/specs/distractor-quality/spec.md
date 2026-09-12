## ADDED Requirements

### Requirement: WriteGate integrates distractor rules

The system SHALL treat distractor length/position evaluation as part of the shared validate/add pipeline when `quality.writeGate` is `soft` or `strict`, or when `quality.distractorQuality` is `soft` or `strict` (existing setting). Exact precedence MUST be documented; `writeGate: strict` MUST NOT silently weaken an explicit `distractorQuality: strict`.

#### Scenario: Strict distractor still blocks add

- **WHEN** `quality.distractorQuality` is `strict` and a choice question fails the length band
- **THEN** `question add` fails with a distractor-quality related stable code and does not write a file

#### Scenario: WriteGate soft surfaces distractor findings on validate

- **WHEN** `quality.writeGate` is `soft` and a choice draft fails the length band
- **THEN** `question validate --json` includes a finding or warning for distractor length quality
