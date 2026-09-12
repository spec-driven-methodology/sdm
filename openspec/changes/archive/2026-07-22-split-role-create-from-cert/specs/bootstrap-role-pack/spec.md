## MODIFIED Requirements

### Requirement: Plan before write

The skill SHALL require the agent to present a structured plan (role, level, skills, requirements, questionsPerSkill, optional export) and obtain explicit user confirmation before any Specra write command (`role create`, `skill add`, `skill link`, `cert create`, `question add`).

#### Scenario: No writes before confirm

- **WHEN** the user has not confirmed the plan
- **THEN** the agent MUST NOT run Specra write commands for that pack

#### Scenario: User may edit plan

- **WHEN** the user requests changes to skills or requirements before confirm
- **THEN** the agent updates the plan and re-requests confirmation

### Requirement: Execute after confirm

After confirmation the skill SHALL instruct the agent to execute in order: ensure project (`doctor` / `init` if user asked), `role create`, add skills and optional links, `cert create` for the level (role must already exist), seed questions via `question generate` + agent fill + `question add`, then verify with `cert gaps` (and optional `cert coverage`).

#### Scenario: Seed uses generate then add

- **WHEN** seeding questions for a skill in the pack
- **THEN** the agent uses `question generate` (shells + context), fills content, then `question add` — and does not claim generate wrote files

#### Scenario: Role before cert

- **WHEN** executing a confirmed pack for a new role
- **THEN** the agent runs `role create` before `cert create`
- **AND** does not rely on `cert create` to invent the role file
