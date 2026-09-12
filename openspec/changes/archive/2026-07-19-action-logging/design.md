## Context

Сейчас CLI/MCP пишут только в stdout/stderr сессии. Methodology-проект уже имеет `.sdm/` (index/cache). Журнал логично класть туда же, чтобы ехал вместе с проектом и не смешивался с чужими глобальными логами GigaCode.

## Goals / Non-Goals

**Goals:**

- Один вызов = одна строка NDJSON в `sdm.log`.
- Ошибки дополнительно (или дублем) в `error.log`.
- Ротация без внешних deps (простой size-based rename).
- Работает для CLI и MCP; агент может приложить файл к багрепорту.

**Non-Goals:** см. proposal.

## Decisions

1. **Расположение:** `<projectRoot>/.sdm/logs/sdm.log` и `error.log`.
   - `projectRoot` = `findProjectRoot` / `SDM_PROJECT_ROOT`; если вне проекта — fallback `~/.sdm/logs/` (чтобы `mcp hosts` / install вне methodology тоже что-то писали) **или** no-op. **Default: no-op вне methodology** (меньше сюрпризов); CLI `init` после создания проекта начинает логировать.
   - Alternative: всегда `~/.sdm` — отвергнуто для пилота (лог рядом с YAML удобнее).

2. **Формат:** одна строка NDJSON на событие (удобно `jq` / grep).
   ```json
   {"ts":"2026-07-19T20:00:00.000Z","source":"cli","action":"cert.gaps","args":{"role":"…"},"ok":true,"durationMs":12,"summary":{"hasMissing":true}}
   ```

3. **Ротация:** при превышении `maxBytes` (default 2 MiB) → `sdm.log.1` … до `maxFiles` (default 5); то же для `error.log`. Без gzip в PoC.

4. **Config** в `sdm.yaml` (опционально):
   ```yaml
   logging:
     enabled: true
     maxBytes: 2097152
     maxFiles: 5
   ```
   Env: `SDM_LOG=0` выключает; `SDM_LOG=1` включает даже если config false? → env wins for disable (`0`/`false`/`off`).

5. **API в core:** `appendActionLog(entry)` / `withActionLog(fn)`.
   - Redact: deep walk keys matching `/pass|token|secret|authorization|api[_-]?key/i` → `[REDACTED]`.
   - Truncate string values > 500 chars; arrays/objects depth-limited in `args`/`summary`.

6. **CLI wiring:** тонкая обёртка в начале/конце `.action` (или helper `runLogged("cert.gaps", args, async () => …)`). Не логировать сырой help/`--help`.

7. **MCP wiring:** wrap в `okJson`/`errJson` или единый `runTool(name, args, fn)` — предпочтительно один helper, чтобы все tools покрылись.

8. **Errors:** при `ok:false` или throw → строка в `sdm.log` **и** append в `error.log` (дубль полного NDJSON, не только message).

9. **`.gitignore`:** `.sdm/logs/` (и при необходимости оставить `.sdm/index` как было).

## Risks / Trade-offs

- [Большие exports] → только summary (`format`, counts), не full document.
- [MCP stdio pollution] → log **только в файл**, никогда в stdout (ломает MCP).
- [Perf] → sync append ок для PoC; flush per line.
- [Secrets in question text] → redact keys only; question text may still appear in summary — document; avoid logging full question bodies by default (ids/counts).

## Migration Plan

Additive; default enabled in project. Ship under Unreleased; docs RU.

## Open Questions

- Log `mcp install` when not in methodology? **no-op** unless `--project` resolves root.
- `sdm logs path` CLI? **Optional later** — docs enough for PoC.
