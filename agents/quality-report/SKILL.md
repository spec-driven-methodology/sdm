---
name: sdm-quality-report
description: >-
  Run SDM summary quality report (methodology or markdown corpus):
  Russian verdict, ●○○ density matrix, glossary, optional save/diff.
  Use when the human asks to evaluate corpus/sources quality, pilot readiness,
  or compare quality before/after edits — not as a replacement for detailed audit.
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm`) on PATH or MCP `quality_report`.
metadata:
  author: sdm
  version: "0.9.0"
---

# Quality report (сводный отчёт)

Prefer `--json` or MCP `quality_report`. Human text defaults to Russian (`--locale ru` / `SDM_LOCALE`).

**SSOT** (единый источник правды) для деталей канона по-прежнему `audit`; этот skill — **сводка** для человека.

## When to use which mode

| Mode | Command | When |
|------|---------|------|
| Methodology | `quality report --profile … --level …` | Проект уже есть; нужна матрица ●○○ по навыкам |
| Corpus | `quality report --sources <dir>` | Папка `.md` (матрицы/банки) до `init` / bootstrap |
| Diff | `--diff <reportId>` + обычно `--save` | Сравнить «стало лучше/хуже» после правок |

## Steps

1. **Corpus (сырьё):**
   ```bash
   sdm quality report --sources ./sources --json --save
   ```
   Покажите человеку: `verdict`, `score`, матрицу (`symbol` ●●●…), `topActions`, глоссарий. Не импортируйте dump «как есть».

2. **HITL** — 3–5 уточнений (SSOT уровней, один пилотный профиль, что quarry/drop). Затем [`../intent-loop/SKILL.md`](../intent-loop/SKILL.md) / bootstrap.

3. **Methodology (канон):**
   ```bash
   sdm quality report --profile <id> --level <id> --json --save
   ```

4. **Diff:**
   ```bash
   sdm quality report --profile <id> --level <id> --diff <previousId> --json --save
   ```

5. Детальные дубликаты / ontology → [`../audit-methodology/SKILL.md`](../audit-methodology/SKILL.md). Дальше → [`../guide-suggest/SKILL.md`](../guide-suggest/SKILL.md).

## Matrix legend

`●●●` плотное · `●●○` есть с дырами · `●○○` тонко · `○○○` почти нет

## Guardrails

- CLI/MCP names stay English; explain terms (SSOT, HITL, quarry) in Russian for the human
- Do not hand-edit YAML when a SDM command exists
- Core corpus scan is heuristic only (no LLM inside SDM)
- MCP `save` defaults to true; CLI requires `--save`
