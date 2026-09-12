## Context

RU positioning in `ABOUT.md` already uses methodology-as-specs + assessment/learning + competency owners. EN tagline / MCP description / CLI banner still say **Spec-based Resource Assessment Framework**, which under-sells learning and sounds assessment-only. Identity is copied in several constants and docs; agents read `about` and MCP initialize description.

## Goals / Non-Goals

**Goals:**

- Single live EN tagline: **Spec-based Methodology Framework**.
- Banner / `--version` / MCP `description` / `package.json` / `ABOUT.md` frontmatter `tagline` all match.
- RU `what` stays the two-level Russian formula already shipped; EN prose where needed uses the agreed EN what + why/anchor.
- Specs and tests assert the new string; CHANGELOG notes the rename.
- Historical RA etymology may appear once in docs as history, not as active tagline.

**Non-Goals:**

- Full i18n of CLI.
- Renaming packages, binaries, or MCP server key.
- Rewriting archived OpenSpec change history.
- Changing Zod methodology schemas or export JSON contracts.

## Decisions

1. **Chosen tagline:** `Spec-based Methodology Framework`  
   - Rejected longer `Spec-based Competency Methodology Framework` (verbose).  
   - Rejected keeping Resource Assessment (narrow vs learning lifecycle).

2. **SSOT for tagline string in runtime:** keep `SDM_TAGLINE` in `packages/cli/src/banner.ts` and `MCP_SERVER_DESCRIPTION` in MCP (or import shared constant if trivial); `ABOUT.md` frontmatter `tagline` remains SSOT for `about` payload. Apply must keep these equal via search + test.

3. **RU vs EN in about payload:** no schema change. `tagline` = EN; `positioning.what` / `model` stay RU (current product default). Optional EN what is documentation-only unless we later add fields.

4. **Etymology:** short note in `ABOUT.md` or `docs/idea.md` (workspace) that Specra historically expands Spec + RA; live brand line is Methodology Framework.

5. **Search & replace scope:** active product tree under `specra/` (code, docs, main specs via archive sync). Skip `openspec/changes/archive/**` historical files.

## Risks / Trade-offs

- [External copies of old tagline] → Mitigation: CHANGELOG entry; no forced migration of third-party docs.
- [Constants drift between CLI/MCP/ABOUT] → Mitigation: grep in tasks + unit/assert on `buildAbout().tagline` and MCP description.
- [Name Specra vs Methodology acronym mismatch] → Accept; Specra remains product name, tagline is descriptive not acronym-forced.

## Migration Plan

1. Update canon + constants + docs in one PR/apply.
2. `npm run verify`; smoke `sdm about --json` and `sdm --version`.
3. Archive OpenSpec change (updates main `about-sdm` / `mcp-server` specs).
4. Rollback: revert commit (string-only change).

## Open Questions

- None for apply: EN tagline locked to **Spec-based Methodology Framework**.
