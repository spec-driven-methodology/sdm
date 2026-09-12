# skill-graph-cli Specification

## Purpose
TBD - created by archiving change skill-graph-cli. Update Purpose after archive.
## Requirements
### Requirement: Skill graph for profile and level
The system SHALL provide `sdm skill graph --profile <profile> --level <level>` that shows required skills as a dependency-oriented tree with optional coverage indicators.

#### Scenario: JSON graph success
- **WHEN** an agent runs `sdm skill graph --profile java-developer --level middle --json` in a valid project
- **THEN** stdout JSON has `ok: true`, schema `sdm.skill.graph/v1`, and a `nodes` list for required skills

#### Scenario: Terminal coverage bars
- **WHEN** the command runs without `--json` and with coverage enabled (default)
- **THEN** stdout includes per-skill status symbols and bar-like progress for question coverage

### Requirement: Skill impact analysis

The system SHALL provide `sdm skill impact --skill <id>` listing skills that depend on it (transitively), certifications (profiles/levels) that require any affected skill, questions bound to the target or downstream skills, and export artifacts under `exports/` that reference affected skills or certifications.

#### Scenario: JSON impact success

- **WHEN** an agent runs `sdm skill impact --skill java-core --json`
- **THEN** stdout JSON has `ok: true`, schema `sdm.skill.impact/v2` (or newer), `downstreamSkills`, `profiles`, `levels`, `questions`, and `exports`

#### Scenario: Unknown skill

- **WHEN** `--skill` references a missing ontology id
- **THEN** the command fails with `SKILL_NOT_FOUND`

#### Scenario: Terminal lists artifact counts

- **WHEN** the command runs without `--json` for a skill with questions or exports in scope
- **THEN** stdout mentions affected questions and/or exports (counts or ids) in addition to downstream skills and certifications

