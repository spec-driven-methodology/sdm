## 1. Parse and library bucketing

- [x] 1.1 Split parse into test vs course validators; route by `schemaVersion` with clear RU error for unsupported versions
- [x] 1.2 Add course library state + distinct scoped localStorage key; keep test library behavior
- [x] 1.3 Classify `exports/` discovery by schema and add into the matching library (auto-switch tab when needed)

## 2. Home tabs UI

- [x] 2.1 Add Тесты | Курсы tabs on load screen in `index.html` / CSS
- [x] 2.2 Filter library list and hide test session options on Курсы tab

## 3. Course reader

- [x] 3.1 Add `course-view` markup (outline + lesson pane + prev/next + meta/warnings)
- [x] 3.2 Flatten modules→lessons; implement open/nav/render with empty-body stub
- [x] 3.3 Add lightweight escape-first markdown renderer for lesson bodies

## 4. Practice handoff

- [x] 4.1 List `practiceQuestionIds` for module/course in reader
- [x] 4.2 Resolve ids against loaded test packs; start filtered test session when intersection non-empty

## 5. Docs and verify

- [x] 5.1 Update player README for course mode + practice handoff
- [x] 5.2 Add CHANGELOG `[Unreleased]` entry
- [x] 5.3 Smoke: load course JSON, page lessons, practice with paired test pack; confirm tests tab still works
