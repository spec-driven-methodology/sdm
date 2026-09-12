## ADDED Requirements

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

## MODIFIED Requirements

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
