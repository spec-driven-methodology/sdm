## Why

Cursor MCP UI shows `no description` for most Specra tool parameters because Zod schemas omit `.describe()`. Agents and hosts also get thinner guidance than CLI help. Schema/docs hygiene (no new domain tools) closes the gap and adds SSOT guards so ABOUT/AGENTS stay aligned with `TOOL_NAMES`.

## What Changes

- Add non-empty Zod `.describe()` on every MCP `registerTools` input property (shared helpers for profile/level/force/etc.).
- Enrich thin tool-level description strings for write/export/search/coverage tools.
- Spec + tests: param descriptions required; `ABOUT_MCP_TOOLS` ≡ `TOOL_NAMES`; AGENTS Tools inventory includes player/studio tools.
- CHANGELOG Unreleased; OpenSpec `mcp-server` inventory/requirements refresh.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `mcp-server`: param description requirement; baseline tool inventory up to date; MUST NOT `studio_serve`.
- `about-sdm`: reinforce MCP capabilities list sync with registration.
- `getting-started`: only if MCP smoke checklist drifts (likely no-op).

## Impact

`@spec-driven-methodology/mcp` `registerTools` only (description text). Tests in `packages/mcp/test`. Docs: `AGENTS.md`, `CHANGELOG.md`. No new tools; no behavior/arg contract changes; `intent_validate_plan` / MCP HTTP remain out of scope.

## Non-goals

No new MCP tools; no `studio_serve` over MCP; no full handler test suite for all tools; no Russian CLI/MCP names; no product logic changes beyond description text.
