## ADDED Requirements

### Requirement: Getting started guide exists

The repository SHALL ship `GETTING_STARTED.md` at the product root with a copy-paste happy path in Russian for installing Specra from git and verifying MCP.

#### Scenario: Guide is discoverable from README

- **WHEN** a newcomer opens `README.md`
- **THEN** there is a prominent link to `GETTING_STARTED.md`

### Requirement: GigaCode is the primary MCP onboarding path

`GETTING_STARTED.md` and the MCP section of `README.md` SHALL present **GigaCode** as the primary agent host for connecting SDM MCP. Cursor MAY appear as an alternative host, not as the only or leading path.

#### Scenario: Primary install command is gigacode

- **WHEN** a reader follows the main MCP install steps in `GETTING_STARTED.md`
- **THEN** the documented install uses `sdm mcp install --hosts gigacode` (with `--project` pointing at the methodology directory)

#### Scenario: connect-mcp skill leads with GigaCode

- **WHEN** an agent reads `agents/connect-mcp/SKILL.md`
- **THEN** the first concrete install example targets `gigacode` before Cursor-only examples

### Requirement: Onboarding includes build, methodology, and smoke

The getting-started path SHALL include: clone → `npm install` / `npm run build` / `npm link` for CLI (and MCP as needed) → `sdm init --with-examples` (or equivalent) → MCP install for GigaCode → reload host → smoke via MCP `doctor` and/or `sdm doctor`.

#### Scenario: Smoke checklist is explicit

- **WHEN** a reader finishes the guide
- **THEN** they have a checklist that includes at least verifying `doctor` succeeds against the methodology project

### Requirement: Experimental GigaCode caveats are documented

Docs SHALL state that the GigaCode host adapter is experimental, default config path is `~/.gigacode/settings.json`, and overrides `--gigacode-home` / `--config` exist.

#### Scenario: Path override documented

- **WHEN** settings do not live at the default path
- **THEN** the guide documents `--gigacode-home` or `--config` for install
