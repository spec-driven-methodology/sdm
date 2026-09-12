## Why

After questions are generated, agents often stop or dump the MCP tool catalog. Humans miss the natural next steps: export a test pack, try the author `player/`, or tighten threshold / question count / types. We need a deterministic **state → next actions + Russian levers** surface so agents coach the workflow instead of listing APIs. Complements `about` (identity) and `intent-loop` (execute chosen intent)—does not replace them.

## What Changes

- Add `@spec-driven-methodology/core` suggest assembler + CLI `sdm suggest [--profile] [--level] [--json]` and MCP `suggest` (methodology project required; optional profile/level focus).
- Return 1–5 human-facing suggestions: `id`, `label`, `why`, skill/command hint, `levers[]` (Russian `phrase` + `mapsTo`), `requiresConfirm` when writes follow.
- Priority rules focused on post-questions → export → player → levers (threshold vs volume vs types kept distinct; depth/weight not conflated with pass threshold).
- Portable skill + `AGENTS.md` / `intent-loop` routing: after successful write/generate, or on «что дальше?», call `suggest` and offer 1–3 actions—never a raw MCP catalog.
- CHANGELOG `[Unreleased]` (no semver bump for this change alone).

## Non-goals

- Conversational tutor / TTY wizard inside the core.
- Replacing `intent-loop`, `about`, or `doctor`.
- Auto-apply without human confirm.
- Listing all MCP tools as “suggestions”.
- LMS / candidate analytics / secure exam runner.
- Version bump solely for this feature.

## Capabilities

### New Capabilities

- `guide-suggest`: State-driven next-step suggestions + levers; CLI/MCP contract; agent skill/AGENTS routing for post-write and «что дальше?» coaching.

### Modified Capabilities

- `mcp-server`: Expose tool `suggest` with the same JSON payload as CLI `--json`.
- `intent-loop`: After successful execute (especially generate/add), or when intent is only «what next», route through `suggest` before inventing next steps.

## Impact

- Agent-first: domain op with `--json` / MCP JSON; agents propose actions humans understand.
- `@spec-driven-methodology/core` suggest module (reuse coverage/gaps/export/player detection); thin CLI + MCP + tests.
- `agents/guide-suggest/`, `AGENTS.md`, brief notes in `intent-loop` / export-methodology; README + CHANGELOG.
- No new methodology YAML schema; read-only over existing project state.
