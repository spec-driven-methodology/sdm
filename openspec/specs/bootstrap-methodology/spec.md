# bootstrap-methodology

## Purpose

Portable agent skill documenting the greenfield methodology loop: profile create → skill add → cert create → question add → coverage --json.

## Requirements

### Requirement: Portable bootstrap-methodology skill

The SDM repository SHALL ship a portable agent skill at `agents/bootstrap-methodology/SKILL.md` that instructs any AI agent to bootstrap methodology content using SDM CLI commands with `--json`, without hand-editing YAML when a command exists.

#### Scenario: Greenfield profile/level loop

- **WHEN** an agent follows `bootstrap-methodology` for a new profile and level
- **THEN** the skill MUST prescribe this order: confirm project (`doctor` / `init` as appropriate) → `profile create` → `skill add` for required skills → `cert create --profile` with requirement triples → `question add` for seeded questions → `cert coverage --profile … --json`
- **AND** each SDM invocation in the skill MUST show a `--json` form

#### Scenario: Handoff to gap closing

- **WHEN** bootstrap finishes and coverage still reports `missing` or `thin` skills
- **THEN** the skill MUST direct the agent to continue with `agents/close-coverage` (or equivalent) rather than inventing a second gap-closing procedure

### Requirement: Agent skill index documents bootstrap vs close-coverage

`AGENTS.md` and `agents/README.md` SHALL list `bootstrap-methodology` alongside `close-coverage` and state when to use each (create structure vs close gaps).

#### Scenario: Agent discovers the right skill

- **WHEN** an agent reads `AGENTS.md` or `agents/README.md`
- **THEN** it MUST be able to choose bootstrap for empty/new ontology+cert setup and close-coverage for existing profile/level gap fills

### Requirement: close-coverage points to bootstrap when prerequisites missing

`agents/close-coverage/SKILL.md` SHALL include a short guard that, when profile/level or required skills are absent, points the agent to `bootstrap-methodology` (or creating skills/certs via CLI) instead of only retrying `question add`.

#### Scenario: Coverage or add fails because structure is missing

- **WHEN** an agent following close-coverage cannot proceed because the certification or ontology skills do not exist
- **THEN** the skill MUST instruct switching to bootstrap (or `profile create` / `skill add` / `cert create`) before continuing gap fills
