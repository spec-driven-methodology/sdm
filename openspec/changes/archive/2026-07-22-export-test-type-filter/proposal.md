## Why

Methodologists need exports with a subset of question types (e.g. «без текстовых» → no `open`) without shell/`jq` post-processing. Specra is agent-first: the human states intent; the agent must call a first-class CLI/MCP contract. Today `export test` always packs every matching library question by skill — type mix in the library cannot be narrowed at export time.

## What Changes

- Add **type filter** to `export test` / MCP `export_test`: allowlist and/or denylist of domain types (`single_choice`, `multi_choice`, `open`, `code`).
- Default unchanged: no filter → all types (backward compatible).
- Export `meta` records the applied filter so consumers/agents see what was requested.
- Portable skills (`export-methodology`, `intent-loop`) map NL («без текста», «только выбор») to those flags — humans do not type flags.
- Stable SdmError codes for invalid type names / conflicting include+exclude.

## Capabilities

### New Capabilities

- _(none — filter is part of export-test surface)_

### Modified Capabilities

- `export-test`: type include/exclude on assemble; meta; `--json` envelope
- `mcp-server`: `export_test` args for the same filter
- `intent-loop`: route export intents that mention question-type preferences
- _(skill docs)_ `export-methodology` portable skill documents the flags and NL→flag mapping

## Impact

- `@spec-driven-methodology/core` `exportTest` / `assembleTestDocument`
- `@spec-driven-methodology/cli` `export test` options; `@spec-driven-methodology/mcp` tool schema
- Agents: `agents/export-methodology/`, `agents/intent-loop/`; AGENTS.md / CHANGELOG / README
- Agent-first: domain op + `--json`; human path remains NL intent only

## Non-goals

- Teaching users to pipe through `jq` or hand-edit export JSON
- Deleting `open` questions from the library (filter is export-time only)
- New LMS types (matching/sorting) or changing schemaVersion of export
- Filtering by topic/difficulty in this change (may reuse patterns later)
- **BREAKING** default behavior change (omit filter = current “all types”)
