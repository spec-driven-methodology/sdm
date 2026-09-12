## ADDED Requirements

### Requirement: Stamp meta.basis on successful question add

When `question add` persists a new question, the written YAML MUST include `meta.basis` with the current content hash of the target skill under `skills[<skillId>]` and an ISO `capturedAt`. Existing validate/reject behavior MUST remain unchanged when add fails.

#### Scenario: Successful add writes basis

- **WHEN** an agent successfully adds a question to skill `java-core`
- **THEN** the persisted question file contains `meta.basis.skills.java-core` equal to the current hash of that skill and a non-empty `capturedAt`

#### Scenario: Failed add does not invent basis files

- **WHEN** `question add` fails validation or gates
- **THEN** no new question file is written with a fabricated basis
