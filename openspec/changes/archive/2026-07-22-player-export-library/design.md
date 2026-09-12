## Context

Static player (`packages/core/templates/methodology/player/`) keeps a single in-memory `doc`. Upload / drag-drop / click from `exports/` all call `prepareLoadedDocument`, which replaces that reference. Session prefs already use `localStorage` (`sdm.player.*`); documents do not. Authors often keep several exports (levels, type filters) and need them after reload without re-picking files.

## Goals / Non-Goals

**Goals:**

1. Hold many validated export packages in a client-side library.
2. Persist library across page reloads via `localStorage`.
3. Select one package for «Начать»; remove entries from UI and storage.
4. Keep file picker / drag-drop / `exports/` list as **add** paths into the library.

**Non-Goals:**

- Session answer/progress persistence
- Cross-device sync or server storage
- Merging multiple exports into one run
- Changing export schema / CLI

## Decisions

1. **Storage model**
   - Key: `sdm.player.exportLibrary` → JSON array of entries.
   - Entry shape:
     - `id` — opaque string (uuid or `Date.now()` + random)
     - `name` — source filename or list label
     - `addedAt` — ISO timestamp
     - `document` — full parsed export object (`sdm.export.test/v1`)
   - Also persist `sdm.player.selectedExportId` for last selection (optional restore of ready state).
   - Alternative: one key per entry — rejected; single array is simpler to list/rewrite.

2. **Add vs replace**
   - Valid upload **appends** (or upserts by same `name` + identical document fingerprint — prefer **always append new id** to avoid surprise overwrite; if same filename re-uploaded, still new entry unless exact same `name` already exists → **replace that entry’s document** by name for less clutter).
   - Chosen: **upsert by `name`** (filename / exports label). Different names → multiple rows. Same name re-upload → update document in place, keep id.
   - Invalid JSON → error, library unchanged.

3. **UI**
   - Replace single ready-card-as-only-test with a **«Загруженные тесты»** list (library).
   - Each row: title (or name), meta line, **Выбрать** / click-to-select, **Удалить**.
   - Selected row drives «Начать» (existing ready-card or inline start on selected).
   - Keep dropzone; enable `multiple` on `<input type="file">` so several files can be added in one pick.
   - `exports/` discovery list remains separate («Файлы в exports/»); click adds/upserts into library then selects.

4. **QuotaExceeded**
   - Catch `setItem` failure; show RU error that storage is full; keep in-memory library for the session; suggest deleting entries. No compression in v1.

5. **Security / privacy**
   - Same author-preview boundary: answers live in JSON. README note: library is local to the browser origin; clear via Удалить or browser storage wipe.
   - No IndexedDB (localStorage matches existing prefs pattern).

6. **goHome / retake**
   - Returning home keeps library + selected id; «Начать» retakes selected package (current behavior extended to selection).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Large exports hit ~5MB localStorage | Clear error + delete; document limit |
| Stale corrupt storage JSON | Parse guard → reset library key, show soft warning |
| Confusion: exports/ list vs library | Distinct headings: disk discovery vs «Загруженные» |
| Upsert-by-name surprises if paths collide | Document: same filename replaces; different names keep both |

## Migration Plan

`sdm player sync --force` after ship. No methodology YAML migration. Empty library on first open after upgrade is fine.

## Open Questions

- None blocking: upsert-by-filename accepted as default.
