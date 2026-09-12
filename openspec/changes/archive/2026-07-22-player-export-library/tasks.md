## 1. Library data layer

- [x] 1.1 Add `STORAGE_KEYS.exportLibrary` / `selectedExportId` and helpers: load/save library array, QuotaExceeded error, corrupt-JSON reset
- [x] 1.2 Replace single-`doc` prepare path with `upsertLibraryEntry({ name, document })`, `selectEntry(id)`, `removeEntry(id)`; wire `doc` from selection
- [x] 1.3 On boot: hydrate library from localStorage and restore selection when present

## 2. Load-screen UI

- [x] 2.1 HTML/CSS: «Загруженные тесты» list with select + delete; keep dropzone; set file input `multiple`
- [x] 2.2 Render library rows (title/name, meta); highlight selected; enable «Начать» only when selection exists
- [x] 2.3 File picker / drag-drop / `exports/` click → parse → upsert → select → persist; invalid file leaves library intact

## 3. Session flow glue

- [x] 3.1 `startSession` / `goHome` use selected library entry; retake does not clear library
- [x] 3.2 Deleting selected entry clears selection and hides start until another pick

## 4. Docs and verify

- [x] 4.1 Update player README (library + localStorage + delete); CHANGELOG `[Unreleased]`
- [x] 4.2 Manual smoke: load 2 JSON → reload → both present → delete one → gone after reload; `player sync` path noted for existing projects
