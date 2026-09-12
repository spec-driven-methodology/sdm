## MODIFIED Requirements

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
