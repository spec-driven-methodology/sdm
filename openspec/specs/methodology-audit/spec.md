## Purpose

Read-only methodology quality audit for ontology, library duplicates, and optional certification coverage.

## Requirements

### Requirement: Methodology quality audit
The system SHALL provide a read-only methodology audit that reports skill count, isolated skills, skills unused by certification levels, question count, same-skill lexical near duplicates, prioritized recommendations, and optional profile/level coverage.

#### Scenario: Audit a project without coverage target
- **WHEN** an agent runs the audit in a valid methodology project
- **THEN** the result contains ontology and library findings and deterministic recommendations

#### Scenario: Audit coverage target
- **WHEN** an agent supplies both a profile and level
- **THEN** the result includes the existing coverage result and recommendations for missing or thin skills

### Requirement: Agent interfaces for audit
The system SHALL expose the audit through `sdm audit [--profile <id> --level <id>] [--json]` and an MCP `audit` tool with equivalent JSON payloads.

#### Scenario: JSON audit
- **WHEN** an agent invokes `sdm audit --json`
- **THEN** stdout contains an `{ ok: true, document, projectRoot }` envelope

### Requirement: Semantic duplicates when index present
When `search.provider` is `lancedb` and a semantic index exists, audit SHALL include optional `library.semanticDuplicates`.

#### Scenario: Semantic duplicates attached
- **WHEN** audit runs with an existing index containing near-duplicate question texts
- **THEN** the audit document may list `semanticDuplicates` in addition to lexical duplicates

### Requirement: Audit reports invalid weight sums
The methodology audit SHALL detect certification levels whose requirement weights do not sum to 1 within ε (`1e-6`) and include a deterministic finding for each such level (level id, actual sum, delta from 1) without mutating files.

#### Scenario: Level with drifted weights
- **WHEN** a project contains a level whose requirement weights sum to 1.1
- **AND** an agent runs `sdm audit --json`
- **THEN** the audit document includes a finding identifying that level and the weight-sum violation
- **AND** recommendations prioritize fixing weights via `cert reweight` (or equivalent)

#### Scenario: Healthy weight sums
- **WHEN** all levels have requirement weights summing to 1 within ε
- **THEN** the audit MUST NOT report a weight-sum violation for those levels

### Requirement: Audit advises mono-type libraries

When a methodology audit runs, the system SHALL detect skills that have at least three questions and all of those questions share the same `type`. For each such skill the audit document SHALL include a non-blocking recommendation (priority low or medium) suggesting diversifying via `question generate --mix mixed` (or equivalent intent). This finding MUST NOT change certification coverage status (`ok` / `thin` / `missing`).

#### Scenario: Mono-type skill gets recommendation

- **WHEN** skill `docker` has three or more questions all of type `single_choice`
- **AND** an agent runs `sdm audit --json`
- **THEN** `recommendations` includes a message identifying type mono-culture for that skill (or library-wide mono-type pattern)
- **AND** coverage fields, when present, are computed as before without a new failing status for type diversity

#### Scenario: Diverse types skip mono-type recommendation

- **WHEN** a skill has questions of at least two different types
- **THEN** the audit MUST NOT emit a mono-type diversity recommendation for that skill

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

### Requirement: Audit aligns with shared quality findings where applicable

`sdm audit` SHALL reuse or mirror the shared validate heuristics for library-level issues already covered by the validate pipeline (e.g. distractor length/position, near-dup pairs) so agents see consistent codes/messages between `question validate` and `audit --json` where overlap exists. Audit MAY continue to report additional ontology/coverage findings beyond per-draft validate.

#### Scenario: Near-dup pair appears in audit JSON

- **WHEN** two same-skill questions exceed the near-dup threshold and the agent runs `audit --json`
- **THEN** the audit payload includes a finding referencing those question ids (or equivalent duplicate finding)

### Requirement: Audit remains the detailed live check beside quality report
The methodology audit (`sdm.audit/v1`) SHALL remain available and unchanged in its required document shape. Quality report is a sibling summary artifact and MUST NOT replace or rename the `audit` CLI/MCP tool.

#### Scenario: Audit schema stable
- **WHEN** `sdm audit --json` runs
- **THEN** `document.schemaVersion` is `sdm.audit/v1` and includes `ontology` and `library` sections
