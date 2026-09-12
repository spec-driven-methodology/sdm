## 1. Player UI + prefs

- [x] 1.1 Add RU checkbox «Перетасовывать вопросы» to session options in `packages/core/templates/methodology/player/index.html`
- [x] 1.2 Wire `localStorage` key `sdm.player.shuffleQuestions` (load/save with other prefs) in `app.js`

## 2. Session shuffle logic

- [x] 2.1 Introduce session-local question list; Fisher–Yates shuffle at `startSession()` when option on; keep `doc` unmutated
- [x] 2.2 Point run/check/skip/stats paths at the session list (same set/count; grading unchanged)
- [x] 2.3 Confirm goHome → **Начать** reshuffles when option enabled; off keeps export order

## 3. Docs + verify

- [x] 3.1 Update player README (option + note that options-shuffle is follow-up)
- [x] 3.2 CHANGELOG `[Unreleased]` entry (RU)
- [x] 3.3 Smoke: open player, toggle on/off, start twice; optional `sdm player sync --force` into a methodology dir
