## Context

Static player under `packages/core/templates/methodology/player/` is an author-preview surface for `sdm.export.test/v1`. Course packs (`sdm.export.course/v1`) are produced by `export course` with modules/lessons and practice question ids only. `parseDocument` currently rejects any other `schemaVersion`. Library + localStorage exist for tests only (`player-export-library`).

No CLI/Zod schema change: player is client-side JS template synced via `player sync`.

## Goals / Non-Goals

**Goals:**

- Accept and preview course JSON alongside tests
- Home tabs Тесты | Курсы with typed libraries
- Lesson paging (module → lesson) with lightweight markdown
- Optional practice via intersection with loaded test pack questions

**Non-Goals:**

- LMS progress, accounts, SCORM
- Changing export course/test document schemas
- npm/CDN markdown dependency
- Server-side player runtime

## Decisions

1. **Dual parse by schemaVersion** — Single entry (`parseIncomingJson`) routes to `parseTestDocument` / `parseCourseDocument`. Unknown schema → clear RU error listing both expected versions. Alternatives: separate upload buttons (worse UX when discovering `exports/`).

2. **Tabs filter library, not raw storage dump** — Persist tests and courses under distinct scoped keys (e.g. `…exportLibrary` vs `…courseLibrary`) reusing existing project-path scoping. Active tab hides the other list and test session options on Курсы. Alternatives: one mixed list with badges (noisier; conflicts with session-option chrome).

3. **Flat lesson index for nav** — Flatten `modules[].lessons[]` into ordered lessons with module title breadcrumbs; prev/next walks that list. Outline sidebar jumps by index. Alternatives: only module-level pages (hides topic lessons).

4. **Local markdown subset** — Escape HTML first, then apply a tiny subset (ATX headings, fenced/inline code, lists, bold/italic, paragraphs). No external lib. Empty/whitespace body → stub «Нет текста урока».

5. **Practice handoff** — Collect module (or whole-course) `practiceQuestionIds`; scan all loaded test packs for matching question objects; if non-empty intersection, start a synthetic/ephemeral test session from those questions (reuse run-view). If none loaded → show ids as text only. Do not invent question payloads from course JSON.

6. **exports/ discovery** — When listing `../exports/*.json`, peek `schemaVersion` and offer add into the matching library; wrong-tab auto-switch optional but preferred when user clicks a course file while on Тесты.

## Risks / Trade-offs

- [Partial markdown] → Complex lesson prose may render imperfectly; acceptable for author preview; escape-first avoids XSS from untrusted JSON.
- [Practice requires second file] → Matches export-course design (ids only); document in README.
- [Template sync] → Existing projects need `player sync --force` (or equivalent) to pick up UI; same as prior player changes.

## Migration Plan

1. Ship template changes in core.
2. Authors run `sdm player sync` (force if needed) in methodology projects.
3. No data migration; new localStorage keys coexist with existing test library keys.

## Open Questions

None for MVP — decisions locked in the approved plan.
