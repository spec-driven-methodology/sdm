## Context

Agent-first Specra: humans ask agents «что такое Specra?», but `AGENTS.md` is an ops index, `doctor` needs a methodology project, and MCP hosts often lack framework docs in context. Positioning lives in workspace `docs/idea.md` (outside the published product tree) and drifts from CHANGELOG/version. We need a product-identity surface that works with zero project cwd.

## Goals / Non-Goals

**Goals:**

- Short canon file in the Specra package (`ABOUT.md`) for what / what-not / agent-first / boundaries.
- `@spec-driven-methodology/core` assembler → stable JSON for CLI `--json` and MCP `about`.
- Works without a methodology project (unlike `doctor`).
- Portable skill + `AGENTS.md` routing so agents call `about` instead of inventing an HR-platform story.
- Capability lists prefer registered surface (commands / MCP tools / `agents/*/SKILL.md`), not README prose.

**Non-Goals:**

- Dumping `idea.md` or full CHANGELOG into the payload.
- Merging with `doctor` / project validation.
- Interactive wizard; semver bump for this change alone.
- Auto-sync of every README table forever (accept a maintained registry helper).

## Decisions

1. **Canon path: `ABOUT.md` at Specra package root** (next to `AGENTS.md`)
   - Human + agent readable; Russian or bilingual short sections matching product docs.
   - Alternatives rejected: only `AGENTS.md` section (ops doc stays ops); only code strings (no readable canon for humans browsing the repo).

2. **Core owns the contract: `buildAbout()` / `AboutPayload` (Zod)**
   - Fields (stable for agents):
     - `ok: true`
     - `version` — from Specra package root `package.json` (same line as product version)
     - `name`, `tagline` (short)
     - `positioning`: `{ what, whatNot: string[], model }` — loaded/derived from `ABOUT.md` (structured sections or frontmatter + body; keep parsing simple and tested)
     - `capabilities`: `{ cli: string[], mcp: string[], skills: { id, purpose }[] }`
     - `nextSteps`: `{ id, hint }[]` — at least `intent-loop`, `init`, `connect-mcp`
     - `pointers`: paths/filenames (`ABOUT.md`, `AGENTS.md`, `CHANGELOG.md`)
   - CLI `sdm about [--json]`: thin wrapper; text mode prints a short summary from the same payload (no prompts).
   - MCP `about`: same JSON text; `project` optional and ignored for identity (accept for schema uniformity if other tools always have it — prefer omit-required; optional no-op is fine).

3. **Capabilities from real surface, not README copy**
   - Maintain a small registry in core (or shared module) listing public CLI command paths and MCP tool names; skills via filesystem scan of `agents/*/SKILL.md` (+ purpose from skill frontmatter `description` or first heading).
   - Alternative rejected: scrape README tables (fragile). Accept that adding a command requires appending the registry (call out in tasks / AGENTS).

4. **Skill: `agents/explain-specra/SKILL.md`**
   - WHEN human asks what Specra is / capabilities / why / positioning → call `about` / `sdm about --json`, then paraphrase.
   - MUST NOT frame Specra as HR testing platform or primary test runner.
   - MUST NOT invent commands outside the payload.
   - `AGENTS.md` lists the skill and a one-line routing rule near the top.

5. **Separation from `doctor`**
   - `about` = product identity (always).
   - `doctor` = methodology project health (unchanged).

6. **No YAML schema / methodology impact**
   - No `sdm.yaml` changes; no writes.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Capability registry drifts when new CLI lands | Document in tasks; prefer single registry used by about (+ optional future doctor/help); test asserts known tools present |
| Agents ignore skill and still hallucinate | Short AGENTS.md rule + skill description triggers; MCP tool discoverable by name `about` |
| `ABOUT.md` vs code positioning diverge | Unit test: payload `whatNot` contains boundary phrases; keep ABOUT short |
| Version hardcoding already exists in CLI/MCP | `about` reads `package.json`; follow-up may unify `.version()` — out of scope unless trivial |

## Migration Plan

- No data migration.
- Existing installs: rebuild/link CLI+MCP; `agent install` to pick up new skill.
- Docs: CHANGELOG `[Unreleased]`, README command one-liner, AGENTS.md.

## Open Questions

None blocking. Default language for `ABOUT.md`: Russian primary (matches CHANGELOG/README audience), English keys in JSON field names.
