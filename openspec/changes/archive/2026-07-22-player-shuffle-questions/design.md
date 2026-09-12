## Context

Static player (`packages/core/templates/methodology/player/`) already has session options on the load screen: auto-advance and timed mode, persisted under `sdm.player.*` in `localStorage`. Questions are presented in export JSON order. Retake via brand → **Начать** repeats that order. Option-order bias remains a separate methodology concern (audit / `export test --shuffle-options`).

## Goals / Non-Goals

**Goals:**

1. Opt-in shuffle of **question order** for a session when the author presses **Начать**.
2. Preference remembered like other session toggles; default off (stable order for methodology review).
3. Source export document unchanged on disk / in memory for metadata; session works on a permuted copy.
4. Ship via player template + `player sync --force`.

**Non-Goals:**

- Shuffle of **answer options** inside a question
- Deterministic seed UI / reproducible shuffle for CI
- Changing `sdm.export.test/v1` schema
- Choosing N / resampling questions

## Decisions

1. **UI: checkbox, not always-on**
   - Label (RU): «Перетасовывать вопросы».
   - Default **off** — authors reviewing a package expect export order.
   - Alternative considered: always shuffle on load — rejected (hurts methodology review).

2. **When to shuffle**
   - At `startSession()`, after reading prefs, before allocating `outcomes` / `answers`.
   - Not on file load — ready card still describes the same package; each **Начать** (including retake) re-shuffles if enabled.
   - Alternative: shuffle on load — rejected (retake after goHome would need re-shuffle anyway; start is the session boundary).

3. **Data model**
   - Keep `doc` as the loaded parse result (title/meta/requirements unchanged).
   - Introduce session-local `questions` array: either `[...doc.questions]` or shuffled copy.
   - All run/stats paths index into `questions` (or temporarily replace `doc.questions` for the session and restore on goHome — prefer explicit `sessionQuestions` to avoid mutating `doc`).
   - Correctness of grading unchanged (options/`correct` stay on each question object).

4. **Algorithm**
   - Fisher–Yates with `Math.random()` — fine for author preview; no seed control in v1.

5. **Persistence**
   - `localStorage` key `sdm.player.shuffleQuestions` (`"1"` / `"0"`), same pattern as `autoNext` / `timed`.

6. **Options shuffle (deferred)**
   - Out of this change. Document as follow-up: player checkbox and/or `export test --shuffle-options --seed` + audit findings for position/length bias.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Accidental mutate of `doc.questions` breaks retake meta | Session copy only; never write back into export file |
| Shuffle + Prev/Next confusion | Same UX as today; only order differs |
| Tiny packs look “unchanged” after shuffle | Acceptable; N≥2 still may permute |
| Authors expect option shuffle too | Non-goal; note in README follow-up |

## Migration Plan

1. Update template under `packages/core/templates/methodology/player/`.
2. Authors: `sdm player sync --force`.
3. Rollback: re-sync previous template or uncheck option (default off).

## Open Questions

- None blocking. Seeded shuffle deferred if ever needed for demos.
