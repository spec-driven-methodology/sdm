## ADDED Requirements

### Requirement: Positioning canon file exists

The Specra package root SHALL ship a short `ABOUT.md` that states what Specra is, what it is not (including that it is not primarily an HR testing UI and does not run candidate assessments as its primary product surface), the agent-first usage model, and product boundaries for methodology infrastructure.

#### Scenario: Canon is discoverable

- **WHEN** an agent or human opens the Specra package root
- **THEN** `ABOUT.md` is present alongside `AGENTS.md`

#### Scenario: Canon rejects testing-platform framing

- **WHEN** a reader follows `ABOUT.md` what-not guidance
- **THEN** Specra MUST NOT be described as a primary HR testing platform or candidate test runner

### Requirement: Core about payload is project-independent

`@spec-driven-methodology/core` SHALL expose a function that returns a JSON-serializable about payload with at least: `ok: true`, `version` (product version string), `positioning` (`what`, `whatNot`, `model`), `capabilities` (`cli`, `mcp`, `skills`), `nextSteps`, and `pointers`. Building the payload MUST NOT require a methodology project directory (`sdm.yaml`).

#### Scenario: About without project root

- **WHEN** about is invoked from a directory that is not a SDM methodology project
- **THEN** the payload still returns `ok: true` with version and positioning

#### Scenario: Version matches package

- **WHEN** about builds the payload
- **THEN** `version` MUST equal the Specra package root `package.json` version

### Requirement: CLI sdm about

The CLI SHALL provide `sdm about` with `--json` that prints the core about payload. Without `--json`, it SHALL print a short human-readable summary derived from the same payload. The command MUST NOT start an interactive wizard and MUST NOT call `doctor` semantics.

#### Scenario: JSON mode for agents

- **WHEN** a user or agent runs `sdm about --json`
- **THEN** stdout is a single JSON object with `ok: true` and the about fields

#### Scenario: Text mode is non-interactive

- **WHEN** a user runs `sdm about` on a TTY
- **THEN** the process prints a summary and exits without prompting

### Requirement: Capabilities reflect registered surface

The about payload `capabilities.cli` and `capabilities.mcp` SHALL list shipped public command/tool identifiers from a maintained registry of the real surface (not README prose alone). `capabilities.skills` SHALL include portable skills discovered from `agents/*/SKILL.md` (at least `intent-loop`, `explain-sdm`, and `connect-mcp` when those skills ship).

#### Scenario: Known MCP tools listed

- **WHEN** about builds `capabilities.mcp`
- **THEN** the list includes `about` and `doctor` among shipped tools

#### Scenario: Skills include explain-sdm

- **WHEN** about builds `capabilities.skills` after the explain skill ships
- **THEN** an entry with id `explain-sdm` is present

### Requirement: Explain-sdm portable skill and AGENTS routing

The repository SHALL ship `agents/explain-specra/SKILL.md` that instructs any AI agent: when the human asks what Specra is, what it can do, why to use it, or how to position it, the agent MUST call MCP `about` or `sdm about --json`, then paraphrase for the human. The agent MUST NOT invent CLI commands or methodology YAML layouts outside that payload, and MUST NOT frame Specra as an HR testing platform. `AGENTS.md` SHALL list `explain-sdm` and state this routing rule.

#### Scenario: Agent discovers explain-sdm

- **WHEN** an agent reads `AGENTS.md`
- **THEN** `explain-sdm` is listed for product-identity / «что такое Specra» questions

#### Scenario: Skill prefers about tool

- **WHEN** the human asks «что такое Specra и что умеет?»
- **THEN** the skill requires calling `about` / `sdm about --json` before answering

### Requirement: Next steps guide onboarding

The about payload `nextSteps` SHALL include actionable hints that point agents toward `intent-loop` (methodology intents), project `init`, and MCP/skills connect (`connect-mcp` / `mcp install` / `agent install`) as appropriate entry points.

#### Scenario: Next steps present

- **WHEN** about builds the payload
- **THEN** `nextSteps` is a non-empty array including an entry related to `intent-loop`
