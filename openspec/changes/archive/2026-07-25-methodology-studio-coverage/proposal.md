## Why

Slices A–C shipped Studio shell, bridge, and export-form. Authors still cannot see coverage gaps visually or kick off «закрыть пробел» without chat/CLI. Slice D from `docs/goals-methodology-studio.md`: render coverage/gaps + suggest levers as actions; Russian wording **пробел** / **не покрыто** / **слабо покрыто** (not «дыра»).

## What Changes

- View phase `kind: "coverage"`: skills with status `missing`|`thin`|`ok`, counts/ratios; optional embedded suggest suggestions/levers.
- Studio UI: coverage table/cards, per-skill **Закрыть пробел**, lever chips; emit `close_gap` / `suggest_lever` actions (no YAML writes, no question generation in UI).
- CLI `sdm studio push-coverage --profile --level [--json]`: build view from live `cert gaps` + `suggest` into `.sdm/studio/current-view.json`.
- Demo fixture coverage phase; docs/CHANGELOG; parent studio archives A–C.

## Non-goals

- Studio running `question add` / `generate` itself.
- MCP studio tools; LMS/HR analytics.
- Rewriting all product copy that still says «дыра» outside Studio (optional later).

## Capabilities

### New Capabilities

- `studio-coverage`: coverage phase + close_gap/suggest_lever actions + `studio push-coverage`.

### Modified Capabilities

- `methodology-studio`: render coverage phase and Russian gap labels.
- `about-sdm`: `capabilities.cli` includes `studio push-coverage`.
- `studio-bridge`: unchanged API; push-coverage writes the same current-view.json.

## Impact

- `@spec-driven-methodology/core`: build coverage view helper; CLI command; Studio template; ABOUT_CLI; tests; docs.
- Agent-first: push-coverage `--json`; executor handles close_gap via existing close-coverage / question generate skills.
