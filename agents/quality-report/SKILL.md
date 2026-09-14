---
name: sdm-quality-report
description: >-
  Run SDM summary quality report (methodology or markdown corpus):
  verdict, ●○○ density matrix, glossary, optional save/diff.
  Use when the human asks to evaluate corpus/sources quality, pilot readiness,
  or compare quality before/after edits — not as a replacement for detailed audit.
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm`) on PATH or MCP `quality_report`.
metadata:
  author: sdm
  version: "0.9.0"
---

# Quality report (summary report)

Prefer `--json` or MCP `quality_report`. Human text defaults to Russian (`--locale ru` / `SDM_LOCALE`).

**SSOT** (single source of truth) for canon details remains `audit`; this skill is a **summary** for the human.

## When to use which mode

| Mode | Command | When |
|------|---------|------|
| Methodology | `quality report --profile … --level …` | Project exists; need ●○○ matrix by skill |
| Corpus | `quality report --sources <dir>` | Folder of `.md` (matrices/banks) before `init` / bootstrap |
| Diff | `--diff <reportId>` + usually `--save` | Compare «better/worse» after edits |

## Steps

1. **Corpus (raw material):**
   ```bash
   sdm quality report --sources ./sources --json --save
   ```
   Show the human: `verdict`, `score`, matrix (`symbol` ●●●…), `topActions`, glossary. Do not import the dump «as-is».

2. **HITL** — 3–5 clarifications (SSOT levels, one pilot profile, what to quarry/drop). Then [`../intent-loop/SKILL.md`](../intent-loop/SKILL.md) / bootstrap.

3. **Methodology (canon):**
   ```bash
   sdm quality report --profile <id> --level <id> --json --save
   ```

4. **Diff:**
   ```bash
   sdm quality report --profile <id> --level <id> --diff <previousId> --json --save
   ```

5. Detailed duplicates / ontology → [`../audit-methodology/SKILL.md`](../audit-methodology/SKILL.md). Next → [`../guide-suggest/SKILL.md`](../guide-suggest/SKILL.md).

## Matrix legend

`●●●` dense · `●●○` present with gaps · `●○○` thin · `○○○` almost none

## Guardrails

- CLI/MCP names stay English; explain terms (SSOT, HITL, quarry) for the human
- Do not hand-edit YAML when a SDM command exists
- Core corpus scan is heuristic only (no LLM inside SDM)
- MCP `save` defaults to true; CLI requires `--save`