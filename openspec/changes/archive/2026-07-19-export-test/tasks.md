## 1. Core export assemblers

- [x] 1.1 Add `exportTest` / `exportMatrix` in `@spec-driven-methodology/core` (load role/level/questions; assemble versioned documents; CSV serializers; `EXPORT_FORMAT_INVALID`)
- [x] 1.2 Export public API from `packages/core/src/index.ts`
- [x] 1.3 Unit tests: test package sorting + missing-skills meta; matrix cells; invalid format

## 2. CLI + MCP

- [x] 2.1 CLI `export test` / `export matrix` with `--format` and `--json` envelope (raw document by default)
- [x] 2.2 MCP tools `export_test`, `export_matrix`
- [x] 2.3 Portable skill `agents/export-methodology/` + AGENTS.md pointer

## 3. Docs and verify

- [x] 3.1 CHANGELOG `[Unreleased]` (move off «Запланировано»); README command table
- [x] 3.2 `npm run verify`
- [x] 3.3 Playground smoke: `export test --role java-developer --level middle --json` and `export matrix --role java-developer --format json --json`
