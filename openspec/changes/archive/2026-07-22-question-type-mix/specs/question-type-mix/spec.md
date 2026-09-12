## ADDED Requirements

### Requirement: Type-mix presets for question drafting

The system SHALL define type-mix presets `single`, `mixed`, and `full` that resolve to an ordered list of active question types for draft assignment. Preset `single` SHALL resolve to `single_choice` only. Preset `mixed` SHALL resolve to the ordered active set `single_choice`, `multi_choice`, `open`. Preset `full` SHALL resolve to the same active set as `mixed` until additional types are added to the active set. Deferred types (`matching`, `sorting`, `dropdown_answer`, and auto-validated `code`) MUST NOT be assigned by any preset until they are explicitly added to the active set.

#### Scenario: Single preset is homogeneous

- **WHEN** the mix preset is `single` and draft count is 3
- **THEN** all three assigned types are `single_choice`

#### Scenario: Mixed preset rotates active types

- **WHEN** the mix preset is `mixed` and draft count is 3
- **THEN** the assigned types are `single_choice`, `multi_choice`, and `open` in that order

#### Scenario: Full preset matches mixed until expansion

- **WHEN** the mix preset is `full` and no deferred types are in the active set
- **THEN** assignment equals the `mixed` preset for the same count

#### Scenario: Unknown preset fails

- **WHEN** an agent requests an unknown mix preset name
- **THEN** the system fails with a stable SdmError code (e.g. `TYPE_MIX_INVALID`) and does not write files

### Requirement: Deterministic per-draft type assignment

Given a preset and a positive draft count `N`, the system SHALL assign type for draft index `i` (0-based) as `activeTypes[i mod len(activeTypes)]`. Assignment MUST be deterministic (no randomness).

#### Scenario: Count exceeds type list wraps

- **WHEN** mix is `mixed` and count is 4
- **THEN** assigned types are `single_choice`, `multi_choice`, `open`, `single_choice`

### Requirement: Explicit type and mix are mutually exclusive

When both a homogeneous `--type` (or equivalent) and a `--mix` preset are provided to a drafting command, the system SHALL fail with a stable SdmError (e.g. `TYPE_MIX_CONFLICT`) without writing files.

#### Scenario: Conflict rejected

- **WHEN** `question generate` is invoked with both `--type multi_choice` and `--mix mixed`
- **THEN** the command fails with `TYPE_MIX_CONFLICT` (or equivalent) and creates no library files

### Requirement: Deferred types documented as inactive

Product docs and/or agent skills updated by this change SHALL state that `matching`, `sorting`, `dropdown_answer`, and code auto-validation are out of the active mix set. `dropdown_answer` SHALL be described as a consumer UI presentation of a single-answer question, not a Specra domain type in this change.

#### Scenario: Skills do not instruct inventing deferred types

- **WHEN** an agent follows updated `generate-questions` / `close-coverage` skills for `--mix mixed`
- **THEN** the skill instructs using only `single_choice`, `multi_choice`, and `open` for persistence
