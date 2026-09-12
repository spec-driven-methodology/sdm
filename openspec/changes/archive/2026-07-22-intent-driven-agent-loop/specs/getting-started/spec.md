## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Onboarding includes build, methodology, and smoke

The getting-started path SHALL include: clone → `npm install` / build / link for CLI (and MCP as needed) → create a methodology project (`sdm init`, optionally `--with-examples`) → MCP install for GigaCode (or documented alternative) → reload host → smoke via MCP `doctor` and/or agent-invoked `doctor` → then the intent-first agent loop (not a manual CLI domain-command tutorial as the primary next step).

#### Scenario: Smoke checklist is explicit

- **WHEN** a reader finishes the guide
- **THEN** they have a checklist that includes at least verifying `doctor` succeeds against the methodology project

#### Scenario: Next step after smoke is agent intent

- **WHEN** smoke succeeds
- **THEN** the guide’s recommended next step is describing an intent to the agent (e.g. role foundation), not manually running `question add` / `cert coverage` with flags
