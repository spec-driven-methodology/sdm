## 1. Core filter

- [x] 1.1 Add type-filter helper in `@spec-driven-methodology/core` (parse include/exclude lists, `EXPORT_TYPE_INVALID`, `EXPORT_TYPE_FILTER_CONFLICT`)
- [x] 1.2 Apply filter in `assembleTestDocument` / `exportTest` after skill select + adaptive; set `meta.typeFilter`; recompute counts / `skillsMissingQuestions`
- [x] 1.3 Unit tests: exclude open, include single_choice, conflict, invalid type, empty-after-filter still ok

## 2. CLI + MCP

- [x] 2.1 CLI `export test --include-type` / `--exclude-type` (repeatable) + `--json`
- [x] 2.2 MCP `export_test` args `includeTypes` / `excludeTypes`; wire through `toolExportTest`
- [x] 2.3 MCP/CLI tests for filter success and conflict codes

## 3. Agent UX + docs

- [x] 3.1 Update `agents/export-methodology/SKILL.md`: NL→flags table (`текст`→`open`); forbid jq as primary path
- [x] 3.2 Update `agents/intent-loop/SKILL.md`: export intents with type prefs → export-methodology / `export_test` filter
- [x] 3.3 AGENTS.md / README one-liner; CHANGELOG `[Unreleased]`

## 4. Verify

- [x] 4.1 `npm run verify` in `specra/`
- [x] 4.2 Playground smoke: `export test … --exclude-type open --json` on `my-methodology` (or temp project with mixed types); confirm no `open` in document and old unfiltered export path still works
