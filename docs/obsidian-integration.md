# Obsidian-интеграция SDM

Интеграция SDM с **Obsidian** позволяет методологу работать с методологией
(**навыки, вопросы, профили, уровни, экспорты**) через AI-агента, не выходя из
vault — используя готовые плагины экосистемы Obsidian.

**Форм-фактор:** не отдельный Obsidian-плагин SDM, а комбинация существующих
компонентов + лёгкий setup-скрипт, который настраивает всё за пользователя.

```
Obsidian vault
├── Cortex (MCP-server, порт 27182)   — доступ к файлам vault
├── OpenCode plugin (терминал)        — запуск агента внутри Obsidian
├── AGENTS.md                          — SDM-воркфлоу для агента
└── opencode.json                      — конфиг MCP (SDM + Cortex)

External MCP-клиенты (альтернатива OpenCode в Obsidian):
  MultiTool, Claude Desktop, Cursor — подключаются к тем же серверам
```

## Компоненты

| Компонент | Роль | Откуда |
|---|---|---|
| **Cortex** | MCP-сервер **внутри Obsidian**: opencode-агент читает/пишет файлы vault | Community Plugins (поиск «Cortex») |
| **OpenCode plugin** | Встраивает CLI OpenCode в сайдбар Obsidian | Community Plugins (поиск «OpenCode») |
| **SDM MCP** | Методология: навыки, вопросы, профили, экспорт | SDM (standalone) |
| **opencode.json** | Связывает SDM + Cortex в одном клиенте | Создаётся setup-скриптом |
| **AGENTS.md** | Инструкции агенту: воркфлоу, маршрутизация чтение/запись | Создаётся setup-скриптом |

## Установка

### 1. Требования

- **Obsidian** 1.5.0+ (desktop)
- **Node.js** ≥ 20.19
- **SDM** собран и **`sdm-mcp`** в PATH (`npm run link:cli`)
- **OpenCode CLI** (`npm install -g opencode-ai` / `brew install opencode`)

### 2. Установить плагины Obsidian

> **Важно: не перепутайте плагины.** В Community Plugins есть два похожих плагина:
> - **Cortex** (автор DoktorDaveJoos) — MCP-сервер внутри Obsidian, порт 27182. **Нужен нам.**
>   Не имеет своего UI, не требует Codex.
> - **Cortex Chat** (другой автор) — AI-чат в сайдбаре Obsidian со своим UI (папка `_cortex/`).
>   **Не нужен SDM.** У него Codex — опциональный локальный fallback, но нам это не требуется.

1. **Cortex** — Settings → Community plugins → Browse → «Cortex» (автор DoktorDaveJoos) → Install → Enable
2. **OpenCode** (опционально, для работы внутри Obsidian) — Browse → «OpenCode» → Install → Enable

Cortex автоматически стартует MCP-сервер на порту `27182` при запуске Obsidian.

### 3. Запустить setup-скрипт

```bash
# из корня vault
./scripts/obsidian-setup.sh

# или явно указать vault
./scripts/obsidian-setup.sh /path/to/vault

# превью без записи
./scripts/obsidian-setup.sh --dry-run /path/to/vault
```

Скрипт делает:

1. Проверяет зависимости: `node`, `sdm-mcp`, `opencode`
2. Находит vault (walk-up до `.obsidian/`)
3. Находит SDM-проекты в vault (файлы `sdm.yaml`)
4. Создаёт `opencode.json` с **SDM + Cortex** MCP
5. Кладёт `AGENTS.md` в корень vault
6. Проверяет, что порт Cortex `27182` свободен / занят

### 4. Перезапустить OpenCode

После установки:
- OpenCode в Obsidian: перезапустите плагин или перезагрузите Obsidian
- OpenCode CLI: перезапустите сессию

Проверка: спросите агента `list_folders` (Cortex) и `doctor` (SDM).

## Удаление / откат

Если что-то пошло не так, или нужно снять интеграцию (в т.ч. для повторного тестирования «поставил → удалил») — используйте cleanup:

```bash
# из корня vault — удалить всё, что создал setup (с backup)
./scripts/obsidian-setup.sh --undo

# то же самое, но без создания backup
./scripts/obsidian-cleanup.sh --purge
```

Что удаляется:

