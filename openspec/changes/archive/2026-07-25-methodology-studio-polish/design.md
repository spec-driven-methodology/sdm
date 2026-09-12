## Context

Studio CLI exists; MCP has `player_sync` pattern. Suggest embeds Russian «дыры».

## Goals / Non-Goals

**Goals:** MCP studio_* (sync, push_view, push_coverage, pull_action); suggest/docs wording → пробел.

**Non-Goals:** studio_serve MCP; UI changes.

## Decisions

1. **Tool set** mirrors CLI non-daemon commands; args use `project` like other tools.
2. **`studio_push_view`:** required `viewJson` string (or accept object via JSON.stringify in handler if zod object — prefer string for MCP text safety).
3. **`studio_pull_action`:** optional `consume` boolean.
4. **Suggest:** replace user-visible «дыр*» with «пробел*» in phrase/label strings only.
5. **Docs chase:** guide-suggest SKILL, README table lines, agents/close-coverage one-liner, AGENTS if needed.

## Risks

- [Agents still say «дыра» in chat] → product strings fixed; humans may still use colloquial speech.
