## MODIFIED Requirements

### Requirement: Bootstrap role pack skill exists

The repository SHALL ship a portable skill at `agents/bootstrap-profile-pack/SKILL.md` that orchestrates greenfield **profile** foundation via SDM CLI/MCP with a human-in-the-loop confirmation gate. The former path `agents/bootstrap-role-pack/` MUST NOT remain the canonical skill location.

#### Scenario: Skill is listed for agents

- **WHEN** an agent reads `AGENTS.md`
- **THEN** `bootstrap-profile-pack` is listed with guidance to use it for new profile/level foundation with HITL
- **AND** Role is not presented as the Specra entity name

### Requirement: Plan before write

The skill SHALL require the agent to present a structured plan (profile, level, skills, requirements, questionsPerSkill, optional export) and obtain explicit user confirmation before any Specra write command.

#### Scenario: No writes before confirm

- **WHEN** the user has not confirmed the plan
- **THEN** the agent MUST NOT run Specra write commands for that pack

### Requirement: Optional export and handoff

The plan MAY include `exportTest: true`. After verify, if set, the agent SHALL run `export test` for the profile/level using `--profile`. The skill SHALL hand off remaining thin gaps to `close-coverage` / further NL edits.

#### Scenario: Export when requested in plan

- **WHEN** confirmed plan has `exportTest: true`
- **THEN** after seeding the agent runs `sdm export test --profile … --level … --json` (or MCP equivalent)
