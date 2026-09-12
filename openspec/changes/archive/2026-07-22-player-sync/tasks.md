## 1. Core sync

- [x] 1.1 Extract or add `syncPlayerAssets(projectRoot, { force })` in `@spec-driven-methodology/core` (reuse copyTreeDeep; fail if template missing)
- [x] 1.2 Unit test: sync creates player; without force skips; with force overwrites player file only

## 2. CLI / MCP

- [x] 2.1 Add `sdm player sync [--force] [--json]`
- [x] 2.2 Add MCP tool `player_sync` (optional project arg)
- [x] 2.3 Smoke on temp project + on existing-style project without player

## 3. Docs

- [x] 3.1 CHANGELOG, README, AGENTS, player README: `player sync` / `--force`
- [x] 3.2 `npm run verify`
