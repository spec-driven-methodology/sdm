## Why

Agents must hand off subset test packs (e.g. «только QA-skills», «только эти question id») through Specra `export test` / MCP — not by slicing export JSON with ad-hoc scripts. Today only type filters exist; skill and question-id filters are missing, so agents invent workarounds and break the agent-first contract.

## What Changes

- Add optional **skill filter** on `export test`: `--include-skill` / `--exclude-skill` (mutually exclusive), mirrored on MCP `export_test`.
- Add optional **question-id allowlist**: `--include-question` (repeatable), mirrored on MCP.
- Emit `meta.skillFilter` / `meta.questionFilter` when applied; keep `meta.questionCount` honest; restrict/renormalize `requirements` when skill include narrows the set.
- Stable `SdmError` codes for filter conflicts, unknown skills/ids, and empty results after filters.
- Update portable agent docs (`AGENTS.md`, `export-methodology`, intent-loop NL → flags) so agents never teach post-filter hacks when flags exist.
- CHANGELOG / README for the new surface.

## Non-goals

- Profile-private questions (questions stay skill-bound).
- Teams CRUD CLI or new level entities as the primary solution (team overlays remain orthogonal).
- `--exclude-question` in MVP (include-only for ids).
- Player redesign beyond consuming filtered packages.
- Changing adaptive sampling semantics beyond documenting filter order relative to `--adaptive`.

## Capabilities

### New Capabilities

_(none — extends existing export surface)_

### Modified Capabilities

- `export-test`: skill + question-id filters, meta fields, requirement narrowing, error codes.
- `mcp-server`: `export_test` args parity with CLI filters.
- `intent-loop`: NL mapping for skill/question subset exports (no jq / hand slice).

## Impact

- `@spec-driven-methodology/core` export pipeline and tests
- `@spec-driven-methodology/cli` `export test` flags
- `@spec-driven-methodology/mcp` `export_test` tool schema
- Agent skills / AGENTS.md / README / CHANGELOG
- Agent-first: same domain op `export test`, richer structured filters + `--json` + error codes
