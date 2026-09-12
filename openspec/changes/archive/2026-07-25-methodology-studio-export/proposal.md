## Why

After Studio scaffold (A) and bridge (B), authors still cannot set export-test parameters visually or jump to Player preview. Slice C from `docs/goals-methodology-studio.md`: dynamic export form in Studio + handoff to `player/`, without Studio running `export test` itself.

## What Changes

- View phase `kind: "export-form"`: fields/options come from the view JSON (question types, adaptive, per-skill, seed, shuffle-options, etc.) — not hardcoded enums in Studio JS beyond rendering widgets.
- Action `export_test` with selected `values` for the external executor (agent runs `sdm export test …`).
- Studio UI: render export-form, emit action; Russian labels; link **Открыть Player**.
- `studio serve`: also serve `<project>/player/` at `/player/` and `<project>/exports/` at `/exports/` (read-only static) for preview handoff.
- Demo fixture + README/CHANGELOG/AGENTS; parent changes `methodology-studio` + `methodology-studio-bridge`.

## Non-goals

- Studio calling `export test` or writing `exports/*.json` itself.
- Coverage/пробелы UI (slice D).
- MCP tools; learning-export form (can reuse pattern later).
- Candidate exam UI / LMS.

## Capabilities

### New Capabilities

- `studio-export-form`: export-form phase + `export_test` action + player/exports static handoff via serve.

### Modified Capabilities

- `methodology-studio`: support export-form phase and player handoff chrome.
- `studio-bridge`: serve mounts `/player/` and `/exports/` read-only beside `/bridge/*`.

## Impact

- Template `studio/` HTML/JS/CSS/fixture/README.
- `@spec-driven-methodology/core` `startStudioServe` static mounts; tests.
- Docs: CHANGELOG, README, AGENTS.
- Agent-first: executor still CLI; Studio only emits `export_test` params.
