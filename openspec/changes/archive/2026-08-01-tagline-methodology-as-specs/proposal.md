## Why

EN tagline `Spec-based Methodology Framework` only loosely matches the RU canon (**methodology-as-specs**). Align the short English identity string so `--version`, `about`, MCP initialize, and agents paraphrase the same product term humans already see in RU positioning.

## What Changes

- Replace live EN tagline with **`Methodology-as-Specs Framework`** everywhere it is SSOT or mirrored (ABOUT, about payload, CLI banner/`--version`, MCP description, package.json description, README, VERSIONING, openspec config, player/studio templates, explain-sdm).
- Update OpenSpec requirements in `about-sdm` and `mcp-server` for the new exact string.
- CHANGELOG note under `[Unreleased]`.
- **BREAKING** for consumers that assert the previous EN tagline string (identity copy only; no CLI/MCP ops change).

## Non-goals

- No change to RU `positioning.what` / `whatNot` / `model` (already methodology-as-specs).
- No new CLI/MCP tools; no LMS/HR candidate UI; no methodology YAML hand-edit path.
- Historical Spec+RA etymology remains history-only prose, not a live tagline.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `about-sdm`: canonical EN `tagline` becomes `Methodology-as-Specs Framework`; must not use former live taglines (`Spec-based Methodology Framework`, Resource Assessment).
- `mcp-server`: MCP initialize `description` must include the new tagline string with product identity.

## Impact

- Runtime: `packages/cli` banner/description, `packages/mcp` `MCP_SERVER_DESCRIPTION`, `ABOUT.md` → `buildAbout().tagline`, tests in `about.test.ts` / MCP tests.
- Docs/agents: README, VERSIONING, `agents/explain-sdm`, optionally workspace `docs/idea.md` (outside product git).
- Agents: `about` / MCP initialize stay agent-first identity sources; no new domain ops.
