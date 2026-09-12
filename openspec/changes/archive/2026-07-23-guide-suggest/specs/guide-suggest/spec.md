## ADDED Requirements

### Requirement: Suggest requires a methodology project

`sdm suggest` and the core suggest assembler SHALL require a SDM methodology project (`sdm.yaml`). Outside a project they MUST fail with a stable SdmError code (e.g. `NOT_A_PROJECT`) and MUST NOT invent suggestions.

#### Scenario: Outside project fails

- **WHEN** suggest is invoked from a directory that is not a methodology project
- **THEN** the result is `ok: false` (or non-zero exit) with a stable error code and no suggestions list claiming success

### Requirement: Suggest returns ranked next actions with levers

The suggest payload SHALL include `ok: true`, a `snapshot` of project state relevant to coaching, and `suggestions` as an array of length 1 to 5. Each suggestion SHALL include at least `id`, `label`, `why`, `requiresConfirm`, and `levers` (array, may be empty). Lever entries SHALL include a Russian `phrase` and a `mapsTo` string describing the CLI flag or domain concept. Labels MUST be human workflow actions, not raw MCP tool names.

#### Scenario: JSON contract for agents

- **WHEN** a user or agent runs `sdm suggest --json` inside a valid project with a resolvable focus
- **THEN** stdout is JSON with `ok: true`, `snapshot`, and 1–5 `suggestions`

#### Scenario: Levers use Russian phrases

- **WHEN** an `export-test` suggestion is included
- **THEN** at least one lever uses a Russian phrase such as «без текстовых» mapped to exclude-open / `--exclude-type open` semantics

### Requirement: Optional profile and level focus

Suggest SHALL accept optional profile and level identifiers. When omitted and exactly one sensible focus exists, suggest MAY auto-select it and report it under `focus`. When multiple profiles/levels exist and focus cannot be determined, suggest MUST fail with a stable code (e.g. `SUGGEST_FOCUS_REQUIRED`) or return suggestions that only ask the agent to clarify focus—without guessing writes.

#### Scenario: Explicit focus

- **WHEN** suggest is called with `--profile` and `--level` for an existing pair
- **THEN** `focus` matches those ids and snapshot/gaps are computed for that pair when applicable

### Requirement: Post-questions to export to player priority

When a focused level has one or more questions and no matching export pack is detected, suggest SHALL include an export-test (or equivalent) suggestion among the top results. When an export exists but `player/index.html` is missing, suggest SHALL include a player-related suggestion. Gap-closing suggestions SHALL outrank export when the level has `missing` or `thin` coverage, except that export MAY appear as a lower-priority preview option.

#### Scenario: Questions without export suggest export

- **WHEN** the focused level has questions and no export file is detected for that focus
- **THEN** suggestions include an export-oriented action with export levers

#### Scenario: Export without player suggests player

- **WHEN** an export exists for the focus and `player/index.html` is absent
- **THEN** suggestions include installing or using the author preview player

#### Scenario: Thin coverage prefers gaps

- **WHEN** cert gaps report thin or missing skills for the focus
- **THEN** a close-gaps or generate-questions suggestion ranks above a primary export push

### Requirement: Threshold and volume levers stay distinct

Suggestions and levers that mention pass difficulty SHALL refer to level `threshold` (or equivalent) separately from question count / `--per-skill` volume and from requirement `depth` / `weight`. The payload MUST NOT present threshold change as the same lever as adding questions.

#### Scenario: Stricter pass is threshold lever

- **WHEN** suggestions include a «строже порог» style lever
- **THEN** its `mapsTo` refers to threshold (not depth/weight or per-skill alone)

### Requirement: Guide-suggest portable skill and AGENTS routing

The repository SHALL ship `agents/guide-suggest/SKILL.md` instructing agents: after successful question generate/add (and similar writes), or when the human asks what to do next without a concrete methodology intent, call `suggest` / `sdm suggest --json`, present a short action menu with levers, and MUST NOT answer with a raw MCP tool catalog. `AGENTS.md` SHALL list `guide-suggest` and this routing rule. Choosing an action SHOULD hand off to `intent-loop` or the named skill (`export-methodology`, `close-coverage`, etc.).

#### Scenario: Agent discovers guide-suggest

- **WHEN** an agent reads `AGENTS.md`
- **THEN** `guide-suggest` is listed for post-write / «что дальше?» coaching

#### Scenario: Skill forbids MCP catalog answers

- **WHEN** the human asks «что дальше?» after seeding questions
- **THEN** the skill requires calling suggest and proposing actions/levers, not listing MCP tool names as the primary answer
