## ADDED Requirements

### Requirement: Result handoff may use suggest for next steps

After a successful execute phase that creates or updates questions (or when the human’s only follow-up is «что дальше?» / what next without a new concrete intent), the `intent-loop` skill SHALL instruct the agent to call `suggest` / `sdm suggest --json` (when available) and present 1–3 suggested actions with levers to the human. The agent MUST NOT use a raw MCP tool catalog as the primary next-step answer. Selecting a suggestion SHOULD continue via confirm + domain ops or the appropriate portable skill.

#### Scenario: After seed questions offer suggest menu

- **WHEN** profile-pack (or similar) execute finishes seeding questions successfully
- **THEN** the human-facing result includes next actions derived from suggest (e.g. export test, player) rather than only a list of MCP tool names

#### Scenario: Ambiguous what-next uses suggest

- **WHEN** the human asks «что дальше?» without naming export, gaps, or another concrete op
- **THEN** the agent calls suggest before proposing next work
