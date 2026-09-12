## Context

Today every agent seed path biases to `single_choice`:

- `question generate` defaults `type` to `single_choice` and stamps that type on every draft
- Portable skills say «prefer single_choice unless the user asks otherwise»
- Intent / profile-pack `seed.type` defaults to `single_choice`
- Coverage/gaps ignore type diversity — only counts, depth, topics

`export test` does **not** filter by type; mono-radio packages are a library symptom. Sibling change `export-test-player` adds `expected` for auto-checkable `open` answers — this change assigns `open` in mixes and relies on that field for machine-checkable text (coordinate apply order: expected schema before or with open stubs that include `expected`).

Stakeholders: methodologists (NL intent), agents (CLI/MCP), consumers of export packages.

## Goals / Non-Goals

**Goals:**

- First-class **type-mix presets** controllable by agents/humans: only single-answer, 2–3-type mix, and a «full» preset reserved for expanding active types
- Deterministic per-draft type assignment in `question generate` (+ `--json`)
- Intent / bootstrap seed plans and portable skills respect the preset
- Light audit signal when a skill library is mono-type (advisory)
- Clear catalog of **deferred** types (matching, sorting, dropdown_answer, code auto-check) so they are not invented ad hoc

**Non-Goals:**

- Implementing matching / sorting / dropdown_answer / code runners
- Failing coverage `ok` for lack of type diversity
- Changing export filtering or schemaVersion
- LMS / candidate runtime

## Decisions

### D1 — Presets: `single` | `mixed` | `full`

| Preset | Active types assigned today | Intent |
|---|---|---|
| `single` (default) | `single_choice` only | Backward-compatible; «только одиночный выбор» |
| `mixed` | `single_choice`, `multi_choice`, `open` | Микс 2–3 автопроверяемых типов |
| `full` | Same active set as `mixed` until more types ship | API/name reserved; when deferred types become active, `full` expands first; `mixed` stays the simple 3-type set |

**Active type set** is an explicit constant in `@spec-driven-methodology/core` (e.g. `ACTIVE_MIX_TYPES`). Deferred types MUST NOT appear in assignments until implemented and added to that set.

Alternatives considered: free-form `--types a,b,c` only — useful later as advanced override; presets are the agent-first primary UX.

### D2 — Assignment algorithm (deterministic)

For count `N` and ordered active list `T` for the preset:

- draft `i` (0-based) gets `T[i % T.length]`
- Stable across runs (no RNG) so agents can re-generate shells predictably
- Optional later: bias toward underrepresented types vs existing library — out of v1

When `--type <QuestionType>` is passed **without** `--mix`, behavior stays homogeneous (current). When `--mix <preset>` is passed, per-draft types come from the preset. Passing **both** `--type` and `--mix` SHALL fail with a stable SdmError (e.g. `TYPE_MIX_CONFLICT`) so agents get a clear contract.

### D3 — Open stubs and `expected`

For `open` drafts under mix:

- Stub includes placeholder `text` and, when schema supports it, `expected` placeholder(s) (coordinate with `question-expected-answer`)
- Agent prompt instructs: fill short answer + `expected`; persist via `question add --expected …`
- If `expected` is not yet in schema when this lands first, stub still uses `type: open` and prompt says to add expected once available — prefer applying expected change first or same release

`code` remains in schema but is **not** in active mix sets for this change.

### D4 — Intent / bootstrap seed

Extend `seed` on `sdm.intent.plan/v1`:

- `typeMix`: enum `single` | `mixed` | `full`, default `single`
- Keep `seed.type` for backward compatibility: when `typeMix` is `single`, `seed.type` MAY still force a homogeneous non-default type (e.g. all `multi_choice`); when `typeMix` is `mixed`/`full`, `seed.type` is ignored (or rejected if set to something other than default — prefer ignore + warning in validate JSON for simplicity)

Skills ask for mix only when human mentions diversity / «микс» / «разные типы»; otherwise default `single`.

### D5 — Audit finding (non-blocking)

When `library.questionCount >= 3` and all questions for a skill share one `type`, audit MAY add a **low/medium** recommendation suggesting `question generate --mix mixed` — does not change coverage status. No new required CLI flag.

### D6 — Module placement

- New small module `@spec-driven-methodology/core` e.g. `question-type-mix.ts`: presets, resolve types for count, Zod enum, error codes
- Wire into `question-generate.ts`, CLI/MCP flags, `intent-plan.ts`, audit recommendation helper
- No new package

### D7 — Deferred type catalog (documentation + constant)

Record in design/spec and CHANGELOG/AGENTS footnote:

| Future / LMS name | Specra stance now |
|---|---|
| `dropdown_answer` | UI presentation of single answer — not a domain type |
| `matching` | Deferred domain type |
| `sorting` | Deferred domain type |
| `code` (auto) | Type exists; not in active mix; criteria-only |

## Risks / Trade-offs

- [Agents ignore `--mix` and still pass `--type single_choice`] → Mitigation: skills + intent plan + generate JSON show `typeMix` and per-draft `type`; examples in skill
- [Open without `expected` breaks player auto-check] → Mitigation: coordinate with `export-test-player`; generate stubs request `expected`
- [`full` == `mixed` today looks redundant] → Mitigation: document expansion path; keeps NL («полный микс») stable
- [Type diversity noise in audit] → Mitigation: low priority, threshold ≥3 questions, mono-type only

## Migration Plan

1. Ship core resolver + `question generate --mix` + tests (default unchanged)
2. Intent plan `typeMix` + skill text updates
3. Audit advisory
4. Docs/CHANGELOG
5. No data migration; existing YAML valid

Rollback: remove flag / ignore `typeMix` (default single).

## Open Questions

1. Should `full` today differ from `mixed` (e.g. higher open ratio) even before complex types? **Proposal: identical assignment until deferred types join.**
2. Apply order vs `export-test-player` — prefer expected field in same release train as open-in-mix.
