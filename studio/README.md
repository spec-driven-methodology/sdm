# SDM Methodology Studio

Авторская оболочка для просмотра view-документов intent-loop и передачи действий
исполнителю (агент / CLI / API).

**Не пишет** методологию YAML. **Не LMS.** Экспорт и генерация вопросов — снаружи.

| Документ | schemaVersion |
|---|---|
| View | `sdm.studio.view/v1` |
| Action | `sdm.studio.action/v1` |

Фазы: `clarifications` · `plan` · `coverage` · `export-form`.

## Sync

```bash
sdm studio sync --force
```

## Мост

```bash
sdm studio push-view view.json --json
# или живое покрытие:
sdm studio push-coverage --profile <p> --level <l> --json
sdm studio serve
sdm studio pull-action --json --consume
```

Serve: `/` studio · `/player/` · `/exports/` · `/bridge/*`

## Покрытие / пробелы

Статусы в UI: **не покрыто** (`missing`) · **слабо покрыто** (`thin`) · **покрыто** (`ok`).

- **Закрыть пробел** → action `close_gap` `{ skill, profile, level }`
- Чипы suggest → `suggest_lever` `{ phrase, mapsTo, … }`

Агент после `close_gap`: `question generate` / `question add` / skill `close-coverage`.

## Экспорт

Форма `export-form` → action `export_test` → агент `export test …` → **Открыть Player**.
