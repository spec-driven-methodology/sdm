# SDM export player

Авторский preview для пакетов:

- `sdm export test` → `sdm.export.test/v1`
- `sdm export learning` (alias `export course`) → `sdm.export.course/v1`
- `sdm export kit` → `sdm.export.kit/v1`

**Не защищённый экзамен и не LMS** — author preview артефактов эталона. Ответы/проза лежат в JSON. Прогресс обучения не сохраняется.

## Установка / обновление

```bash
sdm player sync          # только отсутствующие файлы
sdm player sync --force  # обновить player/ из шаблонов SDM
```

Не трогает `ontology/`, `library/`, `certifications/`, `sdm.yaml`.

## Режимы: Тесты | Курсы | Шпаргалки

На главной переключатель вкладок:

| Вкладка | Документ | Действие |
|---|---|---|
| **Тесты** | `sdm.export.test/v1` | библиотека → **Начать** → сессия с проверкой |
| **Курсы** | `sdm.export.course/v1` | библиотека → **Открыть** → листание уроков |
| **Шпаргалки** | `sdm.export.kit/v1` | библиотека → **Открыть** → модули, вопросы эксперту, чеклист |

HTML kit (`export kit --format html`) — отдельный файл для интервьюера; во вкладку **Шпаргалки** загружайте **JSON** kit.

Пустой блок «Нет вопросов для интервьюера» значит: в библиотеке есть только тестовые вопросы с вариантами — добавьте **открытые вопросы с объяснениями** в Библиотеку SDM и пересоберите шпаргалку.

Библиотеки раздельные (разные ключи `localStorage`, тот же project scope по пути к `player/`). Параметры сессии (shuffle / timer) видны только на вкладке Тесты.

Список `exports/*.json` (HTTP) классифицируется по `schemaVersion` и фильтруется текущей вкладкой.

## Тесты

Объём N задаёт **автор** при экспорте, не плеер:

```bash
sdm export test --profile <profile> --level <level> > exports/test.json
# выборка:
sdm export test --profile <profile> --level <level> --adaptive --seed 42 --per-skill 3
```

1. Откройте `player/index.html` (удобнее через локальный static server — виден список `exports/*.json`).
2. Вкладка **Тесты** → загрузите JSON (список / drag-drop / picker) → **Загруженные тесты**.
3. У пакета **Начать** (рядом **Удалить**). Повторная загрузка того же имени обновляет запись.
4. Опции сессии (глобальные в `localStorage` origin): автопереход, shuffle вопросов/вариантов, лимит времени.
5. Статистика в конце (в т.ч. weighted vs threshold).
6. На главную — **SDM** или крошка «Главная».

## Курсы

```bash
sdm export learning --profile <profile> --level <level> --depth standard --format course \
  --locale ru --json > exports/course.json
# formats: howto|notes|cheatsheet|course (Инструкция / Конспект / Шпаргалка / Курс)
# level + format=course → leading module kind=overview + glossary term candidates
```

1. Вкладка **Курсы** → загрузите course JSON → **Открыть**.
2. Outline модулей слева (модуль **О курсе** первым, если `kind: overview`); урок справа. **Назад** / **Далее** листают уроки по порядку.
3. Пустой `body` → stub «Нет текста урока»; структура всё равно листается.
4. Meta: depth / format / locale; блок warnings из экспорта, если есть.
5. **Сноски** — под текстом **текущего** урока: явные `lessons[].footnotes`, иначе термины из `glossary`, относящиеся к topic/тексту урока. Полный блок **Термины курса** (`glossary`) — один раз в конце оглавления (раздел «Справочник»), не на каждой странице.
6. **Практика модуля:** только из `practiceQuestionIds` (секция «Якоря практики» в body не нужна и не используется UI). Course JSON **не** содержит полных вопросов — только id.
   - Если на вкладке Тесты уже загружен paired `export test` с этими id → кнопка **Пройти практику** запускает фильтрованную test-сессию.
   - Иначе id показаны текстом; загрузите test pack и откройте курс снова.

## Качество вариантов (методология)

Bias «верный первый / самый длинный» закрывается так:

- runtime: опция плеера и/или `sdm export test --shuffle-options --seed <n>`
- библиотека: `quality.distractorQuality: soft|strict` в `sdm.yaml` + `sdm audit --json`
