## ADDED Requirements

### Requirement: Content basis fingerprint for skills and levels

`@spec-driven-methodology/core` SHALL compute a deterministic truncated content hash for a skill from semantic fields (`id`, `name`, `description`, `category`, sorted `topics`, sorted `depends_on`, sorted `related_to`) and for a level from (`level`, `profile`, `threshold`, sorted requirements). The hash MUST NOT be conflated with wire document `schemaVersion` strings.

#### Scenario: Stable skill hash

- **WHEN** the same skill semantic fields are hashed twice
- **THEN** both calls return the same hash string

#### Scenario: Topic change changes hash

- **WHEN** a skill’s `topics` list changes and the hash is recomputed
- **THEN** the new hash differs from the previous hash

### Requirement: Optional meta.basis on questions

Question YAML/Zod schema SHALL allow optional `meta.basis` with `skills` map (skill id → hash), optional `level` (`id` + `hash`), and `capturedAt` (ISO timestamp). Questions without `meta` MUST continue to load successfully.

#### Scenario: Question without meta loads

- **WHEN** a question file has no `meta` field
- **THEN** loaders parse it successfully as today

#### Scenario: Question with basis loads

- **WHEN** a question includes valid `meta.basis.skills` and `capturedAt`
- **THEN** the parsed question retains that basis for stale comparison

### Requirement: content stale domain operation

The system SHALL provide `sdm content stale` (and core `runContentStale`) that compares stamped `meta.basis` hashes against current skill/level hashes and returns a document with schema `sdm.content.stale/v1`, including `stale` and `workItems` arrays, with `--json` for agents.

#### Scenario: Mismatch yields stale question

- **WHEN** a question for skill S has `meta.basis.skills[S]` unequal to the current hash of S
- **AND** an agent runs `sdm content stale --skill S --json`
- **THEN** the payload has `ok: true`, schema `sdm.content.stale/v1`, and `stale` contains that question with reason `skill_basis_mismatch`

#### Scenario: Missing basis is reported

- **WHEN** a question for skill S has no `meta.basis`
- **AND** `content stale --skill S --json` runs
- **THEN** the question appears under `stale` or `unknown` with reason `missing_basis`

#### Scenario: Fresh basis yields empty mismatch list

- **WHEN** all questions for skill S have basis hashes matching current S
- **AND** no scoped exports mismatch
- **THEN** `stale` contains no `skill_basis_mismatch` entries for those questions

### Requirement: content stale workItems for agents

`content stale --json` SHALL include `workItems` derived from stale/unknown rows so an agent can drive review or regenerate without inventing targets. Each work item MUST include enough identity (`kind`, `id` or `path`) and `action` (`review` or `regenerate`).

#### Scenario: Stale question becomes work item

- **WHEN** stale includes a question with `skill_basis_mismatch`
- **THEN** `workItems` contains an entry referencing that question id with action `review`

#### Scenario: Stale export becomes regenerate work item

- **WHEN** stale includes an export document with basis mismatch
- **THEN** `workItems` contains an entry referencing that export path with action `regenerate`

### Requirement: content stale scope filters

`content stale` SHALL accept `--skill <id>` and/or `--profile` + `--level` to scope comparison. Missing skill MUST fail with `SKILL_NOT_FOUND`. Without filters, the command MAY scan the whole project or require a filter; if whole-project scan is supported it MUST remain deterministic.

#### Scenario: Unknown skill fails

- **WHEN** `--skill` references a missing ontology id
- **THEN** the command fails with `SKILL_NOT_FOUND`

### Requirement: Default non-transitive question stale

Unless an explicit transitive flag is implemented and documented, `content stale --skill S` MUST evaluate questions bound to S (and exports referencing S / focused level), and MUST NOT mark questions bound only to downstream dependents as mismatched solely because S changed.

#### Scenario: Downstream-only questions excluded by default

- **WHEN** skill B depends on A, questions exist only on B, and A’s hash changes
- **AND** `content stale --skill A` runs without a transitive flag
- **THEN** B’s questions are not listed as `skill_basis_mismatch` for A’s change
