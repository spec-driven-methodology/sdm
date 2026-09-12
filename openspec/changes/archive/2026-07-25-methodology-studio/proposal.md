## Why

Competency owners dislike raw CLI and often do not want chat as the only surface. Specra already has a static `player/` for export preview, but no thin visual shell for the intent-loop (plan → confirm → result). Slice A introduces Methodology Studio: a separate static UI next to `player/` that only renders view documents and emits actions for an external executor (agent/CLI/API).

## What Changes

- Ship template `packages/core/templates/methodology/studio/` (HTML/CSS/JS), visual language aligned with `player/`.
- `sdm init` seeds `studio/`; new `sdm studio sync [--force] [--json]` refreshes it without touching methodology YAML.
- Document machine contracts `sdm.studio.view/v1` and `sdm.studio.action/v1`; fixture-driven UI renders clarifications + plan and emits confirm/reject (and clarification answers) as JSON — no YAML writes from the browser.
- README in `studio/`; CHANGELOG / README / AGENTS / about capabilities updated for the public sync command.
- Russian UI copy; coverage wording uses «пробел» / «не покрыто» / «слабо покрыто» when present.

## Non-goals

- Live bridge / `studio serve` / MCP `studio_*` (later slices).
- Export-form UI, coverage explorer, chat-first UX, LMS/HR candidate UI.
- Generating questions/prose inside Studio; writing ontology/library/certifications from the UI.
- Merging authoring into `player/index.html`.

## Capabilities

### New Capabilities

- `methodology-studio`: static Studio shell, fixture render of view docs, action emit, Russian author-facing copy boundaries.
- `studio-sync`: install/refresh `studio/` via CLI (+ init seed), agent-readable `--json`, no methodology mutation.

### Modified Capabilities

- `getting-started`: init / onboarding mentions `studio/` alongside `player/` when present.
- `about-sdm`: capabilities list includes `studio sync` (and MCP only if added — not in this slice).

## Impact

- `@spec-driven-methodology/core`: studio sync helper (mirror `player-sync`), init copy path, about payload.
- `@spec-driven-methodology/cli`: `studio sync` command.
- Templates under `packages/core/templates/methodology/studio/`.
- Docs: CHANGELOG, README, AGENTS.md (command table / agent notes).
- Agent-first: `--json` on sync; Studio remains a display/dispatch client — executor stays CLI/MCP/agent.
