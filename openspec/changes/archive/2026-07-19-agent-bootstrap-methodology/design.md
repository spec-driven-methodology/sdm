## Context

Shipped CLI covers ontology write, cert create, question add, and coverage JSON. Portable skill `close-coverage` assumes role/level/skills already exist and only closes gaps. Greenfield intents («собери Middle по Docker») have no first-class playbook.

## Goals / Non-Goals

**Goals:**
- Portable skill documenting the ordered loop: `skill add` → `cert create` → `question add` → `cert coverage --json`
- Clear split: bootstrap (create structure) vs close-coverage (fill gaps)
- Index in `AGENTS.md` / `agents/README.md`; cross-link from close-coverage when prerequisites missing
- Prefer `--json` and SdmError codes; no YAML hand-edits

**Non-Goals:**
- New CLI, schema, or core logic
- Merging both skills into one file
- Interactive prompts / AI generation

## Decisions

1. **New skill, not expand close-coverage**
   - Path: `agents/bootstrap-methodology/SKILL.md`
   - Frontmatter `name: sdm-bootstrap-methodology`; description triggers on empty/new role, new cert, “bootstrap methodology”, “add skill and certification”
   - Alternative: fatten close-coverage — rejected; different intent and failure modes (exists vs missing)

2. **Step order (fixed)**
   1. `sdm doctor` (or `init` if user asked to create a project)
   2. `skill add` for each required skill (`--json`); optional `skill link`
   3. `cert create` with `--requirement skill:depth:weight` triples (`--json`)
   4. Seed questions via `question add` (enough to leave missing, or toward thin/ok — agent asks human how deep)
   5. `cert coverage --role … --level … --json` and report `hasMissing` / per-skill status
   - After bootstrap, hand off to `close-coverage` for remaining thin/missing

3. **Inputs the agent must collect**
   - Role id/title, level id/title
   - Skill ids (+ names); at least one requirement triple
   - Optional: how many questions per skill (default: 1 to prove loop, note that `ok` needs `minOkQuestions`)

4. **close-coverage delta (docs only)**
   - Early guard: if coverage fails with role/level not found, or human wants new skills first → point to `bootstrap-methodology`
   - Do not duplicate the full create sequence inside close-coverage

5. **Docs surface**
   - `AGENTS.md` skills table + keep command cheat sheet
   - `agents/README.md` row for bootstrap
   - CHANGELOG Unreleased; README agents table if present
   - On archive: add `bootstrap-methodology` to `openspec/config.yaml` baseline list

6. **Verification**
   - No new unit tests required (docs-only)
   - Smoke optional: temp dir `init` → follow skill steps with `--json` (playground or mkdtemp); not committed

## Risks / Trade-offs

- [Agents confuse bootstrap vs close-coverage] → explicit “When to use” in both skills + README table
- [Skill drifts from CLI flags] → reference CHANGELOG; use same flag names as `AGENTS.md` cheat sheet
- [Agent stops after one question; coverage still missing] → skill states threshold and suggests close-coverage next

## Migration Plan

- Docs-only ship; no runtime migration
- Existing close-coverage users unchanged except one cross-link paragraph

## Open Questions

- None blocking. Follow-up: `sdm init` template `AGENTS.md` could mention both skills by name.
