## Why

Studio CLI (sync / push-view / push-coverage / pull-action) shipped in A–D, but MCP parity is missing for agent hosts. Suggest still says «дыры» while Studio standardized on **пробел** / **не покрыто** / **слабо покрыто**. Polish after archived studio slices.

## What Changes

- MCP tools: `studio_sync`, `studio_push_view`, `studio_push_coverage`, `studio_pull_action` (parity with CLI; `--json`-shaped results). **Not** `studio_serve` (long-running localhost process stays CLI-only).
- ABOUT_MCP_TOOLS + mcp TOOL_NAMES / tests / openspec mcp-server delta.
- Suggest Russian copy: «дыры» → «пробелы» (labels/levers); align `guide-suggest` and user-facing README/AGENTS/close-coverage phrases that say «дыры».
- CHANGELOG note.

## Non-goals

- MCP tool that starts/stops `studio serve`.
- New Studio UI features.
- Renaming skill folder `close-coverage` or English API ids (`close-gaps`).

## Capabilities

### New Capabilities

- (none) — extends existing MCP + suggest surfaces.

### Modified Capabilities

- `mcp-server`: add studio_* tools (except serve).
- `about-sdm`: about MCP list includes studio tools.
- `guide-suggest`: Russian levers/docs without «дыра» where user-facing.

## Impact

- `@spec-driven-methodology/mcp` handlers; `@spec-driven-methodology/core` suggest.ts; ABOUT_MCP; agents/README/AGENTS/guide-suggest; CHANGELOG.
- Agent-first: hosts can drive Studio bridge without shelling out to every studio CLI flag.
