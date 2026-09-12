## Context

Static author-preview player (`packages/core/templates/methodology/player/app.js`) persists the multi-export library under fixed keys:

- `sdm.player.exportLibrary`
- `sdm.player.selectedExportId`

Session prefs reuse the same `sdm.player.*` namespace. Spec `player-export-library` requires that stable namespace but does not isolate per methodology directory. Authors often open several `…/<project>/player/index.html` via `file://` (or share one browser origin); the first open of a new project then shows another project's library.

Stakeholders: methodology authors and agents using `sdm init` / `player sync` + open player. No YAML/Zod/CLI contract change.

## Goals / Non-Goals

**Goals:**

1. Library + selected-id persistence isolated so project A never reads project B's entries.
2. Reload within the same player URL/path still restores that project's library.
3. Minimal template-only fix; prefs stay global.
4. New/empty project starts with empty library (no silent legacy bleed).

**Non-Goals:**

- IndexedDB / server storage
- Per-project session prefs
- Auto-migrate unscoped library into every new scope
- CLI stamp of project id at `init`/`player sync` (v1)
- Changing export schema or MCP surface

## Decisions

1. **Scope derivation: player directory path (no CLI stamp)**
   - Compute a stable scope string from `location.pathname` (strip trailing `/player/index.html` or `/player/`), then a short hash or sanitized token for the key suffix.
   - Keys: `sdm.player.lib.<scope>.exportLibrary` and `sdm.player.lib.<scope>.selectedExportId` (exact prefix may vary; must be unique per scope and under `sdm.player.*`).
   - Prefs keep existing global keys (`sdm.player.autoNext`, etc.).
   - **Why not stamp at sync?** Path scope works for `file://` without touching `player sync` / init templates beyond `app.js`. Stamp can be a later hardening if http://same-host serves multiple projects under one pathname pattern.
   - **Why not only `location.href`?** Query/hash noise; directory of the player is the methodology identity that matters.

2. **No automatic legacy migration**
   - Do not read unscoped `sdm.player.exportLibrary` into a new scoped key.
   - Old keys may remain orphaned until the user clears site data; acceptable for PoC author-preview.
   - After upgrade + sync, each project rebuilds its library via upload / `exports/` click as before.
   - **Alternative rejected:** one-time “claim” of legacy library by the first project that opens — recreates cross-project bleed for the second project.

3. **Implementation surface**
   - Only template `app.js` (+ short README/CHANGELOG notes).
   - Centralize key builders (`storageKey(name)` / `LIBRARY_KEYS`) so load/persist/remove all use the same scope.
   - No new dependencies; still `localStorage` + JSON array entry shape unchanged.

4. **Agent-first**
   - No new CLI flags. Agents keep `sdm player sync --force` then open `player/index.html`. Isolation is transparent once the template is synced.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Same http origin + identical pathname for different projects | Rare for author-preview; document `file://` or distinct paths; stamp later if needed |
| Moving/renaming project directory → empty library | Expected; same as new identity; re-add exports |
| Orphaned legacy keys use quota | Document clear storage; optional later cleanup of unscoped keys only |
| Authors expect prefs + library both scoped | Prefs stay global by design; call out in README |

## Migration Plan

1. Ship template change in Specra.
2. Users/agents: `sdm player sync --force` in each methodology project.
3. Per-project library starts empty; re-load exports as needed.
4. Rollback: sync previous template; unscoped keys may still hold old data if never cleared.

## Open Questions

- None blocking for v1. Optional follow-up: `data-project-scope` attribute stamped by `player sync` for exotic hosting.
