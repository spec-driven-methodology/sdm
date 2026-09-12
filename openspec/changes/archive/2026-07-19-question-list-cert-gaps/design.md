## Context

Coverage JSON already encodes missing/thin/ok. Agents need filtered gaps and question inventory without shell jq.

## Goals / Non-Goals

**Goals:** `listQuestions`, `runCertGaps`, CLI `--json`, tests, docs.

**Non-Goals:** Topic gaps, generate, MCP.

## Decisions

1. `cert gaps` = filter `runCertCoverage` skills where status is `missing` or `thin`; same exit code as coverage (`hasMissing`).
2. `question list` returns summary fields (id, skill, type, difficulty); optional `--skill`.
3. No schema changes.

## Risks / Trade-offs

- [Duplication with coverage] → thin wrapper; agents choose the right command

## Migration Plan

New commands only.

## Open Questions

- None.
