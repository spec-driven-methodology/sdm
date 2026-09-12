## Why

Методолог уже может инициализировать methodology-проект и заполнить YAML, но не видит, закрывает ли библиотека вопросов требования сертификации. Без этой обратной связи дыры (например, skill в requirements без вопросов) остаются незамеченными. `cert coverage` — первый вертикальный slice, который делает Specra полезным сразу после `init`.

## What Changes

- Новая CLI-команда `sdm cert coverage --role <role> --level <level>`
- Поиск корня methodology-проекта (`sdm.yaml`) от cwd вверх
- Загрузка и валидация level/role YAML и библиотеки вопросов
- Расчёт покрытия: число вопросов на каждый `requirement.skill`
- Текстовый отчёт со статусами ✅ / ⚠️ / ❌ (простые эвристики + константы)
- Non-zero exit code, если есть навыки с 0 вопросов

## Non-goals

- AI-генерация вопросов
- `export test` / Mermaid
- analyze / compare кандидатов
- vector search / LanceDB / MCP
- полный CRUD для skill / question / cert (только чтение существующих YAML)

## Capabilities

### New Capabilities

- `project-root`: обнаружение корня methodology-проекта по `sdm.yaml`
- `cert-coverage`: расчёт и отчёт покрытия вопросов относительно требований уровня

### Modified Capabilities

- (нет — основных specs ещё нет)

## Impact

- `@spec-driven-methodology/core`: загрузка YAML, эвристики покрытия, поиск project root
- `@spec-driven-methodology/cli`: команда `cert coverage`
- Проверка на `playground` после `sdm init --with-examples` (docker → ❌)
