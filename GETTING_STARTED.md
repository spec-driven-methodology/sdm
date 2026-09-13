# Быстрый старт SDM (GigaCode + MCP)

**SDM (Spec-Driven Methodology)** — методология обращения с методическими артефактами как со спецификациями: онтология → профиль → покрытие → экспорт; основной UX — через AI-агента (intent → plan → confirm → CLI/MCP), не ручной набор флагов.

Цель: скачать sdm-cli, собрать CLI/MCP, создать methodology-проект и подключить **GigaCode**, чтобы агент видел tools SDM.

Пакеты пока **не** публикуются в npm — установка из git (GitHub: `spec-driven-methodology/sdm-cli`).

## 1. Требования

- **Node.js** ≥ 20.19 и npm
- **git**
- **GigaCode CLI** (experimental-адаптер SDM; конфиг по умолчанию `~/.gigacode/settings.json`)

## 2. Clone, сборка, link

```bash
git clone <url-репозитория-sdm.git>
cd sdm
npm install
npm run link:cli       # build + link CLI/MCP (prerelease: auto …-alpha.N)
# или без bump identity:
npm run link:refresh   # compile + link CLI/MCP + completion
# + переустановить MCP в хосты:
# npm run link:refresh -- --mcp
```

Проверка:

```bash
sdm --version          # ASCII SDM + core … / mcp … (см. VERSIONING.md)
sdm mcp hosts --json
```

Ожидайте две строки версий с одинаковой identity (`core` и `mcp`). Формат и bump: [`VERSIONING.md`](./VERSIONING.md).

Tab-completion ставится при `build` / `link:cli` / `link:refresh`. `link:cli` на prerelease ещё поднимает `…-alpha.N`; `link:refresh` — нет. После первого раза: `source ~/.zshrc` (или новый терминал), затем `sdm `<Tab> / `sk`<Tab>.

Ожидайте в списке хостов `gigacode` (experimental) и `cursor`.

Если clone перенесёте в другой путь — снова `link:refresh -- --mcp` (или `build` + `mcp install`), иначе в settings останутся старые абсолютные пути. После refresh перезапустите MCP в хосте и сверьте `about` / `--version`.

## 3. Methodology-проект

Отдельный каталог (не обязательно внутри репозитория SDM):

```bash
mkdir ~/my-methodology && cd ~/my-methodology
sdm init --with-examples
sdm doctor
```

Ожидайте: `OK: SDM project at …`. Примеры synthetic (`java-developer` / `middle`) — без реальных данных.

## 4. Подключить MCP + skills к GigaCode (основной путь)

`sdm init` создаёт methodology, но **не** ставит MCP/skills в IDE. Wire — отдельно.

```bash
# превью: путь settings, mcpEntry (без привязки к одному methodology)
sdm mcp config --host gigacode --json

# один MCP на хост + portable skills (intent-loop, …) по умолчанию
# не передавайте --project — multi-project; tool arg project = methodology
sdm mcp install --hosts gigacode --json
# пишет mcpServers.SDM (ключ сайдбара; protocol name остаётся sdm)
# только MCP без skills: добавьте --no-skills
# skills отдельно (если уже ставили MCP раньше): sdm agent install --hosts gigacode --json
```

Если settings лежат не в `~/.gigacode`:

```bash
sdm mcp install --hosts gigacode --gigacode-home /path/to/.gigacode --json
```

Или явно: `--config /path/to/settings.json` (только путь MCP; skills всё равно ставятся, если нет `--no-skills`).

**Не** вставляйте пути к `packages/mcp/dist/index.js` вручную — только через CLI.
Повторный `mcp install` без `--project` снимает устаревший `SDM_PROJECT_ROOT`.

## 5. Reload в GigaCode

Перезапустите GigaCode / перезагрузите MCP **и skills** (как принято в вашей сборке CLI, часто команда вроде `/mcp`).

Убедитесь, что сервер SDM в списке MCP и tools доступны, и что видны portable skills.

## 6. Smoke-чеклист

- [ ] В GigaCode вызывается MCP tool **`doctor`** с arg `project` = абсолютный путь к methodology → успех
- [ ] (опционально) агент или CLI: `sdm doctor` в каталоге methodology
- [ ] Сводный отчёт качества: MCP **`quality_report`** или `sdm quality report --profile … --level … --json` (матрица ●○○); для папки сырых `.md` — `--sources <dir>` до bootstrap
- [ ] (опционально) актуальность контента: MCP **`content_stale`** или `sdm content stale --profile … --level … --json` после правок онтологии
- [ ] В списке MCP tools есть `quality_report` и `content_stale` (если нет — rebuild + reload MCP в хосте)
- [ ] Агент видит portable skills SDM (`intent-loop`, `quality-report`, `close-staleness`, …) после `mcp install` (или отдельного `agent install`)

