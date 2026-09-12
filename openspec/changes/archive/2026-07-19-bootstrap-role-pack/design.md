## Context

Agent-first Specra: human intent → agent → CLI/MCP. Pack = skill that enforces HITL before writes.

## Goals / Non-Goals

**Goals:** One skill documenting plan schema, confirm gate, execute order, verify, optional export.

**Non-Goals:** Core pack runner CLI in this change; auto-confirm.

## Decisions

1. **Skill-only orchestration** — agent builds plan (LLM + user hints); Specra remains command surface.
2. **Single HITL gate** — show full plan; no writes until user explicitly confirms (да / confirm / apply plan). Edits to plan allowed before confirm.
3. **Plan JSON schema** (agent-facing contract in SKILL.md):
   - `role`, `level`, `skills[]`, `links[]?`, `requirements[]`, `questionsPerSkill` (default 3 for junior-friendly thin→ok path), `difficultyMin/Max`, `exportTest?: boolean`
4. **Execute order:** doctor → skill add(+link) → cert create → per skill: generate → fill → add × N → gaps/coverage → optional export test.
5. **Relation to bootstrap-methodology:** pack = preferred for “create foundation for role X”; bootstrap-methodology remains low-level loop without HITL plan; close-coverage after pack if still thin.

## Risks

- [Agent skips confirm] → skill MUST state hard stop; docs emphasize.
- [Weak LLM questions] → human can iterate with generate-questions / close-coverage after pack.
