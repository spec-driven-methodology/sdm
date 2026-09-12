## ADDED Requirements

### Requirement: Course export document schema

The system SHALL export a learning pack document with `schemaVersion` equal to `sdm.export.course/v1` that includes profile, level (when scoped to a certification), content controls when provided, an ordered list of modules, teaching context or equivalent metadata sufficient for agent generation, quality warnings, and metadata. Each module SHALL reference a skill id and MAY include lesson stubs (including optional `body` markdown) and practice question identifiers from the methodology library.

#### Scenario: Schema version is stable for consumers

- **WHEN** a course export succeeds for a profile and level
- **THEN** the document includes `schemaVersion: "sdm.export.course/v1"` and a `modules` array (non-empty when skills apply, or empty with warnings when none apply)

#### Scenario: Plan-only export may omit lesson bodies

- **WHEN** course export is requested in plan/brief mode
- **THEN** modules and lesson stubs are present with teaching context and warnings, and missing lesson bodies do not invalidate the document schema

### Requirement: TeachingContext from methodology keys

The system SHALL build a deterministic TeachingContext (as a document section or plan-only payload) from the requested scope using the same methodology keys as assessment: profile/level requirements when applicable, skill ids, skill topics/tags, `depends_on` / `related_to` edges in scope, and question anchors from the library (id, skill, topics, text, and explanation when present). TeachingContext MUST NOT invent skills or questions absent from the project.

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

The system SHALL accept content controls for educational generation guidance: `depth` of `brief`, `standard`, or `detailed`, and `format` of `howto`, `concept`, or `cheatsheet` (or the same enums documented in CLI help). Controls SHALL be echoed in the course/plan JSON so an external agent can vary prose volume and style for the same skill/topic/question keys without Specra calling an LLM.

#### Scenario: Brief howto vs detailed howto share keys

- **WHEN** the same skill and topic scope is exported twice with `depth=brief` and `depth=detailed` under `format=howto`
- **THEN** both outputs reference the same skill/topic keys and practice ids, and each output echoes its respective depth control

#### Scenario: Invalid depth is rejected

- **WHEN** course export/plan is invoked with an unsupported depth value
- **THEN** the command fails with a stable SdmError code and does not write a partial course document

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

The system SHALL expose course plan/export as domain CLI (and MCP equivalent when MCP is updated) with machine-readable `--json` output and stable `SdmError` codes. Specra MUST NOT execute courses, track learner progress, or call an LLM to author lesson prose.

#### Scenario: JSON output for agents

- **WHEN** course export or plan is invoked with `--json`
- **THEN** the process emits a JSON payload suitable for agent chaining without requiring TTY prompts

#### Scenario: No LMS side effects

- **WHEN** course export completes
- **THEN** no learner session, progress store, or external LMS API call is performed by Specra

### Requirement: Practice questions align with assessment library

Practice items in the course document SHALL reference the same question library used by `export test` (by question id and skill). The export MUST NOT invent question content that is not present in the library.

#### Scenario: Practice ids are real

- **WHEN** a module lists practice question ids
- **THEN** each id resolves to an existing question bound to that module's skill

### Requirement: Portable agent workflow documented

The repository SHALL document (when implemented) a portable agent skill that: clarifies depth/format/scope; shows TeachingContext and quality warnings; waits for human confirmation before side-effecting generated prose exports; optionally guides ontology enrichment via existing skill commands when warnings indicate thin context; fills lesson bodies outside Specra; and calls course export — without treating Specra as an LMS.

#### Scenario: Skill points to export not LMS

- **WHEN** an agent follows the export-course skill
- **THEN** the skill instructs use of Specra plan/export commands for structure, TeachingContext, and library anchors, and external generation for lesson prose

#### Scenario: Detailed depth with thin context prompts enrichment

- **WHEN** the skill runs with `depth=detailed` and TeachingContext warnings indicate thin skill description or empty topics
- **THEN** the skill instructs proposing enrichment (description/topics/links) and waiting for confirm before generating detailed prose
