# getting-started

## Purpose

OSS-онбординг Specra: clone → build → methodology → подключение MCP с акцентом на GigaCode, smoke `doctor`, затем intent-first работа через агента.

## Requirements

### Requirement: Getting started guide exists

The repository SHALL ship `GETTING_STARTED.md` at the product root with a copy-paste happy path in Russian for installing Specra from git and verifying MCP.

#### Scenario: Guide is discoverable from README

- **WHEN** a newcomer opens `README.md`
- **THEN** there is a prominent link to `GETTING_STARTED.md`

### Requirement: GigaCode is the primary MCP onboarding path

`GETTING_STARTED.md` and the MCP section of `README.md` SHALL present **GigaCode** as the primary agent host for connecting SDM MCP. Cursor MAY appear as an alternative host, not as the only or leading path.

The primary install example SHALL use `sdm mcp install --hosts gigacode` **without** requiring `--project` (multi-project default). Optional `--project` MAY be documented as an advanced default only. Smoke SHALL use per-call MCP/CLI `project` (or cwd) against the methodology directory.

#### Scenario: Primary install command is gigacode multi-project

- **WHEN** a reader follows the main MCP install steps in `GETTING_STARTED.md`
- **THEN** the documented primary install uses `sdm mcp install --hosts gigacode` without mandatory `--project`
- **AND** the guide states that portable skills are installed by default (or lists `agent install` as required)

#### Scenario: connect-mcp skill leads with GigaCode

- **WHEN** an agent reads `agents/connect-mcp/SKILL.md`
- **THEN** the first concrete install example targets `gigacode` before Cursor-only examples

### Requirement: Onboarding includes build, methodology, and smoke

The getting-started path SHALL include: clone → `npm install` / build / link for CLI (and MCP as needed) → create a methodology project (`sdm init`, optionally `--with-examples`) → host wire for GigaCode (or documented alternative) via `mcp install` (skills by default) → reload host → smoke via MCP `doctor` with explicit methodology `project` and/or agent-invoked `doctor` → confirm portable skills visible → then the intent-first agent loop (not a manual CLI domain-command tutorial as the primary next step).

#### Scenario: Smoke checklist is explicit

- **WHEN** a reader finishes the guide
- **THEN** they have a checklist that includes at least verifying `doctor` succeeds against the methodology project

#### Scenario: Next step after smoke is agent intent

- **WHEN** smoke succeeds
- **THEN** the guide’s recommended next step is describing an intent to the agent (e.g. profile foundation), not manually running `question add` / `cert coverage` with flags

### Requirement: Onboarding checklist includes portable skills

`GETTING_STARTED.md` smoke / setup checklist SHALL require that the agent host can see Specra portable skills after wire (at least `intent-loop`), not only that MCP `doctor` works. The guide SHALL present `mcp install` as installing skills by default (and mention `--no-skills` only as opt-out), or explicitly list `agent install` as a required sibling step if documenting an older split path.

#### Scenario: Skills item on checklist

- **WHEN** a reader finishes the guide’s install checklist
- **THEN** the checklist includes verifying Specra skills (e.g. `intent-loop`) are available in the host after wire

### Requirement: Init templates point at host wire

`sdm init` generated `README.md` and `AGENTS.md`, and the CLI success “Next” messaging, SHALL tell humans/agents to wire the host via `sdm mcp install --hosts …` (skills included by default) before expecting `intent-loop` in the IDE, and SHALL point at `GETTING_STARTED.md` / `connect-mcp`. They MUST NOT imply that creating a methodology project alone installs Cursor/GigaCode skills.

#### Scenario: New project README mentions mcp install

- **WHEN** a user runs `sdm init` in an empty directory
- **THEN** the created `README.md` (or AGENTS.md / printed Next steps) mentions `mcp install` (or host wire) and that portable skills come with that step by default

### Requirement: Init layout documents studio beside player

When Methodology Studio ships, `sdm init` generated project `README.md` (layout section) SHALL list `studio/` as the authoring preview/shell for intent-loop view/action documents, distinct from `player/` (export preview). The guide path MAY mention Studio as optional visual review; it MUST NOT present Studio as an LMS or as a replacement for the agent executor.

#### Scenario: New project README mentions studio

- **WHEN** a user runs `sdm init` in an empty directory after studio templates ship
- **THEN** the created `README.md` layout lists `studio/` in addition to `player/`

### Requirement: Human path is intent-first

`GETTING_STARTED.md` SHALL present the primary post-install user journey as: open an AI agent → describe a methodology intent in natural language → answer clarifying questions → confirm a plan → review the result. The guide MUST NOT require the human to type Specra domain CLI flags as the main happy path.

#### Scenario: Intent example in guide

- **WHEN** a reader finishes install and MCP (or CLI-for-agent) setup
- **THEN** the guide shows at least one example intent such as creating a Java Middle backend **profile** foundation and tells them to send it to the agent

### Requirement: CLI documented as agent tool surface

Getting-started and README SHALL state that SDM CLI commands are for AI agents and CI, not the primary interface for non-developer методологи. A short agent/CI appendix MAY list commands.

#### Scenario: Role split is explicit

- **WHEN** a non-developer reader opens `GETTING_STARTED.md`
- **THEN** they see that they talk to the agent in natural language while the agent calls Specra tools

### Requirement: Experimental GigaCode caveats are documented

Docs SHALL state that the GigaCode host adapter is experimental, default config path is `~/.gigacode/settings.json`, and overrides `--gigacode-home` / `--config` exist.

#### Scenario: Path override documented

- **WHEN** settings do not live at the default path
- **THEN** the guide documents `--gigacode-home` or `--config` for install

### Requirement: Onboarding mentions quality report for corpus and canon
Getting-started documentation SHALL mention `quality report` (or MCP `quality_report`) as the summary quality check for a methodology project and optionally for a folder of source markdown before bootstrap/intent-loop, distinct from detailed `audit`.

#### Scenario: Guide documents quality report
- **WHEN** a new contributor reads `GETTING_STARTED.md`
- **THEN** the guide references `quality report` or `quality_report`
