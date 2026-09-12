## ADDED Requirements

### Requirement: Intent-loop portable skill exists

The repository SHALL ship a portable skill at `agents/intent-loop/SKILL.md` that instructs any AI agent to run an OpenSpec-shaped methodology workflow: intake natural-language intent → clarify missing slots → present a structured plan → wait for explicit human confirmation → execute via SDM CLI or MCP → present a structured result. `AGENTS.md` SHALL list `intent-loop` as the primary entry for greenfield and ambiguous methodology intents from non-developer humans. Human-facing language SHALL use **Profile** (not Role) for the assessment-track entity.

#### Scenario: Agent discovers intent-loop

- **WHEN** an agent reads `AGENTS.md`
- **THEN** `intent-loop` is listed as the primary skill for human intents such as «основа профиля Java Middle backend»

#### Scenario: Skill is host-agnostic

- **WHEN** the agent runs under GigaCode, Cursor, Claude Code, or another host
- **THEN** the skill allows MCP tools when available and equivalent `sdm … --json` CLI otherwise

### Requirement: Clarify before plan when slots missing

Before presenting a final plan, the skill SHALL require the agent to ask clarifying questions when the human intent does not specify required slots for the chosen plan kind (at minimum for profile-pack: profile identity/title, level, and direction/category or equivalent skill-set hint). The agent MUST NOT run Specra write commands during clarify.

#### Scenario: Incomplete intent triggers questions

- **WHEN** the human says only «хочу основу для Java» without level
- **THEN** the agent asks for level (and other missing slots) before presenting the confirmable plan

#### Scenario: Complete intent may skip questions

- **WHEN** the human provides profile, level, and direction in one message
- **THEN** the agent MAY proceed to a plan with zero or minimal clarifying questions

### Requirement: Structured plan and confirmation gate

The skill SHALL require a structured plan document before writes. For greenfield profile foundation the plan kind SHALL be `profile-pack` (compatible with bootstrap profile-pack schema). The agent MUST obtain explicit human confirmation before any Specra write operation (`profile create`, `skill add`, `skill link`, `cert create`, `question add`, `cert patch`, and equivalents).

#### Scenario: No writes before confirm

- **WHEN** the human has not confirmed the plan
- **THEN** the agent MUST NOT execute Specra write commands for that intent

#### Scenario: Plan edits re-confirm

- **WHEN** the human changes skills or requirements in the plan
- **THEN** the agent updates the plan and requests confirmation again

### Requirement: Execute via existing domain ops

After confirmation the skill SHALL instruct the agent to execute using existing Specra domain operations (and MCP equivalents), delegating greenfield profile foundation to the bootstrap profile-pack workflow. The agent MUST NOT hand-edit methodology YAML when a command exists.

#### Scenario: Greenfield delegates to profile-pack execution

- **WHEN** the confirmed plan kind is `profile-pack`
- **THEN** the agent follows the execute order of the bootstrap profile pack (profile → skills → cert → seed questions → verify → optional export)

### Requirement: Structured result handoff

After execute (or on abort), the skill SHALL require the agent to present a result summary to the human including at least: what was created or changed, coverage/gaps snapshot when a profile/level exists, and suggested next natural-language intents (not raw CLI flag recipes as the primary next step).

#### Scenario: Human sees outcome without CLI

- **WHEN** execution finishes for a profile-pack intent
- **THEN** the human-facing summary emphasizes created entities and coverage status, not a list of CLI flags to type next

### Requirement: Optional plan validation helper

If the repository ships `sdm intent validate-plan`, it SHALL accept plan JSON, validate it with Zod against the published plan schema(s), and emit `--json` with `ok` / error codes suitable for agents. The helper MUST NOT perform methodology writes.

#### Scenario: Invalid plan rejected

- **WHEN** an agent passes plan JSON missing required profile id to `intent validate-plan --json`
- **THEN** the command fails with a stable SdmError (or equivalent) and does not write YAML
