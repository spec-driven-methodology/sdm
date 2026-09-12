---
name: sdm-audit-methodology
description: >-
  Run SDM methodology audit (ontology, lexical/semantic duplicates,
  optional coverage). Use when the human asks to audit quality or find
  unused skills / near-duplicate questions.
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm`) on PATH; run inside a methodology project.
metadata:
  author: sdm
  version: "0.4.0"
---

# Audit methodology quality

Read-only. Prefer `--json` or MCP tool `audit`.

For a **short human summary** (verdict, ●○○ matrix, glossary, save/diff, corpus folder) use [`../quality-report/SKILL.md`](../quality-report/SKILL.md) — audit stays the detailed live check (`sdm.audit/v1`).

## Steps

1. Confirm project: `sdm doctor`
2. Full audit (optional coverage target):
   ```bash
   sdm audit --profile <profile> --level <level> --json
   ```
3. Summarize ontology / library / coverage findings and recommendations for the human.
4. If `search.provider: lancedb`, rebuild index first for semantic duplicates:
   ```bash
   sdm index rebuild --json
   sdm audit --json
   ```
   Lexical duplicates always run; `library.semanticDuplicates` appears when the index exists.
5. Close gaps with `cert gaps` + `question add` / `question generate` as needed; re-run audit.

## Guardrails

- Do not hand-edit YAML when a SDM command exists
- Audit does not call an external LLM or download embedding models (offline PoC index)
