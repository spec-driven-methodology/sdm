## Context

Parent: archived `methodology-studio` — static shell + sync, fixture confirm/reject via download. Goals slice B: live bridge without cloud. Executor remains agent/CLI.

## Goals / Non-Goals

**Goals:**

- Agent writes view → Studio shows it → user confirms → agent reads action → agent runs domain CLI.
- File SSOT: `.sdm/studio/current-view.json`, `.sdm/studio/last-action.json`.
- Thin `studio serve` so the browser can read/write those files via localhost HTTP.

**Non-Goals:** MCP tools, export UI, coverage UI, methodology mutation from serve/Studio.

## Decisions

1. **Files under `.sdm/studio/` (not inside `studio/`)**  
   Keeps authored template assets separate from ephemeral bridge state; `studio sync --force` cannot wipe the inbox. Init `.gitignore` adds `.sdm/studio/`.

2. **CLI push/pull as primary agent API; serve for browser only**  
   - `studio push-view <file|-> --json` validates `schemaVersion === sdm.studio.view/v1`, writes `current-view.json`.  
   - `studio pull-action --json [--consume]` reads `last-action.json` (404/empty → stable error or `{ ok:true, action:null }`); `--consume` deletes after read.  
   - `studio serve [--port 4173]` Node `http` server: static `project/studio/*`, `GET /bridge/view`, `POST /bridge/action` (body = action JSON), `GET /bridge/status`. No CORS to arbitrary origins needed if UI is same-origin. Bind `127.0.0.1` only.

3. **Serve must not write ontology/library/certifications/sdm.yaml**  
   Only bridge JSON paths + static GET of studio assets.

4. **Studio client**  
   On load, `fetch('/bridge/status')`; if ok, enable «Мост» mode: poll view every N seconds or button «Загрузить из моста»; on emitAction also `POST /bridge/action`. Offline/file:// keeps download path.

5. **Validation**  
   Light check in core (schemaVersion + object); full Zod optional later. Invalid view → SdmError `STUDIO_VIEW_INVALID`.

6. **No MCP in this iterate** — about lists CLI only.

## Risks / Trade-offs

- [Serve is a long-running process] → Document stop with Ctrl+C; default localhost-only.  
- [Race on last-action] → Single-writer UI; pull `--consume` for agents.  
- [Poll noise] → Modest interval (2s) + manual refresh button.

## Migration Plan

- Existing projects: `studio sync --force` for UI; init gitignore on new projects; document manual `.gitignore` line for old projects in README.

## Open Questions

None for B — file + localhost serve chosen over agent-only push without serve.
