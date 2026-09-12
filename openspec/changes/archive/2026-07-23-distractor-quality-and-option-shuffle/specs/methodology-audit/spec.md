## ADDED Requirements

### Requirement: Audit reports choice-option position bias

When `quality.distractorQuality` is `soft` or `strict`, the methodology audit SHALL compute the share of choice questions (`single_choice` | `multi_choice`) whose minimum 1-based `correct` index is `1`. When the choice sample size is at least `minChoiceSample` (default 5) and that share is at least `positionBiasThreshold` (default 0.6), the audit document SHALL include a finding with the share, sample size, and a recommendation to vary correct position when authoring and/or use option shuffle at export/player. When policy is `off`, the audit MUST NOT emit this finding.

#### Scenario: High first-position rate under soft

- **WHEN** `distractorQuality` is `soft` and at least 5 choice questions all have `correct: 1` (or min correct index 1)
- **AND** an agent runs `sdm audit --json`
- **THEN** the audit document includes a position-bias finding with share `1` (or 100%)
- **AND** recommendations mention fixing library order and/or `--shuffle-options` / player option shuffle

#### Scenario: Off policy skips position finding

- **WHEN** `distractorQuality` is `off` (default)
- **AND** all choice questions have `correct: 1`
- **THEN** the audit MUST NOT report a choice-option position-bias finding

### Requirement: Audit reports correct-option length outliers

When `quality.distractorQuality` is `soft` or `strict`, the methodology audit SHALL evaluate length-band / unique-longest outlier rules (see `distractor-quality`) for each choice question and SHALL list failing question ids in the audit document (JSON), with a human-readable recommendation to rewrite distractors to comparable length. Priority SHALL be `medium` for `soft` and `high` for `strict`. When policy is `off`, the audit MUST NOT emit length-outlier findings.

#### Scenario: Longest-correct outliers listed

- **WHEN** `distractorQuality` is `soft`
- **AND** a choice question has a uniquely longest correct option at least 1.3× the next option
- **AND** an agent runs `sdm audit --json`
- **THEN** that question id appears in the length-outlier finding list
- **AND** recommendations advise rewriting distractors for length parity

#### Scenario: Balanced library skips length finding

- **WHEN** `distractorQuality` is `soft`
- **AND** all choice questions pass length-band evaluation
- **THEN** the audit MUST NOT report length-outlier question ids
