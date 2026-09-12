## Why

Author-preview player persists the export library under global `localStorage` keys (`sdm.player.exportLibrary`). On `file://` (and any shared origin) a freshly inited methodology project shows another project's loaded tests on first open — wrong library for that tree. Authors/agents often keep several methodology dirs on one machine; isolation is required now that multi-export library shipped.

## What Changes

- Scope library persistence keys (`exportLibrary`, `selectedExportId`) per player instance / project path so project A never reads project B's library.
- Keep session prefs (`autoNext`, shuffle, timed, minutes) on the existing global `sdm.player.*` keys (shared UX prefs are fine).
- Do **not** auto-migrate legacy unscoped library into a new project's scoped keys (new project starts empty).
- Document briefly in player README / CHANGELOG; refresh via `sdm player sync --force`.

## Non-goals

- IndexedDB, server sync, or cross-device library
- Scoping session prefs per project
- Auto-import of legacy `sdm.player.exportLibrary` into every new project
- CLI/MCP surface changes (no new commands; agent path remains `player sync` + open `index.html`)
- Candidate-facing test runner product expansion

## Capabilities

### New Capabilities

<!-- none — behavior change to existing player library persistence -->

### Modified Capabilities

- `player-export-library`: library and selected-id persistence MUST be project-scoped; opening player in project B MUST NOT list entries persisted by project A; reload within the same project still restores that project's library.

## Impact

- Code: `packages/core/templates/methodology/player/app.js` (key derivation + load/persist)
- Docs: player README note, `CHANGELOG.md` under Unreleased
- Ops: existing projects need `sdm player sync --force` to pick up the template
- Agent-first: no new flags; `player sync` / open player remains the domain path; isolation removes a confusing false-positive library when agents init a new methodology dir
