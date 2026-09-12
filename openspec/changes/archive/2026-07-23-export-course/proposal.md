## Why

Assessment-пилот доказал цикл «профиль → skills → вопросы → export test». Обратный consumer — обучение из той же онтологии — нужен, но тонкий skeleton «skill → module → practice ids» не закрывает боль пилота: бедный граф, пустые description/topics и слабые question anchors дают слабый учебный текст. Нужен learning pipeline, где Specra усиливает **вход** (TeachingContext + quality warnings + controls глубины), а агент после HITL пишет prose снаружи.

## What Changes

- Переработка `export-course` из «пустого каркаса» в **plan/brief → generate → export**:
  - машиночитаемый **TeachingContext** (skills, topics, depends_on/related_to, cert depth/weight, question anchors);
  - **quality warnings** на тонкий граф / пустой description / пустые topics / thin practice / вопросы без explanation;
  - управление контентом: `depth` (`brief` | `standard` | `detailed`) и `format` (`howto` | `concept` | `cheatsheet`);
  - scope по тем же ключам: profile/level, `--from-gaps`, `--skill`, `--topic`, `--from-questions`.
- Экспорт `sdm.export.course/v1`: modules/lessons + practice из реальных question ids; prose (`lessons[].body`) заполняет агент, не core LLM.
- CLI/MCP domain ops (`export course`, опционально `course plan` / brief) с `--json` и стабильными `SdmError`.
- Portable agent skill: intent → clarify controls → show brief+warnings → HITL → generate → export.
- Снять planning-freeze «только идея»: change готов к `/opsx:apply` после ревью tasks.

## Capabilities

### New Capabilities

- `export-course`: learning pipeline — TeachingContext/brief, content controls, course pack export (`sdm.export.course/v1`), practice anchors из library; без LMS runtime

### Modified Capabilities

- (нет — `export-test` и assessment specs не меняют требования; learning — отдельный consumer)

## Impact

- `@spec-driven-methodology/core`: TeachingContext builder, quality warnings, `exportCourse` + Zod schema
- `@spec-driven-methodology/cli` / MCP: `export course` (+ brief/plan flags), error codes
- `agents/export-course/`, `AGENTS.md`, README/CHANGELOG
- Потребители: порталы/mini-apps по JSON-контракту; demo на methodology с skills/topics/questions

## Non-goals

- LMS / player обучения / прогресс / video / SCORM / pass-fail сессии
- Обязательная CMS `library/lessons/` в v1 (open question / follow-up)
- LLM внутри `@spec-driven-methodology/core`
- Смешение схем `export.test` и `export.course`
- Личные траектории кандидата в ядре (только methodology gaps + явный scope)
