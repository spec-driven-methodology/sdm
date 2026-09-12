## ADDED Requirements

### Requirement: Bootstrap role pack skill exists

The repository SHALL ship a portable skill at `agents/bootstrap-role-pack/SKILL.md` that orchestrates greenfield role foundation via SDM CLI/MCP with a human-in-the-loop confirmation gate.

#### Scenario: Skill is listed for agents

- **WHEN** an agent reads `AGENTS.md`
- **THEN** `bootstrap-role-pack` is listed with guidance to use it for new role/level foundation with HITL

### Requirement: Plan before write

The skill SHALL require the agent to present a structured plan (role, level, skills, requirements, questionsPerSkill, optional export) and obtain explicit user confirmation before any Specra write command (`skill add`, `skill link`, `cert create`, `question add`).

#### Scenario: No writes before confirm

- **WHEN** the user has not confirmed the plan
- **THEN** the agent MUST NOT run Specra write commands for that pack

#### Scenario: User may edit plan

- **WHEN** the user requests changes to skills or requirements before confirm
- **THEN** the agent updates the plan and re-requests confirmation

### Requirement: Execute after confirm

After confirmation the skill SHALL instruct the agent to execute in order: ensure project (`doctor` / `init` if user asked), add skills and optional links, create certification, seed questions via `question generate` + agent fill + `question add`, then verify with `cert gaps` (and optional `cert coverage`).

#### Scenario: Seed uses generate then add

- **WHEN** seeding questions for a skill in the pack
- **THEN** the agent uses `question generate` (shells + context), fills content, then `question add` — and does not claim generate wrote files

### Requirement: Optional export and handoff

The plan MAY include `exportTest: true`. After verify, if set, the agent SHALL run `export test` for the role/level. The skill SHALL hand off remaining thin gaps to `close-coverage` / further NL edits.

#### Scenario: Export when requested in plan

- **WHEN** confirmed plan has `exportTest: true`
- **THEN** after seeding the agent runs `sdm export test --role … --level … --json` (or MCP equivalent)
