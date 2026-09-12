## ADDED Requirements

### Requirement: Course overview module for level-scoped packs

When `format` is `course` and export is scoped to a profile and level, the system SHALL include exactly one leading module with `kind` equal to `overview` before skill modules. That overview module SHALL provide lesson stubs suitable for agent-authored intro prose covering at least: what the course is, how it is structured, who it is for, and what is out of scope. Overview lesson bodies MAY be empty in plan-only mode. Skill-only, topic-only, and from-questions scopes MUST NOT require a full overview module (they MAY omit `kind` or use only `skill` modules).

#### Scenario: Level course stub starts with overview

- **WHEN** `export learning` runs with `format=course` for an existing profile and level
- **THEN** `modules[0].kind` is `overview`
- **AND** the overview module has at least one lesson stub whose id or topic indicates course introduction content
- **AND** subsequent modules cover required skills as before

#### Scenario: Single-skill course has no mandatory overview

- **WHEN** `export learning` runs with `format=course` and `--skill` for one existing skill
- **THEN** the document is valid without an overview module
- **AND** it contains a skill module for that skill

### Requirement: Glossary and lesson footnotes in course document

The course export schema SHALL allow an optional document-level `glossary` array of `{ term, definition, aliases? }` and optional per-lesson `footnotes` arrays of `{ term, definition }`. Specra MAY seed glossary term candidates from scoped skill topics and TeachingContext; definitions MAY be empty in plan-only mode for the agent to fill. Specra MUST NOT invent practice question content inside glossary entries.

#### Scenario: Plan-only may seed glossary terms

- **WHEN** course export runs in plan-only mode for a level whose skills declare topics
- **THEN** the document MAY include `glossary` entries whose `term` values derive from those topics
- **AND** missing definitions do not invalidate the schema

#### Scenario: Footnotes attach to a lesson

- **WHEN** a consumer document includes `modules[].lessons[].footnotes` with term/definition pairs
- **THEN** the document remains valid `sdm.export.course/v1`
- **AND** footnote terms do not replace `practiceQuestionIds`

### Requirement: Course format prose contract distinct from howto

Portable agent documentation for `format=course` SHALL require: (1) filled overview lessons before or with skill lessons when overview stubs exist; (2) each skill/topic lesson begins with a plain-language definition of the topic for a beginner; (3) lesson headings reflect the lesson content and MUST NOT reuse a fixed howto quartet («Проблема / Модель / Пример / Ловушки» or English equivalents) as the default skeleton for every lesson; (4) lesson bodies MUST NOT include a «Якоря практики» (or equivalent) section that merely lists `practiceQuestionIds` already present on the module. The `howto` format MAY keep a short step/example structure. Specra core still MUST NOT call an LLM to author prose.

#### Scenario: Skill documents course vs howto skeleton

- **WHEN** an agent reads the export-course skill format contracts
- **THEN** `course` instructs definition-first lessons with content-specific headings and no practice-anchor dump in body
- **AND** `howto` remains allowed to use a concise step-oriented structure

#### Scenario: Overview prose is in the course checklist

- **WHEN** an agent generates prose for a level-scoped `format=course` pack that includes an overview module
- **THEN** the skill instructs filling overview lessons (what / structure / audience / out of scope) before treating the pack as complete

### Requirement: Locale and term explanation for learning and question prose

Portable agent skills that author Russian (or other locale) learning prose or assessment questions SHALL require: keep learner-facing sentences in the target locale; on first use of a necessary foreign or opaque term, give a short locale definition inline and/or via glossary/footnotes; do not leave unexplained loanwords as the only explanation of a concept. Identifiers (skill ids, question ids, CLI flags, API names) and fenced code remain allowed without translation. Soft warning `PROSE_LOCALE_MIXED` remains non-fatal; agents SHALL fix mixed jargon before delivery when locale is set.

#### Scenario: Export-course skill bans unexplained jargon

- **WHEN** locale is `ru` (or human language is Russian) and the agent authors a lesson body
- **THEN** the skill requires a Russian definition for domain terms such as product jargon on first use
- **AND** forbids relying on bare English phrases as the sole teaching of the concept

#### Scenario: Generate-questions skill aligns locale guidance

- **WHEN** an agent follows question-generation guidance for a Russian methodology
- **THEN** the skill instructs prefer Russian stems in `text`/`options` and explain unavoidable English terms in `explanation`

## MODIFIED Requirements

### Requirement: Layout and lesson stub shaping by format

The system SHALL set `meta.layout` to `modular_course` when `format` is `course`, and to `single_doc` when `format` is `howto`, `notes`, or `cheatsheet`. For `modular_course`, lesson stubs SHALL be derived from skill topics (and question-derived topics) as before, and when profile+level scope applies SHALL be preceded by the overview module required elsewhere in this spec. For `single_doc`, each module SHALL contain exactly one lesson stub suitable for a single document (title from skill name or scoped topic). Module `kind` defaults to `skill` when omitted.

#### Scenario: Single-doc howto collapses stubs

- **WHEN** export runs with `format=howto` for a skill that has multiple topics
- **THEN** `meta.layout` is `single_doc`
- **AND** that skill's module has exactly one lesson stub

#### Scenario: Course format keeps topic lessons after overview

- **WHEN** export runs with `format=course` for a profile and level with a skill that has multiple topics
- **THEN** `meta.layout` is `modular_course`
- **AND** modules include a leading overview module
- **AND** a skill module for that skill has one lesson stub per topic (or overview when topics are empty)

### Requirement: Portable agent workflow documented

The repository SHALL document a portable agent skill that: clarifies depth/format/scope using the four formats (`howto`, `notes`, `cheatsheet`, `course`) and Russian labels; proposes format and depth before plan-only; shows TeachingContext, overview stubs, glossary candidates, and quality warnings; waits for human confirmation before side-effecting generated prose exports; enforces a single prose locale with term definitions (no unexplained mixed-language jargon outside code fences and identifiers); fills overview and lesson bodies outside Specra using the course-vs-howto contracts; omits practice-anchor dumps from lesson bodies; optionally guides ontology enrichment via existing skill commands when warnings indicate thin context; and calls `export learning` (alias `export course`) — without treating Specra as an LMS.

#### Scenario: Skill points to export not LMS

- **WHEN** an agent follows the export-course skill
- **THEN** the skill instructs use of Specra plan/export commands for structure, TeachingContext, and library anchors, and external generation for lesson prose

#### Scenario: Detailed depth with thin context prompts enrichment

- **WHEN** the skill runs with `depth=detailed` and TeachingContext warnings indicate thin skill description or empty topics
- **THEN** the skill instructs proposing enrichment (description/topics/links) and waiting for confirm before generating detailed prose

#### Scenario: Skill documents four formats

- **WHEN** an agent reads the export-course skill format table
- **THEN** the skill lists `howto`, `notes`, `cheatsheet`, and `course` with expected output shape and Russian labels

#### Scenario: Skill forbids practice-anchor section in course bodies

- **WHEN** an agent fills `format=course` lesson bodies
- **THEN** the skill instructs not to add a section that only repeats module `practiceQuestionIds`
