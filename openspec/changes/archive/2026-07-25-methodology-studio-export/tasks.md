## 1. Serve mounts

- [x] 1.1 Extend `startStudioServe` to serve `/player/*` and `/exports/*` read-only with path safety
- [x] 1.2 Tests: GET `/player/index.html` 200; POST action still only touches `.sdm/studio/`

## 2. Studio UI export-form + handoff

- [x] 2.1 Render `export-form` phase (multi/boolean/number/text from JSON); button **Экспортировать тест** → `export_test` action (+ bridge POST)
- [x] 2.2 **Открыть Player** handoff (`/player/` under serve, else `../player/index.html`); hint about `exports/`
- [x] 2.3 Extend `fixtures/demo-view.json` with export-form; update studio README

## 3. Docs + verify

- [x] 3.1 CHANGELOG / README / AGENTS note (action → agent `export test` mapping)
- [x] 3.2 `npm run verify` + smoke serve `/player/` + emit path documented
