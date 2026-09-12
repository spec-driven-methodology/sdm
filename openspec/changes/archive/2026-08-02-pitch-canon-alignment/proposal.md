## Why

Leadership pitch (`sdm-presentation`) already frames Specra as an **эталон** with a clear system picture (specs · framework · agent) and an explicit «not a full agent harness» boundary. Product canon (`ABOUT.md` / `about`) lags that language, so agents and docs risk under-explaining value and over-promising agent runtime.

## What Changes

- Enrich `ABOUT.md` positioning (`what` / `whatNot` / `model` + prose): эталон / SSOT beside the competency skeleton; system picture (YAML in git · framework rules · agent+model; CLI/MCP as agent hands); value levers (single control point → impact/coverage → export to surfaces); university/bootcamp as **context examples**, not a new audience type.
- Add `whatNot`: not a full agent harness / model orchestrator.
- Sync dependent surfaces: README, GETTING_STARTED, AGENTS, explain-sdm, MCP/CLI `about` descriptions, player/studio leads, `openspec/config.yaml`.
- Delta requirements in `about-sdm` for harness whatNot + эталон/system-picture language.
- Bump identity `0.9.0-alpha.2` → `0.9.0-alpha.3`; CHANGELOG section for the cut.

## Non-goals

- No pitch agenda / timer / pilot-ask / langchain4j chat demos in product docs.
- No EN tagline change; no major/minor/patch/stage cut (prerelease build only).
- No new CLI/MCP tools; no runtime command logic; no LMS/HR candidate UI.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `about-sdm`: positioning MUST convey эталон/SSOT + system picture; `whatNot` MUST reject full agent harness/orchestration; explain-sdm anti-patterns aligned.

## Impact

- Docs/identity: `ABOUT.md`, README, GETTING_STARTED, AGENTS, agents/explain-sdm, CHANGELOG, openspec config + main `about-sdm` on archive.
- Machine-facing: MCP `TOOL_DESCRIPTIONS.about`, CLI `about` `.description`, about tests.
- Templates: player/studio lead copy.
- Agent-first: `about` / explain-sdm remain the identity path; richer paraphrase without inventing ops.
- Version: root + workspaces → `0.9.0-alpha.3`.
