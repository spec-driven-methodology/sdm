## ADDED Requirements

### Requirement: Optional shuffle of choice options on export

The system SHALL accept optional `--shuffle-options` on `sdm export test` (MCP: `shuffleOptions`). When set, for each exported `single_choice` or `multi_choice` question the system SHALL apply a uniform random permutation to `options` and remap 1-based `correct` (number or array) to the new indices. Questions of type `open` or `code` MUST remain unchanged. Library YAML MUST NOT be modified. When `--shuffle-options` is omitted, option order MUST match the library (backward compatible).

#### Scenario: Shuffle remaps single_choice correct

- **WHEN** an agent runs `sdm export test --profile <p> --level <l> --shuffle-options --json`
- **AND** a `single_choice` question has options `[A,B,C,D]` with `correct: 1`
- **THEN** the exported question’s `options` are a permutation of `[A,B,C,D]`
- **AND** `correct` is the 1-based index of `A` in the permuted list

#### Scenario: Shuffle remaps multi_choice correct set

- **WHEN** export runs with `--shuffle-options` and a `multi_choice` question has `correct: [1, 3]`
- **THEN** exported `correct` lists the new 1-based indices of the same option texts (as a set)

#### Scenario: Default export keeps library order

- **WHEN** export runs without `--shuffle-options`
- **THEN** each choice question’s `options` and `correct` match the library file order and indices

### Requirement: Optional seed for option shuffle

The system SHALL reuse the existing `--seed <integer>` (also used for adaptive sampling) when `--shuffle-options` is set: option permutation SHALL be deterministic for the same input document and seed. When shuffle is enabled, `meta.optionShuffle` SHALL be present as `{ enabled: true, seed: <number> }`. When shuffle is disabled, `meta.optionShuffle` SHALL be omitted. Passing `--seed` without `--shuffle-options` MUST remain valid (adaptive / default seed behavior).

#### Scenario: Same seed reproduces permutation

- **WHEN** export with `--shuffle-options --seed 42` is run twice on the same project state
- **THEN** both documents have identical `questions[].options` and `questions[].correct` for choice items
- **AND** `meta.optionShuffle` equals `{ "enabled": true, "seed": 42 }`

#### Scenario: Seed without shuffle remains valid

- **WHEN** an agent passes `--seed 1` without `--shuffle-options` (e.g. with `--adaptive`)
- **THEN** the command does not fail solely because seed was provided
