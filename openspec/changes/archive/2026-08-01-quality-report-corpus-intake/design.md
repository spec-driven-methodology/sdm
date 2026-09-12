## Context

`sdm audit` (`sdm.audit/v1`) is a live, detailed methodology check. Foreign corpora are evaluated outside Specra. Competency owners need a **summary** report (RU text, ●○○ matrix, persist/diff) for corpus folders and for the canon, without breaking audit.

## Goals / Non-Goals

**Goals:**
- Sibling document `sdm.quality.report/v1` with methodology, corpus, and diff modes.
- Deterministic corpus scan → `sdm.corpus.manifest/v1` (no LLM in core).
- Persist under `.sdm/reports/quality/`; CLI `--save` explicit; MCP `save` default true.
- Human locale ru|en; English CLI/MCP ids and JSON keys.
- Agent surface: MCP + portable skill + suggest lever.

**Non-Goals:**
- Ingest propose/apply, materials CMS, external exam results, Russian command names, audit schema break.

## Decisions

1. **Sibling report, not audit v2** — Keep `runMethodologyAudit` intact; methodology mode reads audit + coverage/gaps and projects a summary matrix. Rationale: CI/agents already depend on `sdm.audit/v1`.

2. **Density enum → bullets** — Store `full|partial|thin|none`; render `●●●|●●○|●○○|○○○` in text and optional `symbol` field. Rationale: stable JSON + human legend from engineer-certification audit.

3. **Corpus heuristics only** — Classify by path/filename keywords and content signals (MCQ markers, stub length); topic rows from markdown headings. Rationale: core must not call LLMs; agents enrich later via ingest iterate.

4. **Save defaults** — CLI requires `--save`; MCP `save` defaults true. Rationale: agent loop wants persistence; CLI scripts stay opt-in.

5. **Locale resolution** — Explicit `--locale` > `SDM_LOCALE` > `ru` for quality report human text (methodology owners are RU-primary in this product). Suggest text respects same resolver when `--locale` passed.

6. **Reports gitignored** — Like cache/index/logs; reproducible from sources + YAML.

## Risks / Trade-offs

- [Heuristic misclassification] → Mitigation: status `unknown`, findings with codes, agent can rewrite manifest later.
- [Large corpora slow scan] → Mitigation: sync walk with size guards; no embeddings in v1.
- [Diff without prior save] → Mitigation: SdmError `QUALITY_REPORT_NOT_FOUND`.

## Migration Plan

Additive only. Existing projects gain optional `.sdm/reports/` on first save. No YAML migration.

## Open Questions

None for v1 — ingest apply deferred to `ingest-propose-apply` iterate.
