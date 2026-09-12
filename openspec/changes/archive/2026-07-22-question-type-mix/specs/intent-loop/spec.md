## ADDED Requirements

### Requirement: Intent-loop may capture type-mix preference

The `intent-loop` portable skill SHALL allow the agent to record a question type-mix preference for profile-pack (and similar) plans: `single` (default), `mixed`, or `full`. When the human does not mention type diversity or mix, the plan MUST default to `single` (current behavior). When the human asks for a mix of question types (e.g. «микс типов», «не только single choice»), the agent SHALL set the plan’s seed `typeMix` accordingly before confirmation and MUST NOT invent deferred types (`matching`, `sorting`, `dropdown_answer`) as seed targets.

#### Scenario: Default plan stays single

- **WHEN** the human requests a profile foundation without mentioning question types
- **THEN** the confirmable plan uses type-mix `single` (or omits mix equivalent to single)

#### Scenario: Human asks for mix

- **WHEN** the human asks to seed with a mix of single, multi, and short text questions
- **THEN** the plan’s seed includes `typeMix: mixed` (or equivalent) before confirmation

### Requirement: Intent plan schema accepts typeMix

If the repository ships `sdm intent validate-plan`, the profile-pack plan schema SHALL accept optional `seed.typeMix` with values `single` | `mixed` | `full`, defaulting to `single` when omitted. Validation MUST remain write-free.

#### Scenario: Plan with typeMix mixed validates

- **WHEN** an agent validates plan JSON with `seed.typeMix` equal to `mixed`
- **THEN** `intent validate-plan --json` succeeds with `ok: true`

#### Scenario: Invalid typeMix rejected

- **WHEN** plan JSON has `seed.typeMix` equal to an unknown value
- **THEN** validation fails with a stable error and does not write methodology files
