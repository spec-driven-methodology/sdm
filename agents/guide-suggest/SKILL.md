---
name: sdm-guide-suggest
description: >-
  After writes/generate or when the human asks «что дальше?», call SDM
  suggest for next actions + Russian levers (harden quality, stale content,
  gaps, export test/course, player, threshold). Prefer harden/validate/stale
  review over export when workItems, thin coverage, or basis mismatches remain.
  Do not answer with a raw MCP tool catalog.
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm suggest --json`) or MCP tool `suggest` and a methodology project.
metadata:
  author: sdm
  version: "0.7.2"
---

# Guide suggest (next-step coaching)

## When

- After successful `question generate` / `question validate` / `question add` / seed / similar writes
- Human asks «что дальше?», «что ещё можно?», «что предложишь?» without a concrete op
- Result handoff in [`../intent-loop/SKILL.md`](../intent-loop/SKILL.md)

Do **not** use this as a substitute for [`../explain-sdm/SKILL.md`](../explain-sdm/SKILL.md) (product identity → `about`).

## Steps

1. Call MCP `suggest` **or**:

   ```bash
   sdm suggest --profile <id> --level <id> --json
   ```

   Pass focus when known; if `SUGGEST_FOCUS_REQUIRED`, ask the human which profile/level.

2. Present **1–3** top `suggestions` as human actions (labels + why). Include a few `levers` (Russian phrases) when relevant:
   - Quality / gaps: «сводный отчёт качества», «отчёт по корпусу sources», «проверь черновик», «закрой topics», «включи строгий writeGate», «сгенерировать черновики», «по 5 на навык»
   - Export test: «без текстовых», «строже порог»
   - Export learning: «короткая инструкция», «конспект темы», «шпаргалка для обучаемого», «курс / модуль с занятиями», «только по пробелам покрытия»
   - Export kit: «шпаргалка для эксперта», «HTML для интервьюера», «как у коллег reference»

3. **Priority:** if `suggestions` include `harden-quality`, `review-stale-content`, or `close-gaps` / `generate-questions` (thin/missing, `workItems`, near-dup, basis mismatch) — offer those **before** primary `export-test` / `export-course`. Export MAY stay as a lower-priority preview. Do not push export as the main next step while quality/gaps/stale dominate the payload.

4. On human choice → hand off:
   - `quality-report` → [`../quality-report/SKILL.md`](../quality-report/SKILL.md) (`quality report --json`; summary ●○○; detailed → audit)
   - `harden-quality` → [`../generate-questions/SKILL.md`](../generate-questions/SKILL.md) and/or [`../audit-methodology/SKILL.md`](../audit-methodology/SKILL.md): `question validate` → rewrite → `question add`; optional `audit --json`; mention opt-in `quality.writeGate` / `coverageMode: blueprint` in `sdm.yaml`
   - `review-stale-content` → [`../close-staleness/SKILL.md`](../close-staleness/SKILL.md): `content stale --json` → HITL → rewrite/regenerate (wire `schemaVersion` ≠ content basis)
   - `close-gaps` / `generate-questions` → [`../close-coverage/SKILL.md`](../close-coverage/SKILL.md) or [`../generate-questions/SKILL.md`](../generate-questions/SKILL.md) (gaps/workItems → generate → **validate** → add)
   - `export-test` / re-export → [`../export-methodology/SKILL.md`](../export-methodology/SKILL.md) (+ confirm)
   - `export-course` → [`../export-course/SKILL.md`](../export-course/SKILL.md) (+ confirm; propose format howto|notes|cheatsheet|course + depth; `export learning`; not LMS)
   - `export-kit` → [`../export-kit/SKILL.md`](../export-kit/SKILL.md) (+ confirm; `export kit`; `format html` → write `exports/kit-*.html`; not learner cheatsheet)
   - `player-sync` / `try-player` → `sdm player sync --force` then open `player/index.html` (tabs Тесты|Курсы|Шпаргалки)
   - bootstrap → [`../intent-loop/SKILL.md`](../intent-loop/SKILL.md)

5. Writes still require confirmation (intent-loop / pack rules).

## Anti-patterns

- Answering with a list of MCP tool names
- Jumping to export while `harden-quality` / `close-gaps` are in the top suggestions
- Skipping `question validate` after generate when the human chose harden or close-gaps
- Mixing **threshold** (pass bar) with **depth/weight** or «больше вопросов»
- Mixing **export test** (assessment pack) with **export learning** (educational materials; alias `export course`) — different skills/schemas
- Mixing **export kit** (expert interview HTML from open/code probes) with **export learning --format cheatsheet** (learner prose)
- Treating SDM as LMS / auto-filling lesson prose without HITL
- Leaving `format`/`depth` ambiguous when the human asked for конспект vs курс vs инструкция
- Auto-export or auto-changing threshold without confirm
