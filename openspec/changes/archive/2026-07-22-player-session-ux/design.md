## Context

Static player loads one `sdm.export.test/v1` file. Authors may have many exports; sessions are untimed; after check they manually press Next. Correct-option position/length bias is a library quality smell (audit/generate), not a reason to let the taker shrink N in the player.

## Goals / Non-Goals

**Goals:**

1. Comfortable export selection before start.
2. Optional auto-advance after check (~1000ms), cancelable by navigating.
3. Optional timed session: total budget from question count (or override), countdown, time-up → finish with unanswered → skipped, early finish allowed.
4. Keep RU chrome; session options on load screen.

**Non-Goals:**

- Per-question hard locks (only total budget in v1)
- Persist preferences beyond `sessionStorage` / `localStorage` optional remember
- Changing export schema for timer metadata in v1 (player-local defaults)
- Fixing option order bias in this change (document as follow-up for audit / export shuffle)

## Decisions

1. **Change name / scope bundle:** `player-session-ux` = picker + auto-next + timed mode (user asked for picker/auto-next OpenSpec and also sketched timing — one change).

2. **Picker**
   - Always: file input + drag-drop (existing).
   - Plus: if opened via http(s) and relative `../exports/` or `exports/` is listable — show buttons for `*.json` (fetch). On `file://` listing usually fails → hide list, keep picker only.
   - Alternative: embed manifest — rejected for v1.

3. **Auto-next**
   - Checkbox on load screen: «Автопереход после проверки».
   - After Check → show feedback → `setTimeout` 1000ms → next unanswered or finish on last.
   - Clear timer on Skip / manual Next / Prev / Finish.
   - Default **off**.

4. **Timed mode**
   - Checkbox: «Ограничить время».
   - Default budget: `questions.length * secondsPerQuestion` with `secondsPerQuestion = 60` (constant in player; documented). Optional number input to override total minutes.
   - Start timer when session enters first question (after load confirm / «Начать»).
   - UI: remaining `mm:ss` in run header; warn style under 10%.
   - On zero: `finish()` (unanswered → skipped); stats note «время вышло».
   - Early Finish always available.
   - Timer pauses? **No** in v1 (author preview simplicity).

5. **N questions**
   - Out of player. Author uses `export test --adaptive --per-skill M` (and future flags). Player never offers “do only 10 of 24”.

6. **Option-order bias (follow-up)**
   - Not implemented here. Recommend later: `audit` finding when `correct === 1` rate high or correct option length outlier; optional `export test --shuffle-options --seed` for consumers. Mention in CHANGELOG/docs as known methodology smell.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| file:// can't list exports | Graceful empty list |
| Auto-next too fast to read explanation | Default off; 1s delay |
| Default 60s/q too tight/loose | Editable total minutes when timed on |
| Authors confuse player timer with cert SLA | Copy: опция превью; не контракт сертификации |

## Migration Plan

`sdm player sync --force` after ship. No YAML migration.

## Open Questions

- Persist toggles in `localStorage`? **Yes, lightweight** (keys under `sdm.player.*`).
- Export-level `timeLimitSeconds` in schema later? Deferred.
