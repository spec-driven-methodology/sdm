# export-course

## Purpose

Export a learning pack from methodology keys (profile/level/skill/topic/questions): TeachingContext, content controls, modules with lesson stubs, and practice question ids. Specra does not run an LMS or call an LLM for lesson prose.

## Requirements

### Requirement: Course export document schema

The system SHALL export a learning pack document with `schemaVersion` equal to `sdm.export.course/v1` that includes a deterministic package `id`, profile, level (when scoped to a certification), content controls when provided, an ordered list of modules, teaching context or equivalent metadata sufficient for agent generation, quality warnings, and metadata including `meta.revision`. Each module SHALL reference a skill id and MAY include lesson stubs (including optional `body` markdown) and practice question identifiers from the methodology library. Lesson stub `title` values SHALL be learner-facing and SHALL NOT be raw skill-topic slugs when a human-readable label is available: the system SHALL resolve topic display names from `topicLabels` declared on the skill (label for the topic key), falling back to the raw topic key only when no label exists.

#### Scenario: Schema version is stable for consumers

- **WHEN** a course export succeeds for a profile and level
- **THEN** the document includes `schemaVersion: "sdm.export.course/v1"` and a `modules` array (non-empty when skills apply, or empty with warnings when none apply)
- **AND** `id` is present as a non-empty slug
- **AND** `meta.revision` is a non-empty 16-character hex string from basis hashes without `capturedAt`

#### Scenario: Level course canonical id form

- **WHEN** course export runs for profile `qa-manual`, level `junior`, `format=course`, `depth=brief`, `locale=ru`
- **THEN** `id` equals `course-qa-manual-junior-course-brief-ru` (slug segments derived from those controls)

#### Scenario: Empty course is rejected

- **WHEN** course export is requested and every lesson body is empty (stubs without prose)
- **THEN** the command fails with `COURSE_ALL_EMPTY` and writes no consumer document — Specra does not produce empty educational materials

### Requirement: Consumer upsert contract for learning packages

Export course/learning JSON intended for external systems SHALL treat `id` as the stable upsert slot key and `meta.revision` as the content fingerprint. External consumers SHOULD upsert by `id` and replace content when `meta.revision` changes. Scope mode (`meta.scope`) and content controls (`controls`) MUST affect `id` when they define a distinct delivery slot.

#### Scenario: Skill-scoped course has distinct id

- **WHEN** course export runs with `--skill` for one skill versus full profile+level course for the same skill's profile
- **THEN** the two documents have different `id` values

### Requirement: TeachingContext from methodology keys

The system SHALL build a deterministic TeachingContext from the requested scope using the same methodology keys as assessment: profile/level requirements when applicable, skill ids, skill topics/tags, `depends_on` / `related_to` edges in scope, and question anchors from the library (id, skill, topics, text, and explanation when present). TeachingContext MUST NOT invent skills or questions absent from the project.

#### Scenario: Level-scoped context includes requirements and anchors

- **WHEN** TeachingContext is built for an existing profile and level with at least one requirement and library questions for a required skill
- **THEN** the context includes that skill, its topics when defined, requirement depth/weight, and at least one question anchor bound to that skill

#### Scenario: Question-scoped context

- **WHEN** scope is provided as one or more existing question ids
- **THEN** TeachingContext includes those questions as anchors and the skills/topics needed to teach them

### Requirement: Learning-readiness quality warnings

The system SHALL emit machine-readable quality warnings when TeachingContext is thin or weak for teaching, including at least: thin/empty skill description, empty skill topics, topics without covering questions in scope, isolated skill in scope (no depends_on/related_to edges among scoped skills when peers exist), thin practice pool, and question anchors missing explanation. Warnings MUST NOT replace cert coverage gaps logic; they MAY be returned alongside course export/plan JSON.

#### Scenario: Empty topics produce a warning

- **WHEN** a scoped skill has an empty topics list
- **THEN** the plan or export JSON includes a warning code indicating empty topics for that skill

#### Scenario: Missing explanation on practice anchor

- **WHEN** a practice candidate question has no explanation
- **THEN** the plan or export JSON includes a warning code indicating missing explanation for that question id

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

### Requirement: Build modules from certification skills

When exporting for a profile and level, the system SHALL create modules from the level requirements' skills, ordered using `depends_on` topology when possible, and SHALL attach available library question ids for that skill as practice candidates (or document that practice is empty). Lesson stubs SHOULD be derived from skill topics and MAY be refined from question-anchor topics.

