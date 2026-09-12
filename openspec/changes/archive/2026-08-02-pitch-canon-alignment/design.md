## Context

Product identity SSOT is `ABOUT.md` frontmatter → `buildAbout()` → CLI/MCP `about`. Pitch deck language (эталон, specs·framework·agent, harness boundary, single control point / surfaces) is ahead of that canon. No runtime ops change — copy, specs, tests, and a prerelease build bump.

## Goals / Non-Goals

**Goals:**

- Align `what` / `whatNot` / `model` and human ABOUT prose with pitch positioning without breaking the RU one-liner pipeline.
- Keep agent-first path: explain-sdm → `about --json`.
- Ship dependent docs/MCP/CLI descriptions/templates/openspec context in one change.
- Identity `0.9.0-alpha.3` via explicit `npm run version:build`.

**Non-Goals:**

- Pitch meeting chrome, demo chats, pilot vectors as product claims.
- Tagline or stage cut; new tools; YAML schema changes.

## Decisions

1. **Extend `what` lightly, expand prose + `whatNot`** — Keep the methodology-as-specs one-liner; add эталон/SSOT as a short clause or companion sentence in frontmatter `what` / body. Full system picture lives in ABOUT body + README (payload `what` stays agent-scannable).
2. **Harness as `whatNot` bullet** — Normative rejection of «полный harness / оркестратор агентов» so about tests can assert it.
3. **University/bootcamp in `model` as contexts** — Phrase as example settings for competency owners, not replacement of HR/recruiters/methodologists.
4. **Docs cascade from ABOUT** — README value block («контроль из одной точки»), GETTING_STARTED blurb, AGENTS first line, explain-sdm table/anti-patterns, MCP/CLI about descriptions, player/studio leads, `openspec/config.yaml` context.
5. **Bump once at end of apply** — `version:build` after content edits; verify via `compile` (no auto-bump).

## Risks / Trade-offs

- [Risk] Payload `what` becomes too long for agents → Mitigation: keep frontmatter `what` to one short paragraph; detail in ABOUT body.
- [Risk] «Поверхности» overused jargon → Mitigation: use once in README/ABOUT with examples (тест / обучение / матрица).
- [Risk] Accidental second bump via `npm run build` → Mitigation: use `verify`/`compile` during work; single `version:build` before verify.

## Migration Plan

1. Edit ABOUT + dependents + tests.
2. `npm run version:build` → `0.9.0-alpha.3`.
3. `npm run verify`; smoke `about --json`.
4. Archive syncs `about-sdm` main spec.
5. Workspace `docs/idea.md` / rules / skill mirror outside product commit.
