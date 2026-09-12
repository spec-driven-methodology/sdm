## 1. Scoped storage keys in player template

- [x] 1.1 In `packages/core/templates/methodology/player/app.js`, derive a stable scope from `location.pathname` (player directory / methodology path)
- [x] 1.2 Build scoped keys for `exportLibrary` and `selectedExportId` under `sdm.player.*`; leave session prefs on existing global keys
- [x] 1.3 Wire `loadLibraryFromStorage` / `persistLibrary` / `persistSelectedId` (and any remove paths) to use only scoped keys; do not auto-read legacy unscoped `sdm.player.exportLibrary`

## 2. Docs

- [x] 2.1 Note in player README that the library is scoped per project path / player instance (`file://` safe across dirs)
- [x] 2.2 Add `[Unreleased]` CHANGELOG entry (RU): isolation of loaded-tests library between methodology projects

## 3. Verify

- [x] 3.1 `sdm player sync --force` into two distinct methodology dirs (or workspace projects); confirm project B starts with empty library while A still restores after reload
- [x] 3.2 `npm run verify` in `specra/`
