## MODIFIED Requirements

### Requirement: Content depth and format controls

The system SHALL accept content controls for educational generation guidance: `depth` of `brief`, `standard`, or `detailed`, and `format` of `howto`, `notes`, `cheatsheet`, or `course` (or the same enums documented in CLI help). Agent-facing docs and skills SHOULD label formats in Russian as Инструкция / Конспект / Шпаргалка / Курс respectively. The deprecated value `concept` MUST be accepted and normalized to `notes`, and the export/plan JSON MUST include a warning with code `FORMAT_CONCEPT_DEPRECATED`. Controls SHALL be echoed in the course/plan JSON so an external agent can vary prose volume and style for the same skill/topic/question keys without Specra calling an LLM.

#### Scenario: Brief howto vs detailed howto share keys

- **WHEN** the same skill and topic scope is exported twice with `depth=brief` and `depth=detailed` under `format=howto`
- **THEN** both outputs reference the same skill/topic keys and practice ids, and each output echoes its respective depth control

#### Scenario: Invalid depth is rejected

- **WHEN** course export/plan is invoked with an unsupported depth value
- **THEN** the command fails with a stable SdmError code and does not write a partial course document

#### Scenario: Concept maps to notes with deprecation warning

- **WHEN** export is invoked with `format=concept`
- **THEN** the document echoes `controls.format` as `notes`
- **AND** warnings include code `FORMAT_CONCEPT_DEPRECATED`

#### Scenario: Course format is accepted

- **WHEN** export is invoked with `format=course`
- **THEN** the document echoes `controls.format` as `course`

### Requirement: Agent-first CLI and boundary

The system SHALL expose learning-material plan/export as domain CLI command `export learning` (and MCP tool `export_learning`) with machine-readable `--json` output and stable `SdmError` codes. The system SHALL also accept alias CLI `export course` and MCP `export_course` with the same behavior. Specra MUST NOT execute courses, track learner progress, or call an LLM to author lesson prose.

#### Scenario: JSON output for agents

- **WHEN** learning export or plan is invoked with `--json` via `export learning` or the `export course` alias
- **THEN** the process emits a JSON payload suitable for agent chaining without requiring TTY prompts

#### Scenario: No LMS side effects

- **WHEN** learning export completes
- **THEN** no learner session, progress store, or external LMS API call is performed by Specra

### Requirement: Portable agent workflow documented

The repository SHALL document a portable agent skill that: clarifies depth/format/scope using the four formats (`howto`, `notes`, `cheatsheet`, `course`) and Russian labels; proposes format and depth before plan-only; shows TeachingContext and quality warnings; waits for human confirmation before side-effecting generated prose exports; enforces a single prose locale (no mixed-language jargon outside code fences and identifiers); optionally guides ontology enrichment via existing skill commands when warnings indicate thin context; fills lesson bodies outside Specra; and calls `export learning` (alias `export course`) — without treating Specra as an LMS.

#### Scenario: Skill points to export not LMS

- **WHEN** an agent follows the export-course skill
- **THEN** the skill instructs use of Specra plan/export commands for structure, TeachingContext, and library anchors, and external generation for lesson prose

#### Scenario: Detailed depth with thin context prompts enrichment

- **WHEN** the skill runs with `depth=detailed` and TeachingContext warnings indicate thin skill description or empty topics
- **THEN** the skill instructs proposing enrichment (description/topics/links) and waiting for confirm before generating detailed prose

#### Scenario: Skill documents four formats

- **WHEN** an agent reads the export-course skill format table
- **THEN** the skill lists `howto`, `notes`, `cheatsheet`, and `course` with expected output shape and Russian labels

## ADDED Requirements

### Requirement: Layout and lesson stub shaping by format

The system SHALL set `meta.layout` to `modular_course` when `format` is `course`, and to `single_doc` when `format` is `howto`, `notes`, or `cheatsheet`. For `modular_course`, lesson stubs SHALL be derived from skill topics (and question-derived topics) as before. For `single_doc`, each module SHALL contain exactly one lesson stub suitable for a single document (title from skill name or scoped topic).

#### Scenario: Single-doc howto collapses stubs

- **WHEN** export runs with `format=howto` for a skill that has multiple topics
- **THEN** `meta.layout` is `single_doc`
- **AND** that skill's module has exactly one lesson stub

#### Scenario: Course format keeps topic lessons

- **WHEN** export runs with `format=course` for a skill that has multiple topics
- **THEN** `meta.layout` is `modular_course`
- **AND** that skill's module has one lesson stub per topic (or overview when topics are empty)

### Requirement: Soft prose locale-mix warning

When a lesson stub has a non-empty `body`, the system SHALL strip fenced code blocks and, if the remaining prose contains both Cyrillic letters and Latin letters in word-like tokens, emit a soft warning with code `PROSE_LOCALE_MIXED`. The warning MUST NOT fail the export by itself.

#### Scenario: Mixed prose warns

- **WHEN** a module lesson body contains Russian sentence text and an English jargon word outside code fences
- **THEN** warnings include code `PROSE_LOCALE_MIXED`

#### Scenario: Empty bodies do not warn for locale

- **WHEN** all lesson bodies are empty (plan-only)
- **THEN** warnings do not include `PROSE_LOCALE_MIXED` solely due to empty bodies
