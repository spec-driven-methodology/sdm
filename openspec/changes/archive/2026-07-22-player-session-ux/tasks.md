## 1. Load screen & picker

- [x] 1.1 Add RU session options block: автопереход, на время (+ override минут); persist in localStorage
- [x] 1.2 Try discover `exports/*.json` when not `file:`; render clickable list; keep drag-drop/file input
- [x] 1.3 Explicit «Начать» after load (options apply at start)

## 2. Auto-advance

- [x] 2.1 After Check, if enabled, schedule ~1000ms next; clear on nav/finish
- [x] 2.2 Default off; document in player README

## 3. Timed session

- [x] 3.1 Budget = N × 60s (or override minutes); countdown in run header
- [x] 3.2 On zero → finish (unanswered → skipped); banner «время вышло» in stats
- [x] 3.3 Finish always ends early; no pause in v1

## 4. Guardrails & docs

- [x] 4.1 Confirm no UI to pick N; README: объём через `export test` / `--adaptive`
- [x] 4.2 Note follow-up: audit/shuffle for correct-option position & length bias
- [x] 4.3 CHANGELOG; `player sync --force` smoke on my-methodology
