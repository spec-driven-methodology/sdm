## Why

End users (методологи без опыта разработки) must work like OpenSpec: describe intent in natural language («Хочу основу для Java Middle, backend»), answer clarifying questions, confirm a plan, and receive a result — without touching CLI flags. Today Specra has domain CLI/MCP and HITL packs, but the surface still reads as “run commands”; the clarify → plan → confirm → apply → result loop is incomplete. Domain entity is **Profile** (not Role) — see `rename-role-to-profile`.

## What Changes

- Formalize an **intent-driven agent loop**: intake → clarify → plan → confirm → execute → result handoff.
- Ship portable skill **`intent-loop`** that routes intents; CLI/MCP remain agent-only tool surface.
- Stable **plan** + **result** schemas (`--json`); plan kind for greenfield = **profile-pack** (delegates to `bootstrap-profile-pack` / current pack until renamed).
- Human docs: intent examples; CLI appendix for agents only.
- Optional `sdm intent validate-plan --json` (no writes).

## Non-goals

- HR testing UI / LMS / candidate analyze.
- Humans typing Specra flags as primary UX.
- Replacing OpenSpec for core development.
- New MCP hosts.
- Auto-apply without confirm.
- Keeping **Role** as a Specra domain term (retired by `rename-role-to-profile`).

## Capabilities

### New Capabilities

- `intent-loop`: OpenSpec-like clarify → plan → confirm → execute → result for methodology intents.

### Modified Capabilities

- `bootstrap-role-pack` / profile-pack: reachable from intent-loop; Profile terminology.
- `getting-started`: human path = agent + intent; CLI demoted to agent appendix.

## Impact

- `agents/intent-loop`, `AGENTS.md`, init `AGENTS.md` template
- Optional `@spec-driven-methodology/core` plan Zod + CLI `intent validate-plan`
- Docs/CHANGELOG; align with Profile rename before or in same release for CLI flag names
