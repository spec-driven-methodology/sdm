## Context

`export learning --format course` сегодня отдаёт `modular_course`: модули по skills, уроки по topics, `practiceQuestionIds`, TeachingContext. Прозу пишет агент по контракту в `agents/export-course/SKILL.md`, где для `course` сейчас указано «problem → model → example → pitfalls» — по сути howto-скелет. Player показывает body + отдельный блок практики. Feedback автора (курс AI QA Junior): нет вводного «о курсе», шаблонные H2 в каждом уроке, дубль «Якоря практики», необъяснённый EN-жаргон, ожидание подачи как у нормального обучающего курса (overview → структура → урок с живыми заголовками по смыслу темы).

Constraints: Specra не вызывает LLM и не LMS; schema `sdm.export.course/v1` остаётся; agent-first (`--json`, HITL перед prose).

## Goals / Non-Goals

**Goals:**

1. Каркас курса: overview (о курсе / как устроен / аудитория / границы) + skill-модули.
2. Контракт прозы `course` ≠ `howto`: смысловые заголовки урока, определение темы в начале, без фиксированного quartet секций.
3. Глоссарий/сноски терминов в документе и UI player.
4. Locale: агент объясняет термины по-русски; латиница только как термин+определение / ids / fences; усилить skill + soft warnings.
5. Не дублировать practice ids в body («Якоря практики»).

**Non-Goals:**

- Генерация prose внутри core.
- Авто-перевод всей library.
- Жёсткий fail export на любой Latin token (только soft warn + agent fix).
- Полноценный CMS курсов.

## Decisions

### D1: Overview как первый module с `kind: overview`

- **Choice:** Добавить optional `modules[].kind`: `overview` | `skill` (default `skill`). Для `format=course` + profile/level stub builder вставляет **один** overview-модуль первым с lesson stubs: `about`, `how-it-works`, `audience`, `out-of-scope` (пустые body в plan-only).
- **Why:** Player и агент получают стабильные якоря без ломки skill-модулей.
- **Alt:** Только markdown в `meta.intro` — хуже для навигации prev/next.

### D2: Glossary на уровне документа

- **Choice:** Optional `glossary: [{ term, definition, aliases[] }]` + optional per-lesson `footnotes: [{ term, definition }]`. Specra MAY seed `glossary` candidates from skill topics / Latin tokens in skill descriptions; агент заполняет `definition` на языке locale.
- **Why:** Новичок видит определение один раз; сноски в уроке — для первого употребления.
- **Alt:** Только markdown `## Термины` в body — слабее для player chrome.

### D3: Course prose contract в skill (не Zod-enforced headings)

- **Choice:** В `export-course` skill заменить «problem→model→example→pitfalls» для `course` на: (1) вводное определение темы; (2) зачем ученику; (3) разбор с **уникальными** H2 по содержанию; (4) пример/сценарий; (5) что потренировать — **без** секции «Якоря практики» (ссылка на module practice). Howto сохраняет шаговую структуру.
- **Why:** Жёсткие H2 в schema убьют живую подачу; контракт — в agent skill + review checklist.
- **Alt:** Zod требует наличие секций — отвергнуто (шаблонность).

### D4: Locale — skill + warning, не block

- **Choice:** Расширить `PROSE_LOCALE_MIXED` guidance: термин на латинице допустим, если рядом русское определение или term ∈ glossary. Agent skills (`export-course`, `generate-questions`) — явный «термин → русское пояснение при первом упоминании». Question text/options: предпочитать русские формулировки; EN только для устоявшихся имён (LLM) с пояснением в explanation.
- **Why:** Полный запрет латиницы нереалистичен (LLM, API).

### D5: Player

- Overview lessons в начале оглавления; блок «Термины» из glossary; footnotes под body; practice только из `practiceQuestionIds` (игнорировать/не поощрять «Якоря практики» в body).
- Soft: если body содержит heading «Якоря практики», agent skill говорит удалить при regenerate.

### D6: Question/howto skills в том же change

- Минимально: locale + «объясняй термин» в `generate-questions` / AGENTS.md cross-link. Полный rewrite question bank — out of scope (отдельный methodology pass).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Раздувание schema | Поля optional; старые паки валидны |
| Агент игнорит prose contract | Чеклист в skill + HITL; примеры «хорошего» урока |
| Glossary seed шумный | Seed = topics + явные candidates; agent prune |
| Overview пустой в plan-only | Player stub «нет текста»; skill требует fill overview первым |

## Migration Plan

1. Zod: optional `kind`, `glossary`, `footnotes`.
2. Stub builder: overview module when `format=course` && profile+level.
3. Skills + CHANGELOG.
4. Player render.
5. Smoke на `ai-methodology` / fixture; regenerate sample course (methodology, не core) — optional follow-up вне archive.

Rollback: optional fields ignored; skill revert.

## Open Questions

1. Нужен ли отдельный CLI flag `--no-overview`? (дефолт: overview on for course+level; skill-only scope — без overview или mini-about)
2. Seed glossary из topics автоматически или только agent-filled empty stubs?
3. Показывать ли `PRACTICE_MONO_TYPE` в player UI автору (сейчас шумит) — вынести в отдельный UX-change?
