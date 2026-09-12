## Context

Parents: `methodology-studio` (UI shell), `methodology-studio-bridge` (push/pull/serve). Export CLI already supports `--include-type`, `--adaptive`, `--per-skill`, `--seed`, `--shuffle-options`, etc. Studio must not invoke export.

## Goals / Non-Goals

**Goals:** Dynamic export-form in view docs; `export_test` action; Player handoff via serve + UI link.

**Non-Goals:** In-browser export execution; slice D coverage UI; learning export form.

## Decisions

1. **export-form phase shape** (inside `sdm.studio.view/v1`):
   ```json
   {
     "kind": "export-form",
     "id": "export-test",
     "title": "Экспорт теста",
     "target": "export_test",
     "defaults": { "profile": "…", "level": "…" },
     "fields": [
       { "id": "includeTypes", "widget": "multi", "label": "Типы вопросов",
         "options": [{"label":"single choice","value":"single_choice"}, …] },
       { "id": "adaptive", "widget": "boolean", "label": "Адаптивная выборка" },
       { "id": "perSkill", "widget": "number", "label": "На навык", "min": 1, "max": 20 },
       { "id": "seed", "widget": "number", "label": "Seed" },
       { "id": "shuffleOptions", "widget": "boolean", "label": "Перетасовать варианты" }
     ]
   }
   ```
   Widgets: `multi` | `boolean` | `number` | `text`. Options always from JSON.

2. **Action** `type: "export_test"` with `values` (field id → value) + optional `defaults` echo (profile/level). Agent maps to CLI flags.

3. **Serve mounts** (read-only): `/player/*` → `player/`, `/exports/*` → `exports/` (404 if missing). Same path-safety as studio static. Bridge API unchanged.

4. **UI flow:** After plan (or standalone), show export-form when phase present; **Экспортировать тест** → emit action (+ POST bridge); panel with handoff **Открыть Player** → `/player/` when on serve, else `../player/index.html` + hint to load JSON from `exports/`.

5. **Fixture:** extend `demo-view.json` with export-form after plan (profile/level from plan).

## Risks / Trade-offs

- [Agent must map values→CLI] → Document mapping in studio README.  
- [file:// Player link weak] → Prefer `studio serve` for handoff.

## Migration

`studio sync --force` for UI; no YAML migration.
