## Why

Slice A shipped a static Studio that can only load fixtures/downloads — agents cannot push a live plan view or read confirm/reject from disk. Iterate on archived `methodology-studio` (slice B from `docs/goals-methodology-studio.md`): a thin local bridge so the loop is view → UI confirm → action file → agent CLI, without a cloud backend.

## What Changes

- Local bridge directory `.sdm/studio/` with `current-view.json` and `last-action.json` (ephemeral; gitignored).
- CLI for agents: `sdm studio push-view` (path or stdin), `sdm studio pull-action` (`--json`, optional consume/clear), `sdm studio serve [--port]` — serves `studio/` + HTTP bridge API only (no methodology writes).
- Studio UI: when opened via `studio serve`, poll/load bridge view and POST actions; keep file-picker + download fallback offline.
- Docs: CHANGELOG, README, AGENTS, studio README; about CLI list updated.
- Parent change: `openspec/changes/archive/2026-07-25-methodology-studio`.

## Non-goals

- MCP `studio_*` tools (later if needed).
- Export-form UI, coverage/пробелы UI (slices C/D).
- Cloud backend, auth, multi-user sync.
- Studio calling domain write commands (`skill add`, etc.) itself.
- Replacing chat/agent executor.

## Capabilities

### New Capabilities

- `studio-bridge`: file exchange under `.sdm/studio/`, push-view / pull-action / serve API, Studio client bridge mode.

### Modified Capabilities

- `methodology-studio`: UI MAY use local bridge when available; still display/dispatch only.
- `about-sdm`: capabilities.cli lists `studio push-view`, `studio pull-action`, `studio serve`.
- `studio-sync`: sync MUST NOT clear or modify `.sdm/studio/` bridge files.

## Impact

- `@spec-driven-methodology/core`: bridge I/O helpers + optional serve helper (or thin serve in CLI using core paths).
- `@spec-driven-methodology/cli`: three subcommands under `studio`.
- Template `studio/app.js` + README; init `.gitignore` for `.sdm/studio/`.
- Agent-first: `--json` on push/pull; serve is local-only convenience for the browser side of the same files.