| Артефакт | Поведение |
|---|---|
| `opencode.json` | Удаляется всегда; backup `opencode.json.bak.<timestamp>` если не `--purge` |
| `AGENTS.md` | Удаляется **только** если создан setup-скриптом (заголовок `# AI agents — SDM`). Если файл был ваш — пропускается с предупреждением |
| Глобальные MCP-конфиги (Claude Desktop, Cursor, Windsurf) | **Не трогаются** — только предупреждение |

**Безопасность:** скрипт не удаляет:
- SDM-проекты (`sdm.yaml`, `ontology/`, `library/`, `certifications/`) — это ваш контент
- Плагины Obsidian (Cortex, OpenCode) — удаляются стандартно через Settings → Community plugins
- Ничего за пределами vault

Проверка после отката: файлы `opencode.json` и `AGENTS.md` отсутствуют.

## Multi-project

Vault может содержать **несколько** SDM-проектов:

```
vault/
├── java-backend/     ← sdm.yaml (name: java-backend)
├── qa-automation/    ← sdm.yaml (name: qa-automation)
└── some-notes/       ← не SDM
```

В этом случае `opencode.json` **не** задаёт `SDM_PROJECT_ROOT`. Агент:

1. Вызывает `list_projects(workspaceDir: "<vault-root>")` — список всех проектов
2. Вызывает `locate_project(dir: "<path>")` — к какому проекту относится путь
3. Передаёт `project: "<root>"` во **все** SDM MCP инструменты

Правило: **чтение vault — через Cortex; запись методологии — через SDM, всегда с `project`.**

## Формат opencode.json

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "sdm": {
      "type": "local",
      "command": ["sdm-mcp"]
    },
    "cortex": {
      "type": "remote",
      "url": "http://127.0.0.1:27182/mcp"
    }
  },
  "model": {
    "provider": "openai-compatible",
    "name": "deepseek-chat",
    "baseURL": "https://api.deepseek.com/v1"
  }
}
```

### Модели

SDM-агент работает через OpenCode. Модель задаётся в `opencode.json`:

| Провайдер | `provider` | `name` | `baseURL` |
|---|---|---|---|
| DeepSeek | `openai-compatible` | `deepseek-chat` | `https://api.deepseek.com/v1` |
| Ollama (локально) | `openai-compatible` | `llama3.1` | `http://localhost:11434/v1` |
| OpenAI | `openai` | `gpt-4o` | — |
| OpenRouter | `openai-compatible` | `deepseek/deepseek-chat` | `https://openrouter.ai/api/v1` |

API-ключ задаётся в переменной окружения (`DEEPSEEK_API_KEY`, `OPENAI_API_KEY` и т.д.).

## Формат AGENTS.md

Setup-скрипт кладёт в vault `AGENTS.md` со SDM-воркфлоу:

- **Data model (vault ↔ SDM)** — таблица соответствия путей и доменов
- **Multi-project workflow** — discovery (`list_projects` / `locate_project`), правило «всегда `project`»
- **Read vs. write routing** — таблица: чтение через Cortex, запись через SDM
- **Common workflows** — типовые запросы и соответствующие MCP-инструменты

## Модель работы (как пользователь)

1. Открыть Obsidian, открыть панель/терминал OpenCode
2. Написать намерение: «Хочу основу профиля Java-разработчик, уровень Middle, направление backend»
3. Агент: `locate_project` → `profile_create` → ... → результат

Чтение vault (заметки, документы, существующие YAML) — через Cortex.
Запись методологии (навыки, вопросы, профили, экспорт) — через SDM MCP.

## Troubleshooting

| Симптом | Причина | Решение |
|---|---|---|
| `list_folders` не работает | Cortex не запущен | Открыть Obsidian, включить плагин Cortex |
| `doctor` не работает | `sdm-mcp` не в PATH | `npm run link:cli` в репозитории SDM |
| Порт `27182` занят | Другой MCP-плагин (например `aaronsb/obsidian-mcp-plugin`) | Сменить порт в настройках Cortex или удалить конфликтующий плагин |
| Агент не видит SDM MCP | OpenCode не перезапущен | Перезапустить OpenCode / Obsidian |
| `PROJECT_ROOT_NOT_FOUND` | Не передан `project` в multi-project | Использовать `locate_project` → передать `project` |
| Модель не отвечает | Нет API-ключа | Задать `DEEPSEEK_API_KEY` / `OPENAI_API_KEY` |