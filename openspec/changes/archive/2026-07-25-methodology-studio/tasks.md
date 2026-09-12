## 1. Studio template (static UI)

- [x] 1.1 Add `packages/core/templates/methodology/studio/` with `index.html`, `styles.css` (forked from player look), `app.js`, `README.md`
- [x] 1.2 Ship `fixtures/demo-view.json` (`sdm.studio.view/v1`) with dynamic clarifications + embedded plan
- [x] 1.3 Implement load/render: clarifications from options, plan review, **Подтвердить план** / **Отклонить**; emit `sdm.studio.action/v1` (download + on-page JSON); reject bad schemaVersion

## 2. Core sync + init

- [x] 2.1 Add `studio-sync.ts` (`syncStudioAssets`, `copyStudioTemplateInto`) mirroring player-sync; export from `@spec-driven-methodology/core`
- [x] 2.2 Wire `initMethodologyProject` to seed `studio/`; update generated project README layout (`studio/` + `player/`)
- [x] 2.3 Add `packages/core/test/studio-sync.test.ts` (create / skip / force / NOT_A_PROJECT)

## 3. CLI + about

- [x] 3.1 Add `sdm studio sync [--force] [--json]` in `@spec-driven-methodology/cli` (same shape as player sync)
- [x] 3.2 Add `studio sync` to `ABOUT_CLI_COMMANDS`; extend about tests if present

## 4. Docs + verify

- [x] 4.1 CHANGELOG `[Unreleased]`, root README command table, AGENTS.md note; `openspec/config.yaml` baseline when archiving
- [x] 4.2 `npm run verify`; smoke: temp/playground `studio sync --json` + confirm `studio/index.html` exists
