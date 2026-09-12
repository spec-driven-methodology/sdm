## MODIFIED Requirements

### Requirement: Portable bootstrap-methodology skill

The Specra repository SHALL ship a portable agent skill at `agents/bootstrap-methodology/SKILL.md` that instructs any AI agent to bootstrap methodology content using SDM CLI commands with `--json`, without hand-editing YAML when a command exists. Copy MUST use **profile** (not role) as the track entity.

#### Scenario: Greenfield profile/level loop

- **WHEN** an agent follows `bootstrap-methodology` for a new profile and level
- **THEN** the skill MUST prescribe creating/using a **profile**, skills, certification level, questions, then `cert coverage --json` with `--profile`
- **AND** each Specra invocation in the skill MUST show a `--json` form

#### Scenario: Handoff to gap closing

- **WHEN** bootstrap finishes and coverage still reports `missing` or `thin` skills
- **THEN** the skill MUST direct the agent to continue with `agents/close-coverage` (or equivalent) rather than inventing a second gap-closing procedure
