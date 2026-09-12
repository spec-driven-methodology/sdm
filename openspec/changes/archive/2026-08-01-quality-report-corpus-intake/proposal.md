## Why

Foreign corpora (competency matrices, question banks, program docs) are audited outside Specra in ad-hoc markdown. Competency owners need a machine-readable **summary** quality report (verdict, ●○○ matrix, glossary, persist/diff) for both raw sources and the methodology canon — without replacing live `audit` or turning Specra into an LMS.

## What Changes

- Add `sdm quality report` and MCP `quality_report` with modes `methodology` | `corpus` | `diff`.
- Schema `sdm.quality.report/v1`: Russian human summary, score 1–5, readiness, density matrix ●○○, topActions, glossary, entityScores, findings; optional persist under `.sdm/reports/quality/`.
- Corpus scan: folder of `.md` → `sdm.corpus.manifest/v1` + deterministic heuristics (no LLM in core).
- Locale for human text: `--locale ru|en` / `SDM_LOCALE` (JSON keys and CLI/MCP names stay English).
- Portable skill `agents/quality-report/`; suggest lever; docs/CHANGELOG/ABOUT sync.
- Keep `sdm.audit/v1` unchanged (report is a sibling artifact).

## Capabilities

### New Capabilities
- `quality-report`: summary quality report for methodology and corpus, persist/diff, RU presentation.
- `corpus-manifest`: scan markdown sources into a corpus manifest with classification heuristics.

### Modified Capabilities
- `mcp-server`: register MCP tool `quality_report`.
- `guide-suggest`: suggest lever pointing at `quality report`.
- `about-sdm`: list new CLI/MCP capability.
- `getting-started`: mention quality report in agent workflow.
- `methodology-audit`: clarify that quality report complements audit (no breaking audit schema).

## Impact

`@spec-driven-methodology/core` report/scan modules; thin CLI; MCP registration; tests; `agents/`; README/AGENTS/CHANGELOG; `.gitignore` for `.sdm/reports/`. Agent-first: `--json`, SdmError codes, MCP parity.

## Non-goals

No full ingest propose/apply, levelMap apply, materials CMS, external assessment import, LMS/HR candidate UI, Russian CLI command names, or breaking changes to `sdm.audit/v1`.
