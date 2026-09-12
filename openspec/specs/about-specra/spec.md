# about-sdm

## Purpose

Canonical product identity for agents and humans: positioning canon, `sdm about` / MCP `about`, and portable skill routing for «что такое Specra?» — without mixing with project `doctor`.

## Requirements

### Requirement: Positioning canon file exists

The Specra package root SHALL ship a short `ABOUT.md` that states what Specra is (methodology-as-specs framework: ontology of skills → content library → profiles/thresholds → coverage audit and export; assessment and learning on one competency skeleton / эталон), what it is not (including that it is not primarily an HR testing UI, not an LMS, does not run candidate assessments as its primary product surface, and is not a full agent harness / model orchestrator), the agent-first usage model for competency owners, the English tagline `Methodology-as-Specs Framework`, and product boundaries for methodology infrastructure.

#### Scenario: Canon is discoverable

- **WHEN** an agent or human opens the Specra package root
- **THEN** `ABOUT.md` is present alongside `AGENTS.md`

#### Scenario: Canon rejects testing-platform framing

- **WHEN** a reader follows `ABOUT.md` what-not guidance
- **THEN** Specra MUST NOT be described as a primary HR testing platform or candidate test runner

### Requirement: Canonical English tagline is Methodology-as-Specs Framework

The Specra package root `ABOUT.md` frontmatter `tagline` and the about payload field `tagline` SHALL equal exactly `Methodology-as-Specs Framework`. Live product identity MUST NOT use `Spec-based Methodology Framework` or `Spec-based Resource Assessment Framework` as the tagline. Historical etymology of Spec + RA MAY appear in prose as history only, not as the active tagline.

#### Scenario: About payload tagline

- **WHEN** an agent runs `sdm about --json` (or MCP `about`)
- **THEN** `tagline` is `Methodology-as-Specs Framework`

#### Scenario: ABOUT frontmatter matches payload

- **WHEN** `ABOUT.md` frontmatter is parsed for the about payload
- **THEN** frontmatter `tagline` equals the payload `tagline`

### Requirement: Positioning states methodology-as-specs for assessment and learning

`ABOUT.md` positioning (`what` / `whatNot` / `model`) SHALL describe Specra as a methodology-as-specs framework with the chain ontology of skills → content library → profiles/thresholds → coverage audit and export, with one competency skeleton (эталон) for assessment and learning, and SHALL identify competency owners as the human audience in the agent-first model. `whatNot` MUST continue to reject HR testing UI / LMS / candidate test-runner framing and MUST reject framing Specra as a full agent harness / model orchestrator. `model` MAY mention university, bootcamp, or similar settings only as example contexts for competency owners, not as a replacement audience type.

#### Scenario: What covers pipeline and dual use

- **WHEN** a reader or agent inspects `positioning.what`
- **THEN** it conveys methodology-as-specs (or equivalent RU), the content pipeline (skills/ontology, library, profiles/thresholds, coverage/export — or equivalent RU), and both assessment and learning

#### Scenario: Model names competency owners

- **WHEN** a reader or agent inspects `positioning.model`
- **THEN** it refers to competency owners (or equivalent RU: владельцы компетенций) and agent-first execution via CLI/MCP

#### Scenario: whatNot includes harness boundary

- **WHEN** a reader or agent inspects `positioning.whatNot`
- **THEN** the list rejects full agent harness / orchestration in addition to HR testing UI / LMS boundaries

### Requirement: Positioning conveys эталон and system picture

`ABOUT.md` positioning and prose SHALL present Specra as the **эталон** (единый источник правды) of competency methodology alongside the existing competency skeleton, and SHALL describe the system picture: methodology specs in repository files (git), the framework as schema/ops/coverage/quality boundaries, and the AI agent with a model as the primary executor (CLI/MCP as the agent tool surface). Quality of outcomes MAY be described as depending on specs × agent × model within that frame.

#### Scenario: What or model mentions эталон or source of truth

- **WHEN** a reader or agent inspects `positioning.what` or `positioning.model`
- **THEN** the text conveys эталон / источник правды / single source of truth (or equivalent) for competency methodology, without dropping the methodology-as-specs pipeline or assessment+learning skeleton

#### Scenario: Canon describes specs framework agent

- **WHEN** a reader opens `ABOUT.md` body sections that explain how Specra works
- **THEN** the canon distinguishes repository specs, framework rules, and agent+model execution (not a hidden methodology database as the primary store)

### Requirement: whatNot rejects full agent harness

`ABOUT.md` frontmatter `whatNot` and the about payload `positioning.whatNot` SHALL include a boundary that Specra is not a full agent harness / model orchestrator (CLI/MCP provide access to the methodology эталон, not multi-agent runtime orchestration).