## 6.1. Дальше — как пользователь (без CLI)

**CLI и флаги — для агента и CI, не для методолога.** Вы пишете намерение агенту.

Пример:

> Хочу основу профиля Java-разработчик, уровень Middle, направление backend. Сначала уточни детали и покажи план, без записи до моего подтверждения.

Агент должен вести цикл **intent-loop**: уточнения → план → confirm → исполнение → результат (покрытие / что создано).

Сущность методологии: **профиль** (Profile), не «роль» как job title.

Skill: [`agents/intent-loop/`](./agents/intent-loop/SKILL.md). Для агентов (приложение): [`AGENTS.md`](./AGENTS.md).

### 6.2. Мульти-проект: одна MCP для N папок методологии

Один сервер SDM MCP (один `mcp install`) работает с любым количеством проектов. Агент для каждого вызова:

1. Узнаёт текущий проект: **`locate_project({ dir: <рабочая директория пользователя> })`** → получает `root` + `name`
2. Передаёт `project: <root>` во все остальные MCP-инструменты

При переключении между папками — снова `locate_project`. Инструменты `locate_project` и `list_projects` доступны в MCP с версии 1.1.0.

## 7. Troubleshooting

| Симптом / код | Что сделать |
|---------------|-------------|
| `MCP_NOT_FOUND` | `npm run build` в clone SDM; проверить, что `@spec-driven-methodology/mcp` собирается |
| `HOSTS_REQUIRED` | Указать `--hosts gigacode` (в non-TTY нельзя вызывать install без hosts) |
| `UNKNOWN_HOST` | `sdm mcp hosts --json` |
| `VALIDATION_FAILED` | Починить JSON в `settings.json` / указать `--config` |
| `doctor` / Not a SDM project | Передать tool arg `project` (или optional `SDM_PROJECT_ROOT`) на каталог с `sdm.yaml` |
| После переноса clone MCP «битый» | Снова `mcp install --hosts gigacode` (пути к dist перезапишутся) |
| `AGENTS_NOT_FOUND` | `agent install`: указать `--agents-root` или `SDM_HOME` |
| `npm install` падает за proxy | Настроить registry/proxy в окружении; SDM это не обходит |

Адаптер **gigacode** — experimental: путь и формат settings могут отличаться в вашей сборке CLI.

## 8. Журнал действий

В methodology-проекте SDM пишет NDJSON в:

- `.sdm/logs/sdm.log` — все вызовы CLI/MCP
- `.sdm/logs/error.log` — только ошибки (дубль из общего потока)

Ротация по размеру (см. опциональный блок `logging` в `sdm.yaml`). Выключить: `SDM_LOG=0`. Каталог `.sdm/logs/` в `.gitignore`.

## 9. Другие хосты (Cursor)

```bash
# --cursor-root = корень IDE workspace (не обязательно каталог methodology)
sdm mcp install --hosts cursor --cursor-root /path/to/ide-workspace --json
```

Список адаптеров: `sdm mcp hosts --json` / `sdm agent hosts --json`.

Подробнее по продукту: [`README.md`](./README.md), changelog: [`CHANGELOG.md`](./CHANGELOG.md).

## 10. Obsidian-интеграция (плагин не нужен)

SDM не требует собственного Obsidian-плагина. Используются **Cortex** (MCP-мост к vault) и **OpenCode** (агент внутри Obsidian).

```bash
# из корня vault — всё настроит одной командой
./scripts/obsidian-setup.sh

# откат (удаление созданных артефактов, с backup)
./scripts/obsidian-setup.sh --undo
```

Скрипт: проверяет зависимости → находит vault → сканирует SDM-проекты → пишет `opencode.json` (SDM + Cortex) → кладёт `AGENTS.md`. Подробнее: `docs/obsidian-integration.md`.

Откат: `--undo` удаляет созданные `opencode.json` и `AGENTS.md` (с backup по умолчанию, `--purge` без backup). Удаляются только vault-локальные артефакты; глобальные MCP-конфиги (Claude Desktop, Cursor) только предупреждаются.

**Установка плагинов Obsidian (один раз):**
- **Cortex** (поиск в Community Plugins) — MCP-сервер внутри Obsidian на порту 27182
- **OpenCode** (поиск в Community Plugins) — терминал OpenCode в сайдбаре

Multi-project: vault может содержать несколько `sdm.yaml`. Агент через `list_projects` / `locate_project` находит нужный проект и передаёт `project` в каждый MCP-вызов.
