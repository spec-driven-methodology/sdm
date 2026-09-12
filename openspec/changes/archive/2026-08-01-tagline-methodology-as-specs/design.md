## Context

Prior change `tagline-methodology-framework` set live EN tagline to `Spec-based Methodology Framework`. RU `what` already uses **methodology-as-specs**. Identity is mirrored in ABOUT frontmatter, CLI `SDM_TAGLINE`, MCP `MCP_SERVER_DESCRIPTION`, package descriptions, player template, docs, and `about-sdm` / `mcp-server` specs.

## Goals / Non-Goals

**Goals:**

- Single live EN tagline: **`Methodology-as-Specs Framework`**.
- Banner / `--version` / MCP description / `package.json` / ABOUT / about payload / tests all match.
- Specs forbid previous live taglines (`Spec-based Methodology Framework`, Resource Assessment forms).

**Non-Goals:**

- No schema change to about payload; RU positioning fields unchanged.
- No new tools or version bump in this cycle (`/ship` separate).

## Decisions

1. **Chosen string:** `Methodology-as-Specs Framework`  
   Rationale: closest EN mirror of RU **methodology-as-specs** while keeping a short Framework suffix for banner readability. Rejected: `Specra: Methodology-as-Specs` (drops Framework consistency with prior pattern); keeping Spec-based… (user rejected as looser).

2. **SSOT:** `ABOUT.md` frontmatter `tagline` remains SSOT for `buildAbout()`. CLI/MCP constants must equal that string (grep + unit test). No new shared package export required unless trivial.

3. **Requirement rename:** rename about-sdm requirement that embeds the old tagline in its title; update mcp-server description requirement text.

4. **Workspace `docs/idea.md`:** update tagline lines during apply (outside `specra/` git); not part of product commit unless workspace ship.

## Risks / Trade-offs

- [Breaks string asserts in forks/docs] → Mitigation: CHANGELOG; agents should read `about.tagline`, not hardcode.
- [Player copies in existing projects] → Mitigation: note `sdm player sync --force` in CHANGELOG (same as prior tagline cut).

## Migration Plan

1. Replace strings + specs + tests.
2. `npm run verify`; smoke `about --json` and `--version`.
3. Archive; `/ship` when requested.
