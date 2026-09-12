---
name: sdm-export-course
description: >-
  Build SDM educational materials from methodology keys (profile/level/skill/topic/questions):
  TeachingContext brief → HITL → optional ontology enrichment → agent prose → export learning.
  Use when the human asks for учебный материал, курс, конспект, howto for learners.
  For expert/HR interview cheat sheet (open probes, one HTML page) use ../export-kit/SKILL.md
  (export kit) — NOT export learning --format cheatsheet.
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm`) on PATH; run inside a methodology project (sdm.yaml).
metadata:
  author: sdm
  version: "0.9.0"
---

# Export educational materials (not LMS)

Work in a **methodology project**. Prefer `--json` / MCP `export_learning` (alias `export_course`).

SDM builds **TeachingContext** + module stubs + practice question ids (+ optional overview/glossary for `course`). **You** (the agent) write lesson markdown after human confirm. SDM does **not** call an LLM and does **not** track learner progress.

Schema stays `sdm.export.course/v1`. CLI canon: `sdm export learning` (alias `export course`).

## Clarify controls

**Propose** `format` + `depth` if the human did not name them.

| Control | Values | Human examples |
|---------|--------|----------------|
| Scope | profile+level / `--from-gaps` / `--skill` / `--topic` / `--from-questions` | «по профилю AI QA Middle», «только промпт», «по вопросу q-…» |
| `depth` | `brief` \| `standard` \| `detailed` | «короткая…» → `brief`; «с деталями и примерами» → `detailed` |
| `format` | see table below | «как сделать» → `howto`; «конспект» → `notes`; «курс» → `course` |
| Practice | default on | «без практики» → `--no-practice` |
| Locale | `--locale` or human language | prose must stay in **one** language |

### Format contracts (what you produce)

| `format` | RU label | On exit (`meta.layout`) | Prose contract |
|----------|----------|-------------------------|----------------|
| `howto` | Инструкция | `single_doc` — one lesson stub per module | Short steps + example in the target language; **may** use a compact step skeleton. No long course narrative. |
| `notes` | Конспект | `single_doc` | Lecture/topic notes: theses, definitions, key distinctions; not a full course |
| `cheatsheet` | Шпаргалка (учебная) | `single_doc` | Lists/tables for **learners**; agent fills prose — not expert interview kit |

**Expert interview kit** (open/code probes, glossary, HTML for interviewer): [`../export-kit/SKILL.md`](../export-kit/SKILL.md) — `export kit`, not this skill.
| `course` | Курс | `modular_course` | See **Course contract** below — **not** a copy of howto headings |

Deprecated: `--format concept` → normalized to `notes` + warning `FORMAT_CONCEPT_DEPRECATED`. Prefer `notes`.

Same keys (skill/topic/question) + different `depth`/`format` → different prose volume/style; practice ids stay aligned with `export test` library.

### Course contract (`format=course`)

Level-scoped packs (`--profile` + `--level`) include a leading module `kind: overview` (`skill: course-overview`) with stubs: что это за курс / как устроен / для кого / что не входит. **Fill overview lessons first** (or together with skill lessons) before calling the pack complete.

For each skill/topic lesson:

1. Start with a **plain-language definition** of the topic for a beginner (not an empty heading).
2. Then: why it matters → explanation with **content-specific** headings → concrete example/scenario → what to practice next.
3. Headings MUST reflect that lesson’s content. Do **not** reuse a fixed quartet («Проблема / Модель / Пример / Ловушки» or English equivalents) as the default skeleton for every lesson.
4. Do **not** add a «Якоря практики» (or similar) section that only repeats `modules[].practiceQuestionIds` — practice is shown by the player / consumer from those ids.
5. Fill `glossary[].definition` for seeded terms you use; add `lessons[].footnotes` on first use of opaque terms when helpful.

### Human-readable titles and labels (mandatory for learner-facing packs)

Learner-facing surfaces (player Курсы, exported course) show **titles**, not raw slugs:

- **Lesson stub titles** MUST be learner-facing. Rename a topic slug when you fill the lesson: keep the stub `id`/`topic` as the slug, but set `title` to a human label. Examples: `dockerfile` → «Dockerfile и сборка образа», `http-client` → «HTTP-клиент для LLM», `transactions` → «Транзакции в Spring», `domain-event` → «Доменные события».
- **Prefer `topic_labels` at the ontology layer**: when a skill's topics are consistently English slugs, add `topic_labels` to the skill YAML (via `skill add --force` or a direct YAML edit through the engine) so every future export gets the label automatically and player/agents don't rely on guesswork. Example: `topic_labels: { "http-client": "HTTP-клиент для LLM" }`.
- **Glossary entries** keep the slug as `term` (stable identity + matching), and the human label goes into `aliases`, e.g. `{ term: "http-client", aliases: ["HTTP-клиент для LLM"], definition: "…" }`.
- Stub titles that are already plain Russian/good labels are fine as-is. Do not invent fake humanization for code identifiers; identifiers stay Latin inside fenced code.

**Bad:** lesson stub titled `http-client`, glossary term `http-client` with no alias, body heading «domain-event».

**Good:** stub titled «HTTP-клиент для LLM», glossary `{ term: "http-client", aliases: ["HTTP-клиент для LLM"], definition: "…" }`.

**Bad (howto pasted into course):** every lesson = Проблема / Модель / Пример / Ловушки / Якоря практики.

### Grounding project examples (no unexplained project jargon)

Courses generated against a real codebase (like agentplatform) must be readable without the project in front of the reader. A learner does not know the project's classes, tables, or event names by heart.

- **Introduce every project artifact on first use**: say what it is and its role before referencing it. Not «Read model обновляется из событий», but «Read model (отдельная таблица чтения `task_view`, построенная под запросы) обновляется из доменных событий: когда публикуется `AgentTaskCreated`, проекция вставляет строку в read model».
- **Команда против факта**: if you reference a code class (`AgentTask`, `TaskRepository`, `JpaTaskRepository`), give one line on what it is (агрегат задачи / порт репозитория / JPA-адаптер). Use `glossary` or a `footnote` for the first mention when a term is opaque.
- **Cut the «В проекте» section when it teaches nothing**: if the project example does not add a distinction a learner couldn't get from a general example, replace it with a generic concrete example (request/response, SQL, code snippet) and drop the project reference.
- **Keep project examples pointed**: prefer one small end-to-end walkthrough per lesson (create task → outbox → relay → Kafka → consumer → read model) over scattered mentions of many classes. A single repeated canonical example is easier to follow than five disconnected ones.
- **Общая картина**: when topics are shuffled, each lesson should anchor back to the same mental model (the course's canonical architecture) — one sentence «этот приём живёт в слое инфраструктуры, рядом с outbox-релеем, который мы разобрали в уроке про Kafka» helps the reader assemble the picture.

**Bad:** «Read model обновляется из событий: AgentTaskCreated → проекция обновляет таблицу чтения» (непонятно, что такое read model и откуда таблица).

**Good:** «Read model — отдельная модель чтения, заточенная под запросы (в проекте — таблица `task_view`). Она не хранит бизнес-правил и пересобирается из событий: когда агрегат создаёт задачу, публикуется доменное событие `AgentTaskCreated`; проекция-слушатель ловит его и вставляет строку в `task_view`».

**Good (course lesson sketch, RU):**

```markdown
# Недетерминизм ответов

