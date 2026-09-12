## ADDED Requirements

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

## MODIFIED Requirements

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
