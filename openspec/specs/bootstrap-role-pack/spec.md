# bootstrap-role-pack

## Purpose

Portable HITL skill for greenfield **profile**/level foundation (canonical path: `agents/bootstrap-profile-pack/`; legacy folder name may stub to it). Prefer `intent-loop` for incomplete human NL intents.

## Requirements

### Requirement: Bootstrap profile pack skill exists

The repository SHALL ship a portable skill at `agents/bootstrap-profile-pack/SKILL.md` that orchestrates greenfield profile foundation via SDM CLI/MCP with a human-in-the-loop confirmation gate. A stub at `agents/bootstrap-role-pack/` MAY point to the new path.

#### Scenario: Skill is listed for agents

- **WHEN** an agent reads `AGENTS.md`
- **THEN** `bootstrap-profile-pack` (and/or intent-loop routing to it) is listed for new profile/level foundation with HITL

### Requirement: Reachable from intent-loop

The pack SHALL be invocable as plan kind `profile-pack` from `intent-loop`. Non-developer humans normally start from `intent-loop`.

#### Scenario: Skill cross-links intent-loop

- **WHEN** an agent reads the bootstrap pack `SKILL.md`
- **THEN** the skill points to `intent-loop` as the preferred entry for incomplete natural-language intents from humans

### Requirement: Plan before write

The skill SHALL require the agent to present a structured plan (profile, level, skills, requirements, questionsPerSkill, optional export) and obtain explicit user confirmation before any Specra write command (`profile create`, `skill add`, `skill link`, `cert create`, `question add`). Clarifying questions via `intent-loop` MAY precede the plan; the confirmation gate before writes remains mandatory.

#### Scenario: No writes before confirm

- **WHEN** the user has not confirmed the plan
- **THEN** the agent MUST NOT run Specra write commands for that pack

#### Scenario: User may edit plan

- **WHEN** the user requests changes to skills or requirements before confirm
- **THEN** the agent updates the plan and re-requests confirmation

#### Scenario: Clarify may precede plan

- **WHEN** the user started with an incomplete intent through `intent-loop`
- **THEN** clarifying Q&A MAY complete before the structured plan is shown, and writes still require plan confirmation

### Requirement: Execute after confirm

After confirmation the skill SHALL instruct the agent to execute in order: ensure project (`doctor` / `init` if user asked), `profile create`, add skills and optional links, create certification level, seed questions via `question generate` + agent fill + `question add`, then verify with `cert gaps` (and optional `cert coverage`).

#### Scenario: Seed uses generate then add

- **WHEN** seeding questions for a skill in the pack
- **THEN** the agent uses `question generate` (shells + context), fills content, then `question add` — and does not claim generate wrote files

### Requirement: Optional export and handoff

The plan MAY include `exportTest: true`. After verify, if set, the agent SHALL run `export test` for the profile/level. The skill SHALL hand off remaining thin gaps to `close-coverage` / further NL edits.

#### Scenario: Export when requested in plan

- **WHEN** confirmed plan has `exportTest: true`
- **THEN** after seeding the agent runs `sdm export test --profile … --level … --json` (or MCP equivalent)

### Requirement: Profile-pack seed respects typeMix

The bootstrap profile-pack skill SHALL include optional `typeMix` in the structured plan seed (`single` | `mixed` | `full`, default `single`). After confirmation, when seeding questions the agent SHALL pass the mix into `question generate` (e.g. `--mix mixed`) instead of forcing every question to `single_choice`, unless the plan’s mix is `single`. Persistence remains `question add` per filled draft with the draft’s assigned type.

#### Scenario: Mixed seed uses generate --mix

- **WHEN** the confirmed profile-pack plan has `seed.typeMix: mixed`
- **AND** the agent seeds questions for a skill
- **THEN** the agent invokes `question generate` with `--mix mixed` (or MCP equivalent) before fill and `question add`

#### Scenario: Default seed remains single_choice path

- **WHEN** the confirmed plan omits `typeMix` or sets `single`
- **THEN** seeding may use homogeneous `single_choice` as today
