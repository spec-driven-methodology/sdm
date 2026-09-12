## ADDED Requirements

### Requirement: Write path uses shared validate pipeline

Before persisting, `sdm question add` SHALL run the shared question validation pipeline (same rules as `question validate`). Structural failures MUST always block the write. Policy failures MUST respect `quality.writeGate`: `off` ignores policy gates for write; `soft` allows write and MAY include `warnings`/`findings` in `--json`; `strict` MUST reject the write with a stable SdmError code and write no file.

#### Scenario: Strict writeGate rejects invalid topic

- **WHEN** `quality.writeGate` is `strict` and the agent adds a question with a topic not listed on the target skill
- **THEN** the command fails with a stable error code
- **AND** no file is written under `library/questions/`

#### Scenario: Soft writeGate writes with warnings

- **WHEN** `quality.writeGate` is `soft` and a non-structural policy finding is present
- **THEN** the question file is written
- **AND** `--json` success payload includes warnings or findings describing the issue

### Requirement: Near-duplicate gate on add

When near-dup policy is active under `writeGate: strict` (or equivalent), `question add` MUST reject drafts whose text exceeds the configured near-dup threshold against an existing same-skill question, with stable code `QUESTION_NEAR_DUPLICATE`.

#### Scenario: Near duplicate blocked on add

- **WHEN** writeGate is `strict` and the new question text is a near duplicate of an existing same-skill question
- **THEN** add fails with `QUESTION_NEAR_DUPLICATE` (or equivalent)
- **AND** no file is written