#### Scenario: Full level course skeleton

- **WHEN** the user runs course export for an existing profile and level with at least one requirement
- **THEN** each required skill appears as a module and practice references only question ids that exist for that skill in the library

### Requirement: Gaps-scoped, skill-scoped, topic-scoped, and question-scoped export

The system SHALL support scoping modules to methodology gaps (`missing`/`thin` skills for the profile/level), to a single skill id, to a topic/tag within skills that declare it, and to one or more question ids (`--from-questions`). Single-skill and question scopes MUST NOT require a full profile curriculum.

#### Scenario: From-gaps reduces modules

- **WHEN** course export is requested with gaps scope for a level that has both ok and thin skills
- **THEN** modules are limited to skills reported as missing or thin by the gaps logic

#### Scenario: Single skill pack

- **WHEN** course export is requested for one skill that exists in the ontology
- **THEN** the document contains exactly one module for that skill (plus valid schema metadata)

#### Scenario: From-questions pack

- **WHEN** course export is requested with existing question ids that share a skill
- **THEN** modules/lessons cover that skill (and topics of those questions) and practice includes at least those question ids

### Requirement: Agent-first CLI and boundary

The system SHALL expose learning-material plan/export as domain CLI command `export learning` (and MCP tool `export_learning`) with machine-readable `--json` output and stable `SdmError` codes. The system SHALL also accept alias CLI `export course` and MCP `export_course` with the same behavior. Specra MUST NOT execute courses, track learner progress, or call an LLM to author lesson prose.

#### Scenario: JSON output for agents

- **WHEN** learning export or plan is invoked with `--json` via `export learning` or the `export course` alias
- **THEN** the process emits a JSON payload suitable for agent chaining without requiring TTY prompts

#### Scenario: No LMS side effects

- **WHEN** learning export completes
- **THEN** no learner session, progress store, or external LMS API call is performed by Specra

### Requirement: Practice questions align with assessment library

Practice items in the course document SHALL reference the same question library used by `export test` (by question id and skill). The export MUST NOT invent question content that is not present in the library.

#### Scenario: Practice ids are real

- **WHEN** a module lists practice question ids
- **THEN** each id resolves to an existing question bound to that module's skill

### Requirement: Portable agent workflow documented

The repository SHALL document a portable agent skill that: clarifies depth/format/scope using the four formats (`howto`, `notes`, `cheatsheet`, `course`) and Russian labels; proposes format and depth; shows TeachingContext, overview stubs, glossary candidates, and quality warnings; waits for human confirmation before side-effecting generated prose exports; enforces a single prose locale with term definitions (no unexplained mixed-language jargon outside code fences and identifiers); fills overview and lesson bodies outside Specra using the course-vs-howto contracts; omits practice-anchor dumps from lesson bodies; optionally guides ontology enrichment via existing skill commands when warnings indicate thin context; and calls `export learning` (alias `export course`) — without treating Specra as an LMS. The workflow MUST NOT produce an export with empty lesson bodies: `export learning` fails with `COURSE_ALL_EMPTY` unless at least one lesson body is filled.

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

### Requirement: Course overview module for level-scoped packs

When `format` is `course` and export is scoped to a profile and level, the system SHALL include exactly one leading module with `kind` equal to `overview` before skill modules. That overview module SHALL provide lesson stubs suitable for agent-authored intro prose covering at least: what the course is, how it is structured, who it is for, and what is out of scope. Skill-only, topic-only, and from-questions scopes MUST NOT require a full overview module (they MAY omit `kind` or use only `skill` modules).

#### Scenario: Level course stub starts with overview

- **WHEN** `export learning` runs with `format=course` for an existing profile and level
- **THEN** `modules[0].kind` is `overview`
- **AND** the overview module has at least one lesson stub whose id or topic indicates course introduction content
- **AND** subsequent modules cover required skills as before

#### Scenario: Single-skill course has no mandatory overview

- **WHEN** `export learning` runs with `format=course` and `--skill` for one existing skill
- **THEN** the document is valid without an overview module
- **AND** it contains a skill module for that skill

### Requirement: Learner-facing topic labels in lesson stubs

The system SHALL accept an optional `topic_labels` map on the skill spec (topic slug → human-readable label) and SHALL use it to title lesson stubs derived from skill topics and question-derived topics. When `topic_labels` is absent for a topic, the stub title SHALL fall back to the raw topic key. The label map MUST NOT alter topic identity: module ids, topic filters, and question-topic matching continue to use the topic key.

