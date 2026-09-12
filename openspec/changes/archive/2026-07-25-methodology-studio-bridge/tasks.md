## 1. Core bridge I/O

- [x] 1.1 Add `studio-bridge.ts`: paths, `pushStudioView`, `pullStudioAction` (+ consume), light view/action schemaVersion checks, SdmError codes
- [x] 1.2 Export from `@spec-driven-methodology/core`; unit tests for push/pull/consume/invalid/NOT_A_PROJECT
- [x] 1.3 Init `.gitignore` includes `.sdm/studio/`

## 2. CLI serve + commands

- [x] 2.1 `sdm studio push-view [file|-] [--json]`
- [x] 2.2 `sdm studio pull-action [--json] [--consume]`
- [x] 2.3 `sdm studio serve [--port]` on `127.0.0.1` — static `studio/` + `/bridge/*` (status, view, action); no methodology writes
- [x] 2.4 ABOUT_CLI_COMMANDS + sync test that force sync preserves bridge files

## 3. Studio UI + docs

- [x] 3.1 Update `studio/app.js` + `index.html`: bridge detect, load from bridge, POST on emit; keep offline fallbacks
- [x] 3.2 README (studio + root/AGENTS/CHANGELOG); `studio sync --force` note for existing projects
- [x] 3.3 `npm run verify`; smoke: push-view → serve/POST or UI path → pull-action --consume
