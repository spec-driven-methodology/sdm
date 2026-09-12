## Why

Agent workflows that close coverage (`question generate` → `question add`, bootstrap / close-coverage skills) default to `single_choice`. Methodologists never ask for a type mix, so libraries and `export test` packages become all-radio even though the schema already allows `multi_choice` and `open`. There is no first-class control for «только одиночный выбор», «микс 2–3 типов» или «полный микс» — only an easy-to-miss `--type` on a single draft.

## What Changes

- Introduce a **type-mix policy** for question drafting/persistence planning: presets `single`, `mixed`, `full` (names TBD in design), selectable via CLI/`--json` and intent plans.
- `question generate` (and agent skills that seed questions) SHALL emit a **per-draft type assignment** according to the policy instead of always `single_choice`.
- Portable skills (`generate-questions`, `close-coverage`, `bootstrap-*`, `intent-loop`) SHALL pass/respect the mix policy; humans can say «закрой дыру с миксом» without naming flags.
- Optional **type diversity** signal in audit/gaps context (informational): when a skill’s library is mono-type under a non-`single` policy, recommend diversifying — without failing coverage `ok` by default.
- Document **deferred domain types** (not implemented): `matching`, `sorting`, `dropdown_answer` (UI-only for single answer), and deeper `code` auto-check. In-scope auto-checkable types for mix: `single_choice`, `multi_choice`, `open` (short text; `expected` from sibling change `export-test-player` / `question-expected-answer`).

## Capabilities

### New Capabilities

- `question-type-mix`: presets, draft type assignment, agent/CLI contract for mix when generating or seeding questions

### Modified Capabilities

- `question-generate`: accept mix policy; stubs use assigned types (not always `single_choice`)
- `methodology-audit`: optional finding when library type diversity is low (non-blocking)
- `intent-loop`: clarify/plan may carry type-mix preference; default remains `single`
- `bootstrap-role-pack`: profile-pack seed plan accepts `typeMix`; seed via generate respects it

## Impact

- `@spec-driven-methodology/core`: mix resolver, `question-generate`, optional audit finding; Zod for policy enum/options
- `@spec-driven-methodology/cli` / MCP: flags/args for mix on `question generate` (+ plan fields)
- `agents/**`, `AGENTS.md`, CHANGELOG, README — agent-first wording
- Depends on / coordinates with in-progress `export-test-player` for `open.expected` (auto-checkable text); this change does not own the player
- Agent-first: domain op + `--json`; stable error if unknown mix preset

## Non-goals

- Implementing `matching`, `sorting`, `dropdown_answer`, or code runtime validation
- Making Specra an LMS / candidate exam runner
- Changing export schemaVersion or filtering export by type
- **BREAKING** change of default mix: default stays `single` (current behavior) unless the human/agent opts into mix
- Requiring type diversity for coverage status `ok`
