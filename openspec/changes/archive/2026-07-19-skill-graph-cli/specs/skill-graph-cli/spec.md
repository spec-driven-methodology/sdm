## ADDED Requirements

### Requirement: Skill graph for role and level
The system SHALL provide `sdm skill graph --role <role> --level <level>` that shows required skills as a dependency-oriented tree with optional coverage indicators.

#### Scenario: JSON graph success
- **WHEN** an agent runs `sdm skill graph --role java-developer --level middle --json` in a valid project
- **THEN** stdout JSON has `ok: true`, schema `sdm.skill.graph/v1`, and a `nodes` list for required skills

#### Scenario: Terminal coverage bars
- **WHEN** the command runs without `--json` and with coverage enabled (default)
- **THEN** stdout includes per-skill status symbols and bar-like progress for question coverage

### Requirement: Skill impact analysis
The system SHALL provide `sdm skill impact --skill <id>` listing skills that depend on it (transitively) and certifications (roles/levels) that require any affected skill.

#### Scenario: JSON impact success
- **WHEN** an agent runs `sdm skill impact --skill java-core --json`
- **THEN** stdout JSON has `ok: true`, schema `sdm.skill.impact/v1`, `downstreamSkills`, `roles`, and `levels`

#### Scenario: Unknown skill
- **WHEN** `--skill` references a missing ontology id
- **THEN** the command fails with `SKILL_NOT_FOUND`
