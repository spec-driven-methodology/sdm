## Why

Внешним платформам (LMS, HR testing, обучение) нужен **стабильный upsert-ключ** для импортированного теста/курса. Сегодня в JSON есть `profile`, `level`, `meta.basis`, но нет поля «это тот же слот пакета». Без `id` повторный импорт плодит дубликаты; без `meta.revision` потребитель не отличит «пересобрали тот же пакет» от «новый слот».

## What Changes

- **`id`** (deterministic slug) в JSON `export test` и `export learning|course`.
- **`meta.revision`**: truncated hash от `basis.skills` + `basis.level` **без** `capturedAt`.
- Документировать контракт потребителя: upsert по `id`, свежесть по `meta.revision` / `meta.basis`.
- `export-artifacts` / `skill impact`: прокинуть `id` из export JSON при скане.

Wire `schemaVersion` остаётся v1 (additive fields). CSV без `id`. Старые exports не мигрируем.

## Capabilities

### Modified Capabilities

- `export-test`: package `id` + `meta.revision`
- `export-course`: package `id` + `meta.revision`

## Impact

- `@spec-driven-methodology/core`: `export-package-identity.ts`, `export.ts`, `export-course.ts`, `export-artifacts.ts`
- Tests, CHANGELOG, agent skills `export-methodology`, `export-course`, AGENTS

## Non-goals

- Postgres / publish / LMS API / коннекторы
- Реестр публикаций (`certifications/publications/`) — см. design «Future»
- Bump `schemaVersion` to v2
- `id` на matrix/mermaid/confluence
- Автозапись в `exports/<id>.json`
- Player library key migration

## Future (not this change)

Файловый реестр в git, когда появится коннектор:

```yaml
# certifications/publications/<id>.yaml
id: test-qa-manual-junior
kind: test
artifact: exports/qa-manual-junior-test.json
destinations:
  - platform: pulse
    remoteId: "8821"
    lastPushedRevision: "ff7c32f3fe02fa1b"
```
