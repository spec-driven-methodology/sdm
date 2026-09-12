## MODIFIED Requirements

### Requirement: Portable bootstrap-methodology skill

The Specra repository SHALL ship a portable agent skill at `agents/bootstrap-methodology/SKILL.md` that instructs any AI agent to bootstrap methodology content using SDM CLI commands with `--json`, without hand-editing YAML when a command exists.

#### Scenario: Greenfield role/level loop

- **WHEN** an agent follows `bootstrap-methodology` for a new role and level
- **THEN** the skill MUST prescribe this order: confirm project (`doctor` / `init` as appropriate) → `role create` for the profile → `skill add` for required skills → `cert create` with requirement triples against the existing role → `question add` for seeded questions → `cert coverage --json`
- **AND** each Specra invocation in the skill MUST show a `--json` form

#### Scenario: Handoff to gap closing

- **WHEN** bootstrap finishes and coverage still reports `missing` or `thin` skills
- **THEN** the skill MUST direct the agent to continue with `agents/close-coverage` (or equivalent) rather than inventing a second gap-closing procedure

### Requirement: close-coverage points to bootstrap when prerequisites missing

`agents/close-coverage/SKILL.md` SHALL include a short guard that, when role/level or required skills are absent, points the agent to `bootstrap-methodology` (or creating role/skills/certs via CLI) instead of only retrying `question add`.

#### Scenario: Coverage or add fails because structure is missing

- **WHEN** an agent following close-coverage cannot proceed because the certification or ontology skills do not exist
- **THEN** the skill MUST instruct switching to bootstrap (or `role create` / `skill add` / `cert create`) before continuing gap fills