#### Scenario: Labeled topic titles a lesson in the learner's language

- **WHEN** a skill declares `topic_labels: { "http-client": "HTTP-клиент для LLM" }` and a lesson stub is derived from topic `http-client`
- **THEN** the stub `title` equals `HTTP-клиент для LLM`
- **AND** the stub `id` and `topic` remain `http-client`

#### Scenario: Unlabeled topic keeps raw key as title

- **WHEN** a skill declares topics without `topic_labels` coverage for one of them
- **THEN** the lesson stub for that topic uses the raw topic key as its `title`

#### Scenario: Question-derived topic honors labels

- **WHEN** a lesson stub is derived from a question topic that is not in `skill.topics` but is in `topic_labels`
- **THEN** the stub `title` uses the label

### Requirement: Lesson footnotes are agent-filled term definitions

The course export schema SHALL allow optional per-lesson `footnotes` arrays of `{ term, definition }`. When filling prose, agents SHALL add a footnote on first use of an opaque or foreign term in that lesson. Player-facing footnotes are a per-lesson block that SHALL appear only when the lesson has explicit non-empty `footnotes` (or glossary-derived terms), and MUST NOT be a duplicate of the lesson title or a restatement of the lesson topic as the only entry.

#### Scenario: Footnotes attach to a lesson

- **WHEN** a consumer document includes `modules[].lessons[].footnotes` with term/definition pairs
- **THEN** the document remains valid `sdm.export.course/v1`
- **AND** footnote terms do not replace `practiceQuestionIds`

### Requirement: Glossary and lesson footnotes in course document

The course export schema SHALL allow an optional document-level `glossary` array of `{ term, definition, aliases? }` and optional per-lesson `footnotes` arrays of `{ term, definition }`. Specra MAY seed glossary term candidates from scoped skill topics and TeachingContext; definitions MAY be empty for the agent to fill. Specra MUST NOT invent practice question content inside glossary entries.

#### Scenario: Glossary terms survive partial definition

- **WHEN** course export runs for a level whose skills declare topics
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

### Requirement: Soft prose locale-mix warning

When a lesson stub has a non-empty `body`, the system SHALL strip fenced code blocks and, if the remaining prose contains both Cyrillic letters and Latin letters in word-like tokens, emit a soft warning with code `PROSE_LOCALE_MIXED`. The warning MUST NOT fail the export by itself.

#### Scenario: Mixed prose warns

- **WHEN** a module lesson body contains Russian sentence text and an English jargon word outside code fences
- **THEN** warnings include code `PROSE_LOCALE_MIXED`

#### Scenario: Empty bodies do not warn for locale

- **WHEN** all lesson bodies are empty
- **THEN** warnings do not include `PROSE_LOCALE_MIXED` solely due to empty bodies

### Requirement: Static player may preview course packs

The system MAY ship a static author-preview player that reads `sdm.export.course/v1` documents for lesson browsing. That preview MUST NOT constitute an LMS: Specra still MUST NOT track learner progress, run enrolled courses as a product surface, or call an LLM to author lesson prose as part of course export. Practice in the player, when offered, SHALL resolve question ids against assessment library payloads (e.g. a loaded `export test` pack), not invent question content inside the course document.

#### Scenario: Preview does not imply LMS runtime

- **WHEN** an author opens a course export in the static player
- **THEN** the player may show modules and lessons for review
- **AND** no learner progress store or external LMS API call is required or performed by Specra core export

#### Scenario: Practice ids remain library references

- **WHEN** a course module lists practice question ids
- **THEN** those ids remain references to the assessment question library
- **AND** the course document is not required to embed full question payloads for player preview

### Requirement: Stamp content basis on course/learning export meta

When assembling a course/learning export document, `meta` SHALL include a `basis` object with current hashes for scoped skills (module skill ids), optional `basis.level` when profile/level scope applies, and ISO `capturedAt`. Wire `schemaVersion` MUST remain the course export format id, distinct from content basis.

#### Scenario: Level-scoped course export includes basis

- **WHEN** an agent exports a course/learning pack for a profile and level successfully
- **THEN** `document.meta.basis` includes `capturedAt`, skill hashes for module skills, and a level hash when level scope is present

#### Scenario: Skill-scoped course export includes skill basis

- **WHEN** an agent exports a learning pack scoped to a single skill
- **THEN** `document.meta.basis.skills` includes that skill id with the current hash
