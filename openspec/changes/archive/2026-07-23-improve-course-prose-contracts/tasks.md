## 1. Schema and stub builder

- [x] 1.1 Extend Zod/`sdm.export.course/v1` with optional `modules[].kind` (`overview`|`skill`), document `glossary[]`, lesson `footnotes[]`
- [x] 1.2 For `format=course` + profile/level, prepend overview module with stubs: about / how-it-works / audience / out-of-scope
- [x] 1.3 Optionally seed `glossary` term candidates from scoped skill topics (empty definitions OK in plan-only)
- [x] 1.4 Unit tests: overview present for level course; absent for `--skill`; old packs without `kind` still validate

## 2. Agent prose contracts

- [x] 2.1 Update `agents/export-course/SKILL.md`: course ≠ howto skeleton; definition-first lessons; content-specific H2; no «Якоря практики» in body; fill overview first; locale + term→definition / glossary
- [x] 2.2 Align workspace mirror `.cursor/skills/export-course/SKILL.md` with canon
- [x] 2.3 Add locale/term guidance cross-links in `generate-questions` skill (+ AGENTS.md pointer if needed)
- [x] 2.4 Add short “good course lesson” example snippet in skill (RU), contrasting bad fixed quartet

## 3. Player course reader

- [x] 3.1 Render overview module first; support `kind` in navigation labels if useful
- [x] 3.2 Show course `glossary` and per-lesson `footnotes` under body
- [x] 3.3 Keep practice UI solely from `practiceQuestionIds` / anchors (document that body practice dumps are unused)
- [x] 3.4 Sync player templates (`player-sync` / shipped player assets) + light UI test or manual smoke note

## 4. Docs and verify

- [x] 4.1 CHANGELOG `[Unreleased]` + README/CLI help for overview/glossary (if user-visible)
- [x] 4.2 `npm run verify` in `specra/`
- [x] 4.3 Smoke: `export learning --profile … --level … --format course --plan-only --json` shows overview + glossary candidates; player opens pack
