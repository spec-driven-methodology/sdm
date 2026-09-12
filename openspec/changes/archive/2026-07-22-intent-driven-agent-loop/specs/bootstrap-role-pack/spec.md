## ADDED Requirements

### Requirement: Reachable from intent-loop

The greenfield bootstrap pack skill SHALL remain the authoritative execute workflow for profile/level foundation and SHALL be invocable as plan kind `profile-pack` from `intent-loop`. Documentation SHALL state that non-developer humans normally start from `intent-loop` (clarify → plan), while agents may load the pack directly when the plan is already agreed. Product language SHALL say **Profile**, not Role (see `rename-role-to-profile` / `bootstrap-profile-pack` rename).

#### Scenario: Skill cross-links intent-loop

- **WHEN** an agent reads the bootstrap pack `SKILL.md`
- **THEN** the skill points to `intent-loop` as the preferred entry for incomplete natural-language intents from humans

## MODIFIED Requirements

### Requirement: Plan before write

The skill SHALL require the agent to present a structured plan (profile, level, skills, requirements, questionsPerSkill, optional export) and obtain explicit user confirmation before any Specra write command (`profile create`, `skill add`, `skill link`, `cert create`, `question add`). When the human arrived via `intent-loop`, clarifying questions MAY occur before this plan; the confirmation gate before writes remains mandatory.

#### Scenario: No writes before confirm

- **WHEN** the user has not confirmed the plan
- **THEN** the agent MUST NOT run Specra write commands for that pack

#### Scenario: User may edit plan

- **WHEN** the user requests changes to skills or requirements before confirm
- **THEN** the agent updates the plan and re-requests confirmation

#### Scenario: Clarify may precede plan

- **WHEN** the user started with an incomplete intent through `intent-loop`
- **THEN** clarifying Q&A MAY complete before the structured plan is shown, and writes still require plan confirmation
