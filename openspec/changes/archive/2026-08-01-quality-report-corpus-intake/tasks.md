## 1. Core schemas and corpus scan

- [x] 1.1 Add density/matrix/glossary helpers and `sdm.quality.report/v1` + `sdm.corpus.manifest/v1` Zod types in `@spec-driven-methodology/core`
- [x] 1.2 Implement deterministic `scanCorpusSources` (md walk, classify, hashes, MCQ/stub signals)
- [x] 1.3 Implement `buildQualityReport` for methodology (via audit + coverage/gaps) and corpus modes
- [x] 1.4 Implement persist/load under `.sdm/reports/quality/` and `diffQualityReports`
- [x] 1.5 Add `formatQualityReportText` + locale resolver (`--locale` / `SDM_LOCALE` / default `ru`)
- [x] 1.6 Export APIs from `packages/core/src/index.ts`; gitignore `.sdm/reports/`; init may create reports dir

## 2. CLI, MCP, suggest, about

- [x] 2.1 Add CLI `quality report` with flags `--sources`, `--profile`, `--level`, `--diff`, `--save`, `--locale`, `--json`
- [x] 2.2 Register MCP `quality_report` (save default true) + ABOUT_CLI/MCP lists
- [x] 2.3 Add suggest lever for quality report; respect locale on suggest text when passed

## 3. Agents and docs

- [x] 3.1 Add `agents/quality-report/SKILL.md`; update AGENTS.md, agents/README, audit-methodology + guide-suggest handoffs
- [x] 3.2 Update README, GETTING_STARTED, CHANGELOG Unreleased

## 4. Tests and verify

- [x] 4.1 Unit tests: corpus fixtures, report schema, density symbols, diff, locale RU
- [x] 4.2 MCP tool list + quality_report happy path
- [x] 4.3 `npm run verify` green; smoke CLI on temp project / fixture corpus
