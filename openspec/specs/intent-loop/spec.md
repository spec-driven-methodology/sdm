# intent-loop

## Purpose

Primary agent UX for non-developer humans: OpenSpec-shaped clarify → plan → confirm → execute → result. Domain entity is **Profile**.

## Requirements

### Requirement: Intent-loop portable skill exists

The repository SHALL ship a portable skill at `agents/intent-loop/SKILL.md` that instructs any AI agent to run an OpenSpec-shaped methodology workflow: intake natural-language intent → clarify missing slots → present a structured plan → wait for explicit human confirmation → execute via SDM CLI or MCP → present a structured result. `AGENTS.md` SHALL list `intent-loop` as the primary entry for greenfield and ambiguous methodology intents from non-developer humans. Human-facing language SHALL use **Profile** (not Role) for the assessment-track entity.

#### Scenario: Agent discovers intent-loop

- **WHEN** an agent reads `AGENTS.md`
- **THEN** `intent-loop` is listed as the primary skill for human intents such as «основа профиля Java Middle backend»

#### Scenario: Skill is host-agnostic

- **WHEN** the agent runs under GigaCode, Cursor, Claude Code, or another host
- **THEN** the skill allows MCP tools when available and equivalent `sdm … --json` CLI otherwise

### Requirement: Clarify before plan when slots missing

Before presenting a final plan, the skill SHALL require the agent to ask clarifying questions when the human intent does not specify required slots for the chosen plan kind (at minimum for profile-pack: profile identity/title, level, and direction/category or equivalent skill-set hint). The agent MUST NOT run SDM write commands during clarify.

#### Scenario: Incomplete intent triggers questions

- **WHEN** the human says only «хочу основу для Java» without level
- **THEN** the agent asks for level (and other missing slots) before presenting the confirmable plan

#### Scenario: Complete intent may skip questions

- **WHEN** the human provides profile, level, and direction in one message
- **THEN** the agent MAY proceed to a plan with zero or minimal clarifying questions

### Requirement: Structured plan and confirmation gate

The skill SHALL require a structured plan document before writes. For greenfield profile foundation the plan kind SHALL be `profile-pack` (compatible with bootstrap profile-pack schema). The agent MUST obtain explicit human confirmation before any SDM write operation (`profile create`, `skill add`, `skill link`, `cert create`, `question add`, `cert patch`, and equivalents).

#### Scenario: No writes before confirm

- **WHEN** the human has not confirmed the plan
- **THEN** the agent MUST NOT execute SDM write commands for that intent

#### Scenario: Plan edits re-confirm

- **WHEN** the human changes skills or requirements in the plan
- **THEN** the agent updates the plan and requests confirmation again

### Requirement: Execute via existing domain ops

After confirmation the skill SHALL instruct the agent to execute using existing SDM domain operations (and MCP equivalents), delegating greenfield profile foundation to the bootstrap profile-pack workflow. The agent MUST NOT hand-edit methodology YAML when a command exists.

#### Scenario: Greenfield delegates to profile-pack execution

- **WHEN** the confirmed plan kind is `profile-pack`
- **THEN** the agent follows the execute order of the bootstrap profile pack (profile → skills → cert → seed questions → verify → optional export)

### Requirement: Structured result handoff

After execute (or on abort), the skill SHALL require the agent to present a result summary to the human including at least: what was created or changed, coverage/gaps snapshot when a profile/level exists, and suggested next natural-language intents (not raw CLI flag recipes as the primary next step).

#### Scenario: Human sees outcome without CLI

- **WHEN** execution finishes for a profile-pack intent
- **THEN** the human-facing summary emphasizes created entities and coverage status, not a list of CLI flags to type next

### Requirement: Result handoff may use suggest for next steps

After a successful execute phase that creates or updates questions (or when the human’s only follow-up is «что дальше?» / what next without a new concrete intent), the `intent-loop` skill SHALL instruct the agent to call `suggest` / `sdm suggest --json` (when available) and present 1–3 suggested actions with levers to the human. The agent MUST NOT use a raw MCP tool catalog as the primary next-step answer. Selecting a suggestion SHOULD continue via confirm + domain ops or the appropriate portable skill.

