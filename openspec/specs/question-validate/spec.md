# question-validate

## Purpose

Dry-run validation of question drafts for agent rewrite loops (no library writes).

## Requirements

### Requirement: Dry-run question validate command

The system SHALL provide a non-interactive domain operation `sdm question validate` that evaluates a question draft against the shared validation pipeline without writing any methodology YAML. The command MUST support `--json` for agents and CI.

#### Scenario: Validate does not write files

- **WHEN** an agent runs `sdm question validate` with a valid draft payload and `--json`
- **THEN** the result includes `ok: true` or `ok: false` with structured results
- **AND** no new or modified files exist under `library/questions/`

#### Scenario: Missing skill fails without write

- **WHEN** validate is invoked with `--to-skill` for a skill not in the ontology
- **THEN** the system fails with a stable SdmError code (e.g. `SKILL_NOT_FOUND`)
- **AND** no question file is written

### Requirement: Shared validate result shape for agents

The validate JSON payload SHALL include `errors` (blocking issues) and `findings` (advisory issues), each entry with a stable `code` and `message`. Structural schema/type failures MUST appear in `errors`. When `quality.writeGate` is `soft`, policy issues MAY appear as `findings` with `ok: true` or as non-blocking warnings; when `writeGate` is `strict`, policy failures MUST appear in `errors` and `ok` MUST be false.

#### Scenario: Strict writeGate surfaces policy errors

- **WHEN** `quality.writeGate` is `strict` and the draft has a topic not listed on the skill
- **THEN** validate JSON has `ok: false` and an error code indicating invalid topic membership

#### Scenario: Soft writeGate advisory findings

- **WHEN** `quality.writeGate` is `soft` and a non-structural policy heuristic fails
- **THEN** validate JSON includes the issue in `findings` (or warnings) without requiring a file write

### Requirement: Near-duplicate detection on validate

The system SHALL compare the draft text to existing questions for the same skill using a deterministic lexical/near-dup metric with a configurable threshold. When similarity exceeds the threshold under strict writeGate (or equivalent near-dup policy), validate MUST fail with stable code `QUESTION_NEAR_DUPLICATE` (or include it in `errors`).

#### Scenario: Near duplicate rejected in strict mode

- **WHEN** a draft text is above the near-dup threshold versus an existing same-skill question and writeGate is `strict`
- **THEN** validate returns `ok: false` with `QUESTION_NEAR_DUPLICATE` (or equivalent stable code) in `errors`

### Requirement: MCP tool question_validate

The MCP server SHALL expose tool `question_validate` that calls the same core validate pipeline as the CLI and returns JSON suitable for agent rewrite loops.

#### Scenario: MCP validate parity

- **WHEN** a host calls MCP `question_validate` with a draft equivalent to a CLI validate invocation
- **THEN** the tool result JSON exposes the same `ok` / `errors` / `findings` contract semantics
