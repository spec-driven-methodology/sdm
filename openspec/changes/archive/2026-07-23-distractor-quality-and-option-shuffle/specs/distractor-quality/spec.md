## ADDED Requirements

### Requirement: Distractor quality policy in project config

The system SHALL accept an optional `quality.distractorQuality` setting in `sdm.yaml` with values `off`, `soft`, or `strict`, defaulting to `off` when omitted. The setting MUST NOT depend on certification `threshold`. Optional knobs MAY include `lengthBandRatio` (default `0.5`), `positionBiasThreshold` (default `0.6`), and `minChoiceSample` (default `5`), validated by Zod on config load.

#### Scenario: Default is off

- **WHEN** a project’s `sdm.yaml` omits `quality`
- **THEN** distractor quality enforcement behaves as `off`

#### Scenario: Strict mode configured

- **WHEN** `quality.distractorQuality` is `strict`
- **THEN** write-path and audit consumers treat the project as strict per their capability specs

### Requirement: Length-band evaluation for choice questions

The system SHALL evaluate length quality for `single_choice` and `multi_choice` questions that have at least two options. Let `C` be the character length of the correct option (`single_choice`) or the maximum length among correct options (`multi_choice`). With ratio `R` = configured `lengthBandRatio` (default `0.5`), a distractor fails the band when its length is outside `[C·R, C/R]`. A question also fails when the correct option is uniquely longest and `C ≥ 1.3 ×` the second-longest option length.

#### Scenario: Short distractors fail the band

- **WHEN** a `single_choice` question has correct option length 60 and a distractor length 10 with default `R = 0.5`
- **THEN** length-band evaluation marks that question as failing

#### Scenario: Balanced options pass

- **WHEN** all option lengths for a choice question lie within the length band of `C` and the correct option is not a 1.3× unique longest outlier
- **THEN** length-band evaluation marks that question as passing

### Requirement: Agent guidance for distractor quality

Portable agent skills that draft or add choice questions SHALL instruct agents to write distractors of comparable length and surface plausibility (not joke/absurd shorts when the correct answer is a full sentence), and to consult `sdm audit` when `distractorQuality` is `soft` or `strict`.

#### Scenario: Generate-questions skill mentions length parity

- **WHEN** an agent follows `agents/generate-questions/SKILL.md` after this change
- **THEN** the skill text includes guidance to match distractor length/plausibility to the correct option