#### Scenario: After seed questions offer suggest menu

- **WHEN** profile-pack (or similar) execute finishes seeding questions successfully
- **THEN** the human-facing result includes next actions derived from suggest (e.g. export test, player) rather than only a list of MCP tool names

#### Scenario: Ambiguous what-next uses suggest

- **WHEN** the human asks «что дальше?» without naming export, gaps, or another concrete op
- **THEN** the agent calls suggest before proposing next work

### Requirement: Optional plan validation helper

If the repository ships `sdm intent validate-plan`, it SHALL accept plan JSON, validate it with Zod against the published plan schema(s), and emit `--json` with `ok` / error codes suitable for agents. The helper MUST NOT perform methodology writes.

#### Scenario: Invalid plan rejected

- **WHEN** an agent passes plan JSON missing required profile id to `intent validate-plan --json`
- **THEN** the command fails with a stable SdmError (or equivalent) and does not write YAML

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

### Requirement: Export intents map type preferences to export_test filter

When the human’s intent is to export a test package and they specify question-type preferences in natural language (e.g. «без текстовых», «без open», «только с выбором ответа», «без свободного ввода»), the `intent-loop` (and/or delegated `export-methodology`) skill SHALL map those preferences to MCP `export_test` / CLI `export test` type-filter arguments — not to `jq`, hand-edited JSON, or instructing the human to pass flags. Short-text / free-form answers map to domain type `open`. The agent MUST confirm the plan (profile, level, filter) before running the export write/pipe when the workflow requires confirmation; for a pure export handoff after an existing profile/level, the skill MAY proceed after a short confirmation of the filter.

#### Scenario: Human asks for export without text questions

- **WHEN** the human says approximately «сделай экспорт теста Middle без текстовых вопросов»
- **THEN** the agent calls `export_test` (or CLI equivalent) with `excludeTypes: ["open"]` / `--exclude-type open`
- **AND** does not instruct the human to run a `jq` filter pipeline

#### Scenario: Human asks only for multiple choice style

- **WHEN** the human asks for an export with only single- and multi-select questions
- **THEN** the agent uses include filter `single_choice` and `multi_choice` (or exclude `open` and `code` as appropriate to the stated intent)


### Requirement: Export intents map skill and question subsets to export_test filters

When the human’s intent is to export a test package and they specify a skill subset or specific question ids in natural language (e.g. «только skill ai-quality», «без skill-authoring и mcp», «только QA-skills без общих», «только эти четыре вопроса», listing question ids), the `intent-loop` (and/or delegated `export-methodology`) skill SHALL map those preferences to MCP `export_test` / CLI `export test` skill-filter and/or `--include-question` / `includeQuestions` arguments — not to `jq`, Node post-filters, hand-edited export JSON, or instructing the human to pass raw flags. The agent MUST NOT invent a second export document by slicing a full package when SDM filters exist. The agent MUST confirm profile, level, and filter intent before running the export when the workflow requires confirmation; for a pure export handoff after an existing profile/level, the skill MAY proceed after a short confirmation of the filter set.

#### Scenario: Human asks for QA-only skills export

- **WHEN** the human says approximately «выгрузи тест ai-qa только по quality/security/ethics без общих skills»
- **THEN** the agent calls `export_test` (or CLI equivalent) with an include-skills filter for those skill ids
- **AND** does not post-process a full export JSON with a custom script to drop skills

#### Scenario: Human asks for specific question ids

- **WHEN** the human asks to export only named question ids (e.g. `q-ai-quality-005` … `008`)
- **THEN** the agent calls `export_test` with `includeQuestions` / `--include-question` for those ids
- **AND** does not hand-build a package by copying objects out of another export file

#### Scenario: Combined type and skill filters

- **WHEN** the human asks for a skill-subset export without open/text questions
- **THEN** the agent combines skill filter args with type filter args on the same `export_test` call