Недетерминизм — свойство генеративной модели давать **разные формулировки**
на один и тот же вопрос при повторных прогонах.

## Зачем это важно тестировщику

Один «удачный» ответ не доказывает стабильность качества. Нужны критерии
приёмки и повторные прогоны ключевых кейсов.

## Как проверять на практике

1. Зафиксируйте рубрику (факты и отказы — жёстко; формулировки — гибко).
2. Прогоните кейс 2–3 раза.
3. Расхождение по фактам или политике — дефект; другая формулировка при том же смысле — обычно нет.

## Пример

Три раза спросить про запретную тему: каждый раз должен быть отказ по политике продукта.
```

### Locale and terms (mandatory)

- Prose language = `--locale` if set, else the human's language / methodology language.
- Do **not** leave unexplained foreign jargon as the only teaching of a concept (*primer*, *acceptable use*, *grounding* without Russian definition).
- On first use: Russian definition inline and/or `glossary` / `footnotes`. Latin **identifiers** OK: skill/question ids, CLI flags, API names, fenced code.
- Soft SDM warning `PROSE_LOCALE_MIXED` if filled bodies mix scripts outside fences — fix before delivery.
- Speak to the methodologist in their language too.

## Steps

1. **Confirm project** — `sdm doctor`
2. **Propose** format + depth (+ scope) → **wait for human confirm**.
3. **Generate lesson bodies** outside SDM based on the methodology keys:
   - Review skill descriptions, topics, questions (via `skill list`, `cert coverage`, individual skill/queston reads)
   - Write markdown bodies matching `controls.depth` / `controls.format` / locale. Neutral expert tone (no «привет / молодец / ты» unless asked).
   - Fill overview module first (if `format=course` and level-scoped).
   - Fill `glossary[].definition` for terms you use; add `lessons[].footnotes` on first use of opaque terms.
   - **Hint**: use `sdm list skills --json`, `sdm cert coverage --profile P --level L --json`, and read individual skill/question YAMLs to gather TeachingContext without an export call.
4. **Export** (fails with `COURSE_ALL_EMPTY` if all lesson bodies are empty — that is the guardrail; fill at least one body first):
   ```bash
   sdm export learning --profile "<profile>" --level "<level>" --depth standard --format course --locale ru --json
   # or:
   sdm export learning --skill prompt-engineering --topic testing --depth brief --format notes --json
   ```
   MCP: `export_learning` (alias `export_course`).
5. **Write final JSON** to `exports/` for the consumer. The document includes `schemaVersion: sdm.export.course/v1`, `id`, `meta.revision`.
6. Optional next: same scope → `export test`; author preview in `player/` (**Курсы**, after `player sync --force`); `suggest` for levers.

## Guardrails

- Not an LMS / progress store — static player is author preview only
- **Consumer upsert:** external systems use `id` as slot key; replace when `meta.revision` changes (content fingerprint from basis, not `capturedAt`)
- Do not invent practice question content — only library ids
- Do not hand-edit ontology YAML when `skill` / `question` commands exist
- Schema: `sdm.export.course/v1` (separate from `sdm.export.test/v1`)

## Healing levers (post-export, in core 1.0)

Beyond the warnings, the core now ships deterministic helpers an agent can call to
close learning-readiness gaps without an LLM:

| Lever | Function (core) | What it does |
|---|---|---|
| **Back-fill topics** | `extractTopicsFromModules(modules)` → `mergeTopicsIntoSkill(declared, courseTopics)` | Closes `SKILL_TOPICS_EMPTY`: collect `lesson.topic` from a filled pack and union into `skill.topics` via `skill add --force`. |
| **Autofill description** | `suggestDescriptionFromModules(modules, skillId)` | Closes `SKILL_DESCRIPTION_THIN`: summary sentence from lesson titles + first paragraphs. |
| **Truncation check** | `detectTruncation(body)` | `LESSON_TRUNCATED` warning; regenerate the lesson body when the body ends mid-sentence/unclosed. |
| **Glossary tautology** | `collectLearningWarnings({ glossary })` | `GLOSSARY_TAUTOLOGY` when a definition starts with its own term; rewrite the definition. |
| **Edge suggestion** | `inferEdgesFromContent(skills)` | Proposes `related_to` when one skill's description/topics mention another; confirm via `skill link`. |
| **Course gate** | `quality.courseGate: strict` in `sdm.yaml` | Blocks export on `SKILL_DESCRIPTION_THIN`, `SKILL_TOPICS_EMPTY`, `TOPIC_UNCOVERED_BY_QUESTIONS`, `GRAPH_ISOLATED_IN_SCOPE` — instead of soft warning. |
| **Deep validate** | `validateQuestionLibraryDeep(root)` | Catches `single_choice` without options, `open` without expected, explanations that restate the answer. |

Before re-exporting a thin pack, heal warnings first:
```bash
# 1. review warnings (courseGate strict blocks the worst)
sdm export learning --profile P --level L --format course --json
# 2. back-fill topics + description from the filled pack (agent calls core helpers),
#    then skill add --force with the enriched fields
# 3. re-export
```
