# Changelog

Все значимые изменения SDM фиксируются в этом файле.

Формат опирается на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
проект следует [Semantic Versioning](https://semver.org/lang/ru/)
(до 1.0 API ещё может меняться).

## [1.4.0] - 2026-09-13

### Изменено

- **EN tagline** → **Spec-Driven Methodology** (было Methodology-as-Specs Framework): `ABOUT.md` / `about.tagline`, CLI banner `--version`, MCP `initialize` description, `package.json` description, VERSIONING, player/kit html, `agents/explain-sdm`. Обновить локальный player: `sdm player sync --force`
- Внутренняя функция `resolveSpecraHome` → `resolveSdmHome` (SDM-нейминг, без упоминаний Specra в коде)
- **ASCII-арт** в CLI `--version` — перерисован с figlet-standard строчных `sdm` на заглавные **SDM** (`packages/cli/src/banner.ts`)
- **Архитектура вопросов:** удалены дубли q-testing-002, q-testing-003, q-testing-007 (точные копии), q-architecture-003 (почти дубль). Часть `architecture` переведена в тип `open` (2 из 5), покрытие диверсифицировано. Добавлены glossary-термины (9 шт: JVM, Generics, IoC, DI, ACID, JUnit5, Микросервисы, CQRS, CI/CD)
- **Экспорты:** перегенерирован `test-java-developer-senior.json` (26 вопросов, актуальный состав), удалён устаревший `test-java-developer-senior-8.json`
- **`--version` label** — строка `framework` заменена на `core` (теперь `core 1.4.0 / mcp 1.4.0`)
- **SDM Studio полностью удалён** (весь стек: UI `studio/`, шаблоны, `studio-bridge`, `studio-sync`, `studio-coverage` в core, CLI-команды, MCP-тулы, тесты, openspec-спеки). Вместо Studio — obsidian-sdm

## [1.3.0] - 2026-09-12

### Добавлено

- **Obsidian-интеграция (без собственного плагина)** — комбинация существующих компонентов:
  - **Cortex** (MCP-сервер внутри Obsidian, порт 27182) — доступ к vault для агента
  - **OpenCode** (CLI-агент внутри Obsidian или внешний MCP-клиент)
- **`scripts/obsidian-setup.sh`** — setup-скрипт: проверка зависимостей, поиск vault, сканирование SDM-проектов, генерация `opencode.json` (SDM + Cortex) и `AGENTS.md` в vault. Поддерживает `--dry-run` (превью) и `--undo` (откат)
  - **`scripts/obsidian-cleanup.sh`** — безопасный откат: удаляет `opencode.json` и `AGENTS.md` (созданные setup) с backup по умолчанию (`--purge` — без backup). Не трогает SDM-проекты, плагины Obsidian и глобальные MCP-конфиги (только предупреждает)
  - **`docs/obsidian-integration.md`** — документация: установка, multi-project, модели, удаление/откат, troubleshooting
  - **`npm run obsidian:setup` / `npm run obsidian:cleanup`** — алиасы для скриптов
- **Шаблон `AGENTS.md` (init.ts)** — блоки «Data model (vault ↔ SDM)», «Multi-project workflow», «Read vs. write routing»; ссылка на Obsidian-интеграцию

### Изменено

- **Имена методологий** — `specra/sdm.yaml` переименован `my-methodology` → `sdm` (README, AGENTS.md); `reference/engineer-certification` → `qa-engineer` (README, AGENTS.md). `my-methodology` остаётся только как дефолт `sdm init` и в примерах/архивах
- **`AGENTS.md` (репозиторий)** — добавлены блоки data model, multi-project workflow, Obsidian integration

## [1.2.0] - 2026-09-12

### Добавлено

- **`--project` в MCP entry** — сервер `sdm-mcp` принимает аргумент `--project <dir>` (и `-p`), устанавливает `SDM_PROJECT_ROOT`. Позволяет избежать хардкода пути в конфиге хоста: `"args": ["dist/index.js", "--project", "/my/project"]`.
- **`locate_project` / `list_projects` MCP tools** — два новых инструмента для мульти-проектного режима. `locate_project` находит ближайший `sdm.yaml` от любой директории; `list_projects` сканирует воркспейс. Агент (харнес) вызывает `locate_project` → получает `root` → передаёт `project` во все остальные инструменты. Один MCP-сервер на любое количество методологических проектов.
- **`locateProject`, `listMethodologyProjects` в core** — новые экспортируемые функции; `locateProject` не кидает ошибку, а возвращает `null`.
- **`buildMcpConfig` теперь пишет `--project` в args** — при `sdm mcp install --project <dir>` в host-конфиг записывается `--project <dir>` в `args` (плюс env как fallback).
- **docs: мульти-проектный режим** — обновлены `GETTING_STARTED.md` (раздел 6.2), `AGENTS.md`, skill `connect-mcp`, шаблон `init.ts`.

### Изменено

- **cert-write.ts: корректная обработка `noNormalizeWeights`** — при `true` весы не нормализуются (проверяется только нулевая сумма). Флаг `weightsNormalized` возвращается корректно.
- **Убран `--plan-only` из экспорта курса** — `export learning` (CLI) и `export_learning` (MCP) больше не принимают `--plan-only`; удалён `meta.planOnly` из документа. Гвардрейл `COURSE_ALL_EMPTY` теперь безусловен: экспорт с пустыми `lessons[].body` всегда падает. Скелеты и brief-режим удалены из публичных поверхностей, навык `export-course` обновлён: агент генерирует тела уроков и только затем экспортирует. В core опция осталась помеченной `@internal` (для тестов структуры).

### Добавлено

- **MCP tools: `skill_suggest_links`, `question_deep_validate`, `topic_registry`, `topic_sync`, `course_heal`** — пять новых MCP-инструментов с Zod-схемами, описаниями и тестами; синхронизированы `ABOUT_MCP_TOOLS` (about.ts) с `TOOL_NAMES` (server.ts), тест «exposes the full shipped tool set» расширен. Новый tool-level description у каждого инструмента.
- **Player: тултипы терминов** — кастомный `#termTip` вместо нативного `title` (возможные: hover = короткое определение, клик = переход на страницу «Термины курса»; позиционирование с переворотом при переполнении, `pointer-events: none`). Обновить локальный player: `sdm player sync --force`
- **Player: страница «Доработки»** — warnings больше не рендерятся под каждым уроком; в шапке — кликабельный бейдж «Доработки: N», полный список на отдельной странице (module kind `warnings`) в навигации рядом с «Термины курса». Обновить локальный player: `sdm player sync --force`

### Запланировано

- MCP HTTP (сверх текущего stdio MCP)
- История экспорта по кандидату
- RGB-спектр и внешние HR-коннекторы
- Настоящий LanceDB + embeddings Xenova (сейчас offline JSON PoC)
- Анализ / сравнение кандидатов (вне ядра методологии)
- Дополнительные MCP-хосты в реестре (по запросу)
- Опционально позже: CMS `library/lessons/`, markdown consumer format для learning export
- Split `cli/index.ts` → `commands/` и `mcp/server.ts` → `tools/` (монолиты 2800/2100 строк)

## [1.0.0] - 2026-09-10

### Добавлено

- **Refactor `export-course.ts` → `export-course/`** — монолит 1077 строк разбит на модули: `types.ts` (схема + enums), `lessons.ts` (overview/stubs/glossary/topo-order), `warnings.ts` (quality warnings, locale, truncation), `scopes.ts` (resolve scope), `course-gate.ts` (readiness gate), `enrichment.ts` (reverse topic extraction + description suggest), `orchestrator.ts` (сборка документа). Публичный API не изменился.
- **`quality.courseGate`** — новое поле `sdm.yaml → quality.courseGate: off|soft|strict`. При `strict` экспорт курса блокируется на `SKILL_DESCRIPTION_THIN`, `SKILL_TOPICS_EMPTY`, `TOPIC_UNCOVERED_BY_QUESTIONS`, `GRAPH_ISOLATED_IN_SCOPE` (код `COURSE_GATE_BLOCKED`). `--strict-context` остался как legacy-флаг (depth=detailed).
- **`quality.courseGate` авто-чистка** — `course heal` (CLI) / `healCourseWarnings()` (core): back-fill topics + registry sync + suggest descriptions из уроков. Закрывает `SKILL_TOPICS_EMPTY` / `SKILL_DESCRIPTION_THIN` без LLM.
- **Topic labels** — `skill.topic_labels` (slug → человеческое название) в схеме навыка; `buildLessonStubs()` использует их для заголовков уроков; `seedGlossaryFromTopics()` добавляет label как `aliases[]`.
- **`sdm question deep-validate`** / core `validateQuestionLibraryDeep()` — сквозная проверка библиотеки вопросов: `SINGLE_CHOICE_NO_OPTIONS` / `CHOICE_NO_CORRECT` (error), `OPEN_NO_EXPECTED` / `EXPLANATION_RESTATES_ANSWER` / `PROBE_RUBRIC_MISSING` (finding), `difficultySummary` (easy/medium/hard) + `rubricMissingCount`.
- **`sdm skill suggest-links`** / core `inferEdgesFromContent()` / `inferEdgesForProject()` — авто-предложение рёбер `related_to`/`depends_on` из описаний и тем навыков (dry-run; подтверждение через `skill link`).
- **`detectTruncation()`** — эвристика обрыва текста урока (незакрытые кавычки/скобки, обрыв на союзе/предлоге) → warning `LESSON_TRUNCATED` в `collectProseLocaleWarnings`.
- **`GLOSSARY_TAUTOLOGY`** / **`GLOSSARY_MISSING_TERM`** / **`LESSON_DUPLICATE`** — quality warnings: тавтология определения, термин в уроке без записи в глоссарии, near-duplicate уроки (jaccard ≥0.7).
- **`module.prerequisites`** — автоматически из `skill.depends_on`; **`lesson.estimatedMinutes`** и **`module.learningObjectives`** — опциональные поля схемы курса.
- **`meta.generation`** — опциональный блок для воспроизводимости: `{ model, promptVersion, temperature, seed, generatedAt }`.
- **`meta.revisionByModule`** — `{ [skillId]: hash }` поверх глобального `meta.revision`; `hashModuleRevision()` / `buildRevisionByModule()`. Изменение одного урока меняет только хеш его модуля.
- **Topic registry** — новый домен `library/topics/*.yaml`: `TopicSchema`, `buildTopicRegistry()`, `syncTopicRegistryFromSkills()`, `addTopic()`, `mergeRegistryLabelsIntoSkills()`; CLI `topic registry` / `topic sync` / `topic apply` / `topic add`. Единый словарь тем закрывает корень `TOPIC_UNCOVERED_BY_QUESTIONS`.
- Тесты: `course-enrichment` (5), `skill-edge-inference` (3), `question-validate-deep` (3), `detectTruncation` (4), topicLabels (4), `topic-registry` (4), `course-heal` (4), `warnings-glossary-dup` (5), `revisionByModule` (3).

### Изменено

- `collectLearningWarnings()` принимает `glossary?` для проверки тавтологий.
- `course-gate.ts` читает `quality.courseGate` из конфига проекта (замена inline-логики `--strict-context`).

### Запланировано (OpenSpec)

- MCP tool `intent_validate_plan` — отложено (CLI достаточно для v1)

## [0.9.0-alpha.3] - 2026-08-02

Prerelease: pitch-aligned product canon (эталон, system picture, harness boundary).

### Изменено

- **Позиционирование** (`ABOUT.md` / `about` / MCP·CLI `about` descriptions, README, GETTING_STARTED, AGENTS, explain-sdm, player/studio leads, `openspec/config.yaml`): эталон / единый источник правды рядом со скелетом; картина **спеки · фреймворк · агент**; ценность «контроль из одной точки» и экспорт под поверхности; контексты университет/bootcamp без смены аудитории
- **`whatNot`:** не полный harness / оркестратор агентов (CLI/MCP — доступ к эталону)
- Тесты `about.test.ts` — assert на harness и эталон/SSOT в positioning

## [0.9.0-alpha.2] - 2026-08-01

Prerelease: Methodology Studio, content staleness, MCP schema hygiene, catch-up docs.

### Добавлено

- **Content staleness / basis:** `meta.basis` (hash навыков/уровня) на `question add`, `export test`, `export learning|course`; CLI **`content stale`** / MCP **`content_stale`** (`sdm.content.stale/v1`, `workItems`); `suggest` lever `review-stale-content`; portable skill `agents/close-staleness/`. Wire `schemaVersion` ≠ content freshness
- MCP **`studio_sync`**, **`studio_push_view`**, **`studio_push_coverage`**, **`studio_pull_action`** (parity с CLI; без `studio_serve`)
- **Studio coverage / пробелы:** фаза `coverage` (не покрыто / слабо покрыто / покрыто); **Закрыть пробел** → `close_gap`; chips suggest → `suggest_lever`; CLI **`studio push-coverage --profile --level [--json]`**. Обновить: `sdm studio sync --force`
- **Studio export-form + Player handoff:** фаза `export-form` в view (динамические поля/типы), action `export_test` (Studio не вызывает `export test`); **Открыть Player**; `studio serve` отдаёт `/player/` и `/exports/` (read-only). Обновить: `sdm studio sync --force`
- **Studio bridge:** `.sdm/studio/` (`current-view.json` / `last-action.json`); CLI **`studio push-view`**, **`pull-action [--consume]`**, **`serve`** (только `127.0.0.1`, static `studio/` + `/bridge/*`); UI «Загрузить из моста» + POST action. Не пишет YAML. Обновить UI: `sdm studio sync --force`
- **Methodology Studio** (`studio/`): static view/action shell рядом с `player/` — рендер `sdm.studio.view/v1`, эмит `sdm.studio.action/v1` (confirm/reject); не пишет YAML. `sdm init` + **`sdm studio sync [--force] [--json]`**. Демо: `studio/fixtures/demo-view.json`. Обновить: `sdm studio sync --force`
- Product identity с номером сборки: `X.Y.Z-(alpha|beta|rc).N` (пример `0.8.0-alpha.1`); видно в `sdm --version`, `about` и MCP initialize
- `sdm --version` — ASCII `SDM` + tagline + строки `framework <version>` / `mcp <version>` (резолвнутый `@spec-driven-methodology/mcp`); тот же баннер в TTY-help (`sdm` / `--help`)
- Скрипты `npm run version` / `version:build` / `version:major|minor|patch` / `version:alpha|beta|rc|stable`; auto-bump build на `npm run build` (см. `VERSIONING.md`); `verify` идёт через `compile` без bump
- `GETTING_STARTED` / `agents/connect-mcp`: проверка freshness через `--version` / `about`; ключ MCP остаётся `SDM` (без версии в имени)
- **`export learning`** / MCP **`export_learning`** — канон экспорта образовательных материалов; алиасы `export course` / `export_course`
- Форматы: `howto` (Инструкция) \| `notes` (Конспект) \| `cheatsheet` (Шпаргалка) \| `course` (Курс); `meta.layout` `single_doc` \| `modular_course`
- Soft warning `PROSE_LOCALE_MIXED` для смешанной кириллицы/латиницы в непустых `lessons[].body` (вне code fences)
- `suggest` levers: «конспект темы», «курс / модуль с занятиями»; `commandHint` → `export learning`
- Для **`format=course`** + profile/level: модуль `kind: overview` и seed `glossary[]` из topics; поля `lessons[].footnotes`

### Изменено

- **`skill impact` → `sdm.skill.impact/v2`:** плюс `questions[]` и `exports[]` (скан `exports/`); MCP/CLI/about синхронизированы
- **MCP schema hygiene:** у всех параметров tools есть Zod `.describe()` (подсказки в Cursor/host UI); усилены tool-level descriptions; `AGENTS.md` Tools включает `player_sync` / studio bridge; тест `ABOUT_MCP_TOOLS` ≡ `TOOL_NAMES`
- **EN tagline** → **Methodology-as-Specs Framework** (было Spec-based Methodology Framework): `ABOUT.md` / `about.tagline`, CLI banner `--version`, MCP `initialize` description, `package.json`, README, VERSIONING, `openspec/config.yaml`, player template. Ближе к RU **methodology-as-specs**. Обновить локальный player: `sdm player sync --force`
- **`suggest` / guide-suggest:** русские формулировки coverage — **пробел(ы)** / не покрыто / слабо покрыто вместо «дыра/дыры»
- **EN tagline** → **Spec-based Methodology Framework** (было Resource Assessment): `ABOUT.md` / `about.tagline`, CLI banner `--version`, MCP `initialize` description, `package.json`, README, VERSIONING, `openspec/config.yaml`, **player** (`templates/.../player/index.html` tagline + lead). Историческое Spec+RA — только этимология, не живой слоган. Обновить локальный player: `sdm player sync --force`
- **RU one-liner позиционирования:** «SDM — фреймворк methodology-as-specs: онтология навыков → библиотека контента → профили/пороги → аудит покрытия и экспорт» (`ABOUT.md` / `about.what`, README, player lead, `agents/explain-sdm`, `openspec/config.yaml` + main spec `about-sdm`). Якорь без изменений: один скелет для **оценки** и **обучения**. Обновить локальный player: `sdm player sync --force`
- **Позиционирование** (`ABOUT.md` / `about` / MCP `about`, README, `agents/explain-sdm`, `openspec/config.yaml`): methodology-as-specs pipeline выше; аудитория — **владельцы компетенций** (HR, рекрутеры, методологи, аналитики, профильные специалисты). Не LMS / не HR testing UI
- **`format=concept`** deprecated → нормализуется в `notes` + warning `FORMAT_CONCEPT_DEPRECATED`
- Skill `agents/export-course/`: курс ≠ howto (definition-first, без «Проблема/Модель/…» и без «Якоря практики» в body); locale + glossary/footnotes
- Player **Курсы**: overview первым, сноски/глоссарий, практика только из `practiceQuestionIds` — `player sync --force`

### Исправлено

- Player **Курсы**: полный блок «Термины курса» больше не повторяется на каждом уроке — один раз в разделе «Справочник»; под уроком — **Сноски** (`lessons[].footnotes` или термины glossary, относящиеся к topic/тексту). Обновить локальный player: `sdm player sync --force`

## [0.9.0-alpha.1] - 2026-08-01

Minor (prerelease): сводный `quality report` / corpus intake + индекс portable skills.

### Добавлено

- **`quality report`** / MCP **`quality_report`** — сводный отчёт качества `sdm.quality.report/v1` (режимы methodology | corpus | diff): вердикт, оценка 1–5, матрица плотности ●○○, topActions, глоссарий, persist `.sdm/reports/quality/`, `--diff <id>`; human text `--locale ru|en` (по умолчанию ru). Детальный `audit` не заменяется
- Corpus scan → `sdm.corpus.manifest/v1` (эвристики по `.md`, без LLM в core)
- Portable skill **`agents/quality-report/`**; рычаг suggest «сводный отчёт качества»

### Изменено

- **Индекс агентов:** `AGENTS.md` (CLI/MCP `quality report` / `quality_report`), `ABOUT.md` workflow, `intent-loop` → corpus через `quality-report`, `about` nextSteps `quality-report`

## [0.8.0] - 2026-07-23

Minor: export course learning pack, agent quality loop, player course reader.

### Добавлено

- **`export course`** / MCP **`export_course`** — learning pack `sdm.export.course/v1`: TeachingContext (skills/topics/graph/question anchors), learning-readiness warnings, controls `depth` (`brief`|`standard`|`detailed`) + `format` (`howto`|`concept`|`cheatsheet`), scope profile/level / `--from-gaps` / `--skill` / `--topic` / `--from-questions`, `--plan-only`, `--strict-context`; practice ids из той же library, что `export test`. Не LMS — prose уроков пишет агент после HITL. Skill: `agents/export-course/`
- **`suggest`**: next-step `export-course` + русские levers («короткая инструкция», «с деталями и примерами», «только по дырам», …); `agents/guide-suggest/` handoff на `export-course`
- **Agent quality loop:** `question validate` / MCP `question_validate` (dry-run `errors[]`/`findings[]`); shared validate pipeline на `question add`; `quality.writeGate` / `skillGate` / `coverageMode` (`legacy`|`blueprint`) в `sdm.yaml`; blueprint `workItems` в `cert gaps` / `cert coverage` `--json`; richer `question generate` briefs (`mustCoverTopic`, `avoidNearIds`); `suggest` → `harden-quality` до export; skills `generate-questions` / `close-coverage` / `guide-suggest` + `AGENTS.md` / `agents/README`
- **`guide-suggest`:** приоритет harden/gaps над export; levers «проверь черновик» / topics / writeGate; handoff на validate→rewrite
- **Player course reader:** static player принимает `sdm.export.course/v1` рядом с тестами; вкладки **Тесты** | **Курсы**; библиотека курсов (отдельный scoped localStorage); reader с листанием уроков (markdown preview, stub при пустом body); practice handoff по `practiceQuestionIds` → фильтрованная test-сессия, если paired `export test` уже загружен. Не LMS. Обновить: `sdm player sync --force`
  - UX polish: title из module.title при отсутствии top-level `title`; line-oriented markdown (`## Зачем` + списки); меньше дублей в crumb/outline; practice в `<details>` с подписями `005 — {text вопроса}` из `questionAnchors` (полный id в tooltip)

## [0.7.0] - 2026-07-23

Minor: host wire (MCP + skills), product version SSOT, MCP sidebar key `SDM`.

### Добавлено

- Единый SSOT продуктовой версии: корневой `package.json` + `getProductVersion()`; скрипты `npm run version:sync` / `version:check` (в `verify`)
- `sdm mcp install` по умолчанию ставит и portable skills (`--no-skills` чтобы только MCP); `--json` поле `skills`
- Шаблоны `sdm init` (README / AGENTS) и console Next: host wire через `mcp install`, multi-project без `--project`

### Изменено

- **BREAKING:** дефолтный ключ MCP в хостах — `SDM` (было `sdm`); Cursor/GigaCode sidebar показывает ключ конфига. `mcp install` мигрирует legacy `sdm` → `SDM`. Override: `--name`
- MCP `initialize`: `title` **SDM**, `description` «Spec-based Resource Assessment Framework · v…», `version` из SSOT
- README больше не хардкодит «текущая версия X.Y.Z» — смотри CHANGELOG / `sdm --version`
- `GETTING_STARTED.md` / `connect-mcp` / README MCP: happy path без обязательного `--project`; skills входят в `mcp install`
- `about` / `ABOUT.md`: tagline → «Spec-based Resource Assessment Framework»; `what` — единый слой методологии и экспорт потребителям (без старого «Оценивай навыки…»)

### Исправлено

- `sdm --version` / `about` / MCP version больше не расходятся из‑за разных `package.json` и устаревших dep pins

## [0.6.0] - 2026-07-23

Minor: export skill/question filters, option shuffle, distractor quality, player library scope.

### Добавлено

- **`export test --include-skill` / `--exclude-skill`** (XOR) и **`--include-question`** — подмножество skills / exact question ids; `meta.skillFilter` / `meta.questionFilter` / `meta.weightsNormalized`; MCP `includeSkills` / `excludeSkills` / `includeQuestions`; коды `EXPORT_SKILL_*`, `EXPORT_QUESTION_NOT_FOUND`, `EXPORT_FILTER_EMPTY`
- **`export test --shuffle-options`** (+ `--seed` shared with adaptive) — перестановка choice `options` с remap `correct`; `meta.optionShuffle`; MCP `shuffleOptions`
- Плеер: опция «Перетасовывать варианты» (`localStorage` `sdm.player.shuffleOptions`), независимо от shuffle вопросов
- **`quality.distractorQuality`** в `sdm.yaml` (`off` | `soft` | `strict`): audit findings position bias / length outliers; `question add` reject `DISTRACTOR_QUALITY` в `strict`
- Agent guidance: длина/правдоподобие дистракторов в `agents/generate-questions/`

### Исправлено

- Плеер: библиотека «Загруженные тесты» изолирована по пути проекта (`localStorage` `sdm.player.lib.<scope>.*`) — новый `init` / другой каталог не показывает тесты чужого проекта; опции сессии по-прежнему общие

## [0.5.0] - 2026-07-23

Minor: author-preview player, Profile domain, suggest/about, type-mix/type-filter export, cert reweight.

### Добавлено

#### Product identity / guidance

- **`sdm about [--json]`** / MCP **`about`** — канон позиционирования (`ABOUT.md`); skill `agents/explain-sdm/`
- **`sdm suggest [--profile] [--level] [--json]`** / MCP **`suggest`** — next actions + русские levers; skill `agents/guide-suggest/`

#### Export test player

- Статический `player/` при `sdm init`; **`sdm player sync [--force] [--json]`** / MCP `player_sync`
- Session UX: список `exports/` (HTTP), **Начать**, автопереход, таймер, крошки / клик **SDM** → главная; RU UI
- Библиотека экспортов («Загруженные тесты»): multi JSON, `localStorage`, **Начать**/**Удалить** на строке
- Опция «Перетасовывать вопросы» (default выкл.); shuffle при каждом **Начать**

#### Вопросы / экспорт / веса

- **`question generate --mix single|mixed|full`**; intent plan `seed.typeMix`; audit hint при mono-type
- Поле **`expected`** на `open`; `question add --expected`; прокидывание в `export test`
- **`export test --include-type` / `--exclude-type`** (XOR); MCP `includeTypes` / `excludeTypes`
- Инвариант весов: `sum(weight) ≈ 1`; **`sdm cert reweight`**; audit `weightSumInvalid`

#### Profile / agents / MCP

- Portable skill `agents/intent-loop/`; `sdm intent validate-plan`; **`sdm profile create`** / MCP `profile_create`
- Portable skill **`agents/bootstrap-profile-pack/`** (stub в `bootstrap-role-pack/`)
- **`sdm agent hosts` / `sdm agent install --hosts cursor,gigacode|all`**
- MCP tools: optional arg **`project`**; shell tab-completion (`sdm completion install`)

### Изменено (BREAKING)

- **`cert patch --add-requirement`** требует явный `--from skill:amount`; **`--remove-requirement`** требует `--absorb-into`
- Домен **Role → Profile**: YAML `profile:`, `certifications/profiles/`, тип `Profile`, коды `PROFILE_*`
- CLI/MCP флаги **`--role` → `--profile`** (без алиаса); JSON export — поле `profile`
- **`cert create`** требует существующий профиль (`PROFILE_NOT_FOUND`); убран `--role-title` и автосоздание профиля
- Level/team YAML: поле `profile` (compat-read legacy `role` / `roles/`)
- `profile create --force` обновляет title и **сохраняет** существующие `levels`
- Docs/skills: human path = интент агенту; порядок **profile create → skills → cert create**

### Изменено

- `mcp install`: **не** пишет `SDM_PROJECT_ROOT` по умолчанию; `--project` — опциональный default
- `AGENTS.md`: `intent-loop` / `explain-sdm` / `guide-suggest` как entry points; терминология **профиль**
- README: «что делает / не делает», три слоя онтологии, about/suggest/player/reweight

## [0.4.3] - 2026-07-19

Patch: HITL pack для основы роли (plan → confirm → execute).

### Добавлено

- Portable skill `agents/bootstrap-role-pack/` — план основы роли → подтверждение → skills/cert/seed/verify (опционально `export test`)
- Указатели в `AGENTS.md`, `GETTING_STARTED.md`, `agents/README.md`

## [0.4.2] - 2026-07-19

Patch: онбординг GigaCode + журнал действий для пилота.

### Добавлено

- [`GETTING_STARTED.md`](./GETTING_STARTED.md) — OSS-онбординг с акцентом на **GigaCode** + MCP (`doctor` smoke)
- README / `AGENTS.md` / `agents/connect-mcp`: GigaCode-first; Cursor как альтернатива
- Журнал действий: `.sdm/logs/sdm.log` + `error.log` (NDJSON, ротация); CLI и MCP; `SDM_LOG=0` выключает

## [0.4.1] - 2026-07-19

Patch: multi-host MCP install (не только Cursor).

### Добавлено

- `sdm mcp hosts [--json]` — реестр хостов MCP (`cursor`, `gigacode`)
- `sdm mcp install --hosts <csv>|all` — установка в выбранные хосты; `--cursor` — алиас
- Хост `gigacode` (experimental): merge в `~/.gigacode/settings.json` (`--gigacode-home` / `--config`)
- `sdm mcp config --host <id>` — превью пути и payload без записи

## [0.4.0] - 2026-07-19

Minor: ядро методологии, достаточное для пилота (граф → покрытие по глубине → аудит/поиск → teams/экспорт).

### Добавлено

#### Онтология / покрытие (0.2)

- Ядро графа навыков + `skill graph` / `skill impact`; защита от циклов в `skill link`
- Опциональные `topics`; покрытие/gaps с учётом глубины; `question generate` учитывает пробелы по depth/topic

#### Аудит / поиск (0.3)

- `sdm audit`; MCP `audit`; skill `agents/audit-methodology/`
- Offline PoC семантического индекса: `index rebuild` / `search` (`search.provider: lancedb`)

#### Teams / экспорт (0.4)

- Оверлеи `certifications/teams/`; `--team` в coverage/gaps/export
- `export confluence`; `export test --adaptive`
- Паритет MCP: `export_confluence`, `index_rebuild`, `search`; параметры team/adaptive в tools
- `cert coverage` / `gaps`: ненулевой exit при `hasThin` (глубина или число вопросов)

### Нет в 0.4.0

- Анализ / сравнение кандидатов, RGB-спектр, внешние HR-коннекторы
- Настоящий векторный поиск LanceDB + embeddings (есть offline JSON PoC под флагом `lancedb`)
- MCP HTTP (есть stdio MCP)
- Интерактивные TTY-мастера (осознанно — ставка на agent-first)

## [0.3.0] - 2026-07-19

Minor: аудит методологии и offline семантический индекс.

### Добавлено

- `sdm audit [--role … --level …] [--json]`; MCP `audit`; skill `agents/audit-methodology/`
- Offline PoC семантического индекса: `sdm index rebuild`, `sdm search` при `search.provider: lancedb` (JSON-индекс, без скачивания модели)
- В audit добавляется `semanticDuplicates`, если индекс уже построен

## [0.2.0] - 2026-07-19

Minor после 0.1.7: граф навыков и depth-aware coverage.

### Добавлено

#### Онтология

- Граф навыков в core: `buildSkillGraph` / `detectCycles` / `assertAcyclicDepends`
- `skill link` отклоняет рёбра `depends_on`, образующие цикл (`CYCLE_DETECTED`)
- `sdm skill graph --role … --level … [--no-coverage] [--json]` — дерево навыков с coverage-барами (`sdm.skill.graph/v1`)
- `sdm skill impact --skill … [--json]` — downstream skills / roles / levels (`sdm.skill.impact/v1`)
- MCP tools `skill_graph`, `skill_impact`; portable skill `agents/explore-ontology/`

#### Библиотека / покрытие

- Опциональные `topics` у skills и questions (`--topic` repeatable)
- **BREAKING** depth-aware `cert coverage` / `cert gaps`: `achievedDepth`, `depthRatio`, `uncoveredTopics`, `missingDifficultyBand`, `hasThin` (ok = count≥3 и depthRatio≥0.9)
- `question generate` учитывает depth/topic gaps в контексте для агента

## [0.1.7] - 2026-07-19

Patch после 0.1.6: Mermaid-экспорт графа покрытия.

### Добавлено

#### Экспорт

- `sdm export mermaid --role … --level … [--no-coverage] [--json]` — Markdown + Mermaid-граф навыков с раскраской по coverage (`sdm.export.mermaid/v1`)
- MCP tool `export_mermaid`

## [0.1.6] - 2026-07-19

Patch после 0.1.5: автотесты MCP и import-safe server.

### Добавлено

#### Разработка / качество

- Автотесты `@spec-driven-methodology/mcp` (handlers на temp-project): `doctor`, `question_list`, `cert_gaps`, `export_test`
- `npm test` / `npm run verify` включают suite `@spec-driven-methodology/mcp` (после `@spec-driven-methodology/core`)
- MCP: tool registration вынесена в `server.ts` (import без старта stdio)

## [0.1.5] - 2026-07-19

Patch после 0.1.4: экспорт методологии для потребителей.

### Добавлено

#### Экспорт

- `sdm export test --role … --level … [--format json|csv] [--json]` — пакет вопросов + requirements для потребителей (`sdm.export.test/v1`)
- `sdm export matrix --role … [--format csv|json] [--json]` — матрица компетенций role×levels (`sdm.export.matrix/v1`)
- MCP tools `export_test`, `export_matrix`; portable skill `agents/export-methodology/`

## [0.1.4] - 2026-07-19

Patch после 0.1.3: cert patch и автоподключение MCP.

### Добавлено

#### Сертификации

- `sdm cert patch --level … [--add-requirement] [--set-requirement] [--remove-requirement] [--title] [--desc] [--threshold] [--json]` — правка requirements без recreate level
- MCP tool `cert_patch`

#### MCP / агенты

- `sdm mcp config [--json]` — сниппет Cursor MCP с абсолютными путями (без ручного редактирования)
- `sdm mcp install --cursor [--cursor-root] [--project] [--json]` — merge в `.cursor/mcp.json`
- Portable skill `agents/connect-mcp/`

## [0.1.3] - 2026-07-19

Patch после 0.1.2: agent-first question generate.

### Добавлено

#### Библиотека

- `sdm question generate --to-skill … [--count] [--difficulty-min/max] [--role] [--level] [--json]` — контекст + draft shells для агента (без записи файлов и без вызова LLM в core)
- Portable skill `agents/generate-questions/`; MCP tool `question_generate`

## [0.1.2] - 2026-07-19

Patch после 0.1.1: agent read-ops и stdio MCP.

### Добавлено

#### Библиотека / сертификации

- `sdm question list [--skill <id>] [--json]` — инвентарь вопросов для агентов
- `sdm cert gaps --role … --level … [--json]` — только `missing` / `thin` skills (подмножество coverage)

#### MCP

- Пакет `@spec-driven-methodology/mcp` — stdio MCP-сервер (`sdm-mcp`) с tools: `doctor`, `init`, `skill_add`, `skill_link`, `cert_create`, `cert_coverage`, `cert_gaps`, `question_add`, `question_list`
- Рабочий каталог = methodology project (или `SDM_PROJECT_ROOT`)

## [0.1.1] - 2026-07-19

Patch после 0.1.0: cert create, автотесты core, portable bootstrap skill.

### Добавлено

#### Agents

- Portable skill `agents/bootstrap-methodology/` — greenfield loop: `skill add` → `cert create` → `question add` → `cert coverage --json`
- `AGENTS.md` / `agents/README.md`: bootstrap vs close-coverage; close-coverage отсылает к bootstrap, если структуры ещё нет

#### Разработка / качество

- Автотесты `@spec-driven-methodology/core` (temp-dir fixtures): `parseRequirementTriple`, `addSkill` / `linkSkill`, `addQuestion`, `createCertification`, `computeCoverage`
- `npm test` (workspace → `@spec-driven-methodology/core`) и единый `npm run verify` (build → typecheck → test)

#### Сертификации

- `sdm cert create --role … --role-title … --level … --level-title … --requirement skill:depth:weight … [--threshold] [--force] [--json]`
- Upsert роли (merge `levels`), запись level YAML; навыки в requirements должны существовать в ontology
- Level id уникален в проекте (PoC)

## [0.1.0] - 2026-07-19

Первый публичный PoC на GitVerse (`kotler/specra`). Agent-first CLI и portable skills.

### Добавлено

#### Methodology-проект

- `sdm init` / `sdm init --with-examples` — каркас ontology, library, certifications, `.sdm/`, `AGENTS.md`
- `sdm doctor` — проверка, что текущий каталог — проект SDM

#### Онтология (навыки)

- `sdm skill add <id> --name … [--category] [--desc] [--force] [--json]`
- `sdm skill link <id> --depends-on a,b [--related-to x,y] [--json]`
- YAML в `ontology/skills/` с валидацией Zod; слияние связей при link; запрет зависимости на себя

#### Библиотека (вопросы)

- `sdm question add --to-skill … --type … --difficulty … --text … [--option] [--correct] [--json]`
- Валидация схемой вопроса; генерация id; отказ перезаписывать без `--force`

#### Сертификации

- `sdm cert coverage --role … --level … [--json]`
- Эвристики покрытия по числу вопросов (`missing` / `thin` / `ok`, порог по умолчанию — 3)
- Ненулевой exit code, если у требуемого навыка 0 вопросов; `--json` для агентов

#### Агенты

- Portable skills в `agents/` (не только Cursor): `agents/close-coverage`
- Корневой `AGENTS.md` — точка входа для любого coding-агента

#### Платформа

- TypeScript monorepo: `@spec-driven-methodology/cli`, `@spec-driven-methodology/core`
- Разработка через OpenSpec (`openspec/specs`: project-root, cert-coverage, question-add, skill-write)
- Лицензия: Apache-2.0

### Нет в 0.1.0

Исторический снимок на момент первого PoC (часть пунктов закрыта в 0.1.2–0.4.0; актуальное «ещё нет» — в `[Unreleased]` и последних релизах).

- MCP-сервер, AI-генерация вопросов (`question generate`), векторный поиск → позже: MCP с 0.1.2, generate с 0.1.3, поиск PoC с 0.3.0
- `skill graph` / детект циклов графа кроме self-dep → с 0.2.0
- Mermaid / `export test` → с 0.1.5–0.1.7
- Анализ / сравнение кандидатов — по-прежнему вне ядра
- Интерактивные TTY-мастера (осознанно — ставка на agent-first)

[Unreleased]: https://gitverse.ru/kotler/specra/compare/v0.9.0-alpha.2...HEAD
[0.9.0-alpha.2]: https://gitverse.ru/kotler/specra/compare/v0.9.0-alpha.1...v0.9.0-alpha.2
[0.9.0-alpha.1]: https://gitverse.ru/kotler/specra/compare/v0.8.0...v0.9.0-alpha.1
[0.8.0]: https://gitverse.ru/kotler/specra/compare/v0.7.0...v0.8.0
[0.7.0]: https://gitverse.ru/kotler/specra/compare/v0.6.0...v0.7.0
[0.6.0]: https://gitverse.ru/kotler/specra/compare/v0.5.0...v0.6.0
[0.5.0]: https://gitverse.ru/kotler/specra/compare/v0.4.3...v0.5.0
[0.4.3]: https://gitverse.ru/kotler/specra/compare/v0.4.2...v0.4.3
[0.4.2]: https://gitverse.ru/kotler/specra/compare/v0.4.1...v0.4.2
[0.4.1]: https://gitverse.ru/kotler/specra/compare/v0.4.0...v0.4.1
[0.4.0]: https://gitverse.ru/kotler/specra/compare/v0.3.0...v0.4.0
[0.3.0]: https://gitverse.ru/kotler/specra/compare/v0.2.0...v0.3.0
[0.2.0]: https://gitverse.ru/kotler/specra/compare/v0.1.7...v0.2.0
[0.1.7]: https://gitverse.ru/kotler/specra/compare/v0.1.6...v0.1.7
[0.1.6]: https://gitverse.ru/kotler/specra/compare/v0.1.5...v0.1.6
[0.1.5]: https://gitverse.ru/kotler/specra/compare/v0.1.4...v0.1.5
[0.1.4]: https://gitverse.ru/kotler/specra/compare/v0.1.3...v0.1.4
[0.1.3]: https://gitverse.ru/kotler/specra/compare/v0.1.2...v0.1.3
[0.1.2]: https://gitverse.ru/kotler/specra/compare/v0.1.1...v0.1.2
[0.1.1]: https://gitverse.ru/kotler/specra/compare/v0.1.0...v0.1.1
[0.1.0]: https://gitverse.ru/kotler/specra/releases/tag/v0.1.0
