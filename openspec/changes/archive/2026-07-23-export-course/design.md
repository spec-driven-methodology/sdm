## Context

`export test` (`sdm.export.test/v1`) отдаёт вопросы профиля/уровня. Пилот (`ai-methodology` и аналоги) показал: та же онтология логично кормит обучение, но **пустой skeleton** без богатого контекста и рычагов глубины воспроизводит слабость входа (тонкий граф, короткие description, topics без покрытия, practice без explanation).

Rework: Specra усиливает вход и экспортирует пакет; агент пишет prose после HITL; не LMS.

```
ontology + cert + library
        │
        ├─ TeachingContext / course plan (keys + warnings + controls)
        ├─ agent generates lessons[].body (LLM снаружи)
        ├─ export course → sdm.export.course/v1
        └─ export test   → оценка (без изменений контракта)
```

## Goals / Non-Goals

**Goals:**

- Стабильный JSON `sdm.export.course/v1` для потребителей.
- **TeachingContext**: детерминированный brief по scope из skills/topics/graph/cert + question anchors.
- **Quality warnings** (learning readiness), отдельно от cert coverage gaps где нужно.
- **Content controls**: `depth` + `format`; один и тот же skill/topic/question даёт разный объём/стиль.
- Scope: profile/level, `--from-gaps`, `--skill`, `--topic`, `--from-questions <ids>`.
- Practice только из существующих question ids (тот же library, что `export test`).
- Agent-first: `--json`, HITL plan, portable skill; core без LLM.
- Высокое качество выхода за счёт усиления входа (warn/enrich), не «пустой каркас = готовый курс».

**Non-Goals:**

- LMS / player / video / SCORM / прогресс ученика
- CMS `library/lessons/` в methodology YAML (v1 — prose в export document)
- LLM в `@spec-driven-methodology/core`
- Персонализация по истории кандидата в ядре
- Изменение поведения `export test`

## Decisions

1. **Имя команды:** `export course` (learning-pack — синоним в docs/skill).
   - Опционально тот же entrypoint с режимом brief: `export course --plan-only` / флаг `--brief` (имя зафиксировать в apply; суть — отдать TeachingContext без требования заполненных bodies).
   - Отдельная команда `course plan` допустима, если тонкий CLI читаемее; не плодить два несовместимых документа.

2. **Pipeline = brief → generate → export**
   - Core: собрать TeachingContext + module/lesson stubs + practiceQuestionIds + warnings + echo controls.
   - Agent: заполнить `lessons[].body` (markdown) по brief и controls.
   - Export document MAY содержать пустые bodies при `--plan-only`; полный pack — после генерации (агент мержит или передаёт bodies в export, если API это поддержит; минимально — агент пишет JSON/MD файл потребителя, core валидирует schema при `export course`).

3. **TeachingContext (минимум полей)**
   - `schemaVersion` brief (например `specra.course.brief/v1`) или секция `meta.teachingContext` внутри course export.
   - Scope keys: profile, level, skills[], topics[], questionAnchors[] (id, skill, topics, text, explanation?, difficulty, type).
   - Graph: depends_on / related_to edges in scope; topo order для modules.
   - Cert: depth/weight per required skill when level-scoped.
   - Controls: `depth`, `format`, `includePractice`, optional `locale`.
   - `warnings[]`: machine codes + human message (см. ниже).

4. **Content controls**
   - `depth`: `brief` | `standard` | `detailed`
     - brief ≈ короткая инструкция; detailed ≈ секции + примеры + anti-patterns.
   - `format`: `howto` | `concept` | `cheatsheet`
   - Пример интента: вопрос про промпт/тестирование → scope `--from-questions` / topic → `depth=brief` `format=howto` vs `depth=detailed`.

5. **Quality warnings (learning readiness)**
   - Коды (черновик): `SKILL_DESCRIPTION_THIN`, `SKILL_TOPICS_EMPTY`, `TOPIC_UNCOVERED_BY_QUESTIONS`, `GRAPH_ISOLATED_IN_SCOPE`, `PRACTICE_THIN`, `PRACTICE_MONO_TYPE`, `QUESTION_EXPLANATION_MISSING`.
   - Default: soft warn в JSON (не блокировать skeleton).
   - Для `depth=detailed`: SHOULD warn сильнее; опционально `--strict-context` → `SdmError` / non-zero если критичные warnings (решить в apply: fail vs warn-only v1).
   - Agent skill: при warnings предложить enrichment через существующие `skill` ops (description/topics/`skill link`) **до** генерации detailed prose — без нового CMS-слоя.

6. **Схема course отдельна от test**
   - `schemaVersion: sdm.export.course/v1`
   - Общие поля (profile, level, skill ids) дублируются по контракту.
   - Modules: один skill → один module; topics (+ question-derived stubs) → lessons; `practiceQuestionIds` из library.

7. **Порядок модулей**
   - Topo по `depends_on` среди skills scope; циклы → stable alpha fallback + warning.

8. **`--from-gaps`**
   - Skills со status `missing`/`thin` из того же gaps resolver, что coverage.
   - Не личный план кандидата.

9. **Practice**
   - Только существующие ids; MUST NOT invent question content.
   - Embed full question snapshot vs ids-only: default **ids + slim anchor fields already in TeachingContext**; полный duplicate optional flag later.

10. **Agent skill**
    - Intent → clarify depth/format/scope → show brief+warnings → HITL confirm → enrich ontology if needed → generate bodies → export/write → suggest (`export test` / coverage) via existing suggest patterns.
    - Не трактовать Specra как LMS.

11. **Реализация**
    - Planning freeze снят: после ревью артефактов — `/opsx:apply`.
    - Assessment остаётся приоритетным consumer; learning не ломает test.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Brief без prose бесполезен для demo | Skill обязан генерировать bodies после HITL; README: brief ≠ готовый курс |
| Detailed на бедном skill → мусор | Warnings + optional strict + enrichment step в skill |
| Scope creep в LMS | Non-goals; нет progress store |
| Дрейф prose vs regenerate | v1 prose в export file; regenerate = новый документ |
| Дубли practice vs test | Practice = ids; consumer решает, показывать ли answers |
| Два schemaVersion (brief vs course) | Предпочесть course doc с `meta.plan` / `--plan-only`; отдельный brief schema — только если нужен независимый артефакт |

## Migration Plan

N/A до первой реализации. Ship: новая команда, semver minor; без breaking для `export test`. Обновить Unreleased в CHANGELOG (убрать «отложено», описать capability).

## Open Questions

**Resolved (apply):**

- **strict-context:** soft warn by default; `--strict-context` + `depth=detailed` → `COURSE_CONTEXT_THIN` on critical warnings (`SKILL_DESCRIPTION_THIN`, `SKILL_TOPICS_EMPTY`).
- **Brief schema:** TeachingContext lives inside course document (`teachingContext` + `meta.planOnly`); no separate `specra.course.brief/v1` file in v1.
- **Markdown format:** JSON only in v1; markdown deferred.
- **MCP:** single tool `export_course` with `planOnly` (no separate `course_plan`).
- **`library/lessons/`:** deferred (follow-up change if demand).
