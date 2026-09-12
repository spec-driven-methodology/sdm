# question-add

## Purpose

Add validated questions to the methodology library, bound to a skill (agent-friendly write path).
## Requirements
### Requirement: Add question bound to a skill
The system SHALL provide a non-interactive command `sdm question add` that creates a question file in `library/questions` bound to a skill via required `--to-skill`.

#### Scenario: Add single_choice question for existing skill
- **WHEN** the user or agent runs `sdm question add --to-skill docker --type single_choice --difficulty 0.3 --text "…" --option "a" --option "b" --correct 1` in a methodology project where skill `docker` exists
- **THEN** the system writes a YAML file under `library/questions/`
- **AND** the file validates against the question schema with `skill: docker`

#### Scenario: Skill missing from ontology
- **WHEN** `--to-skill` refers to a skill with no file under `ontology/skills`
- **THEN** the system fails with a stable error code indicating the skill was not found
- **AND** no question file is written

#### Scenario: Refuse overwrite without force
- **WHEN** a question file with the same id already exists and `--force` is not set
- **THEN** the system fails with a stable error code
- **AND** the existing file is left unchanged

### Requirement: Validate before persist
The system SHALL validate the question payload with the shared Zod question schema before writing any file.

#### Scenario: Invalid payload
- **WHEN** required fields for the chosen type are missing or invalid (e.g. single_choice without options)
- **THEN** the system fails with a validation error
- **AND** no file is written

### Requirement: Machine-readable success and failure
The system SHALL support `--json` output for agents and CI.

#### Scenario: JSON success
- **WHEN** `question add` succeeds with `--json`
- **THEN** stdout contains JSON including at least question id, skill, and file path

#### Scenario: JSON failure
- **WHEN** `question add` fails with `--json`
- **THEN** stdout or stderr contains JSON including a stable error `code` and `message`
- **AND** the process exit code is non-zero

### Requirement: Close coverage gap after add
After a successful add for a previously uncovered skill, a subsequent `cert coverage` run SHALL count the new question toward that skill.

#### Scenario: Docker gap closed from missing
- **WHEN** a methodology project has level requirements including docker with zero questions
- **AND** an agent adds at least one valid question with `--to-skill docker`
- **AND** the user runs `sdm cert coverage` for that level
- **THEN** docker is no longer classified as missing (0 questions)

### Requirement: Optional topics on questions
The system SHALL accept an optional `topics` string array on question YAML and on `question add`.

#### Scenario: Add question with topics
- **WHEN** an agent runs `sdm question add --to-skill docker --type open --difficulty 0.3 --text "…" --topic networking --topic images --json`
- **THEN** the written YAML includes `topics: [networking, images]`

#### Scenario: Omit topics
- **WHEN** `question add` is run without `--topic`
- **THEN** the question is valid with an empty topics list (or omitted defaulting to empty on read)

### Requirement: Optional topics on skills
The system SHALL accept optional `topics` on skill YAML and `skill add --topic`.

#### Scenario: Add skill with topics
- **WHEN** `sdm skill add sql --name SQL --topic indexes --topic transactions --json`
- **THEN** the skill file includes those topics

### Requirement: Optional expected for open questions on add

`sdm question add` SHALL accept one or more `--expected <text>` flags when `--type open` and SHALL persist them as `expected` on the question file after Zod validation. When `--expected` is supplied with a non-`open` type, the command SHALL fail with a stable validation error and MUST NOT write a file. MCP `question_add` SHALL accept the same `expected` value shape.

#### Scenario: Add open question with expected

- **WHEN** an agent runs `sdm question add --to-skill docker --type open --difficulty 0.3 --text "…" --expected "image" --expected "Image" --json`
- **THEN** the written YAML includes `expected` containing both values
- **AND** the `--json` success payload includes the question with `expected`

#### Scenario: Reject expected on single_choice

- **WHEN** `question add` is run with `--type single_choice` and at least one `--expected`
- **THEN** the command fails with a validation error
- **AND** no question file is written

#### Scenario: MCP question_add with expected

- **WHEN** a host calls `question_add` with `type: open` and `expected` set to a string or string array
- **THEN** the tool returns success and the library file contains `expected`

### Requirement: Strict distractor quality gate on question add

When project `quality.distractorQuality` is `strict` and the payload is `single_choice` or `multi_choice`, `sdm question add` SHALL evaluate length-band / unique-longest outlier rules before writing. If the question fails, the command SHALL fail with stable SdmError code `DISTRACTOR_QUALITY`, MUST NOT write a file, and with `--json` SHALL return `{ ok: false, code: "DISTRACTOR_QUALITY", message }`. When policy is `off` or `soft`, `question add` MUST NOT reject solely for distractor length (soft enforcement is audit-only).

#### Scenario: Strict rejects short distractors

- **WHEN** `sdm.yaml` has `quality.distractorQuality: strict`
- **AND** an agent runs `question add` for `single_choice` with a correct option much longer than distractors (fails length band)
- **THEN** the command exits non-zero with code `DISTRACTOR_QUALITY`
- **AND** no new file appears under `library/questions/`

#### Scenario: Soft still writes unbalanced options

- **WHEN** `distractorQuality` is `soft`
- **AND** an agent adds a choice question that would fail the length band
- **THEN** the question file is written successfully (audit will report the smell)

#### Scenario: Off ignores length on add

- **WHEN** `distractorQuality` is `off` or omitted
- **AND** an agent adds a choice question with short distractors
- **THEN** the add succeeds if the payload is otherwise valid

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

### Requirement: Stamp meta.basis on successful question add

When `question add` persists a new question, the written YAML MUST include `meta.basis` with the current content hash of the target skill under `skills[<skillId>]` and an ISO `capturedAt`. Existing validate/reject behavior MUST remain unchanged when add fails.

#### Scenario: Successful add writes basis

- **WHEN** an agent successfully adds a question to skill `java-core`
- **THEN** the persisted question file contains `meta.basis.skills.java-core` equal to the current hash of that skill and a non-empty `capturedAt`

#### Scenario: Failed add does not invent basis files

- **WHEN** `question add` fails validation or gates
- **THEN** no new question file is written with a fabricated basis