#### Scenario: About payload lists harness boundary

- **WHEN** an agent runs `sdm about --json`
- **THEN** at least one `positioning.whatNot` entry rejects a full agent harness or model orchestration (RU or EN equivalent)

#### Scenario: Explain-sdm rejects harness framing

- **WHEN** an agent follows `agents/explain-specra/SKILL.md`
- **THEN** anti-patterns include framing Specra as a full agent harness / orchestrator

### Requirement: Core about payload is project-independent

`@spec-driven-methodology/core` SHALL expose a function that returns a JSON-serializable about payload with at least: `ok: true`, `version` (full product identity string from SSOT, including stage and build when present), `positioning` (`what`, `whatNot`, `model`), `capabilities` (`cli`, `mcp`, `skills`), `nextSteps`, and `pointers`. Building the payload MUST NOT require a methodology project directory (`sdm.yaml`).

#### Scenario: About without project root

- **WHEN** about is invoked from a directory that is not a SDM methodology project
- **THEN** the payload still returns `ok: true` with version and positioning

#### Scenario: Version matches package identity

- **WHEN** about builds the payload and root `package.json` version is `0.8.0-alpha.143`
- **THEN** `version` MUST equal `0.8.0-alpha.143`

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

### Requirement: About capabilities list studio sync

When `sdm studio sync` ships as a public CLI command, the about payload `capabilities.cli` SHALL include the identifier `studio sync`. MCP tool `studio_sync` is NOT required in the same release if MCP is out of scope for that slice.

#### Scenario: About lists studio sync

- **WHEN** a client calls `sdm about --json` after studio sync ships
- **THEN** `capabilities.cli` includes `studio sync`

### Requirement: About capabilities list studio bridge commands

When studio bridge CLI commands ship, the about payload `capabilities.cli` SHALL include `studio push-view`, `studio pull-action`, and `studio serve`.

#### Scenario: About lists bridge commands

- **WHEN** a client calls `sdm about --json` after the bridge ships
- **THEN** `capabilities.cli` includes `studio push-view`, `studio pull-action`, and `studio serve`

### Requirement: About capabilities list studio push-coverage

When `sdm studio push-coverage` ships, the about payload `capabilities.cli` SHALL include `studio push-coverage`.

#### Scenario: About lists push-coverage

- **WHEN** a client calls `sdm about --json` after push-coverage ships
- **THEN** `capabilities.cli` includes `studio push-coverage`

### Requirement: About MCP capabilities list studio tools

When studio MCP tools ship, the about payload `capabilities.mcp` SHALL include `studio_sync`, `studio_push_view`, `studio_push_coverage`, and `studio_pull_action`.

#### Scenario: About lists studio MCP tools

- **WHEN** a client calls `sdm about --json` after studio MCP tools ship
- **THEN** `capabilities.mcp` includes those four tool names

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

### Requirement: About version uses shared product-version helper

Building the about payload MUST obtain `version` through the same `@spec-driven-methodology/core` product-version helper used by CLI `--version` and MCP initialize (root package.json SSOT). About MUST NOT read a divergent package path for product version.

#### Scenario: About matches CLI version string

- **WHEN** an agent runs `sdm about --json` and `sdm --version` in the same Specra install
- **THEN** `about.version` equals the CLI version string

### Requirement: About capabilities list quality report
The about payload `capabilities.cli` SHALL include `quality report` and `capabilities.mcp` SHALL include `quality_report`, kept in sync with CLI and MCP registration.

#### Scenario: About JSON lists quality surfaces
- **WHEN** an agent runs `sdm about --json`
- **THEN** `capabilities.cli` contains `quality report` and `capabilities.mcp` contains `quality_report`

### Requirement: About MCP capabilities match registration

The about payload `capabilities.mcp` SHALL list the same tool names as `@spec-driven-methodology/mcp` `TOOL_NAMES` (set equality), kept in sync when tools are added or removed.

#### Scenario: About JSON mcp list matches TOOL_NAMES

- **WHEN** an agent reads `about` JSON and compares `capabilities.mcp` to MCP `TOOL_NAMES`
- **THEN** the sets are equal

### Requirement: About capabilities list content stale

When `sdm content stale` ships as a public CLI command, the about payload `capabilities.cli` SHALL include the identifier `content stale`. When MCP tool `content_stale` ships, `capabilities.mcp` SHALL include `content_stale`.

#### Scenario: About lists content stale CLI

- **WHEN** a client calls `sdm about --json` after content stale ships
- **THEN** `capabilities.cli` includes `content stale`

#### Scenario: About lists content_stale MCP

- **WHEN** a client calls `sdm about --json` after the MCP tool ships
- **THEN** `capabilities.mcp` includes `content_stale`
