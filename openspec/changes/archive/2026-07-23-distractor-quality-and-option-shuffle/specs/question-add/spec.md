## ADDED Requirements

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
