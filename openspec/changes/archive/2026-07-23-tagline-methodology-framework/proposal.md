## Why

English product tagline still says **Spec-based Resource Assessment Framework**, while Russian positioning already describes methodology-as-specs (ontology → content → lifecycle) for assessment **and** learning. Agents, MCP `initialize`, CLI banner, and docs diverge; aligning the EN tagline removes that drift without renaming the product.

## What Changes

- Canonical EN tagline → **Spec-based Methodology Framework** (product name stays **Specra**).
- Keep RU `what` / audience model as already approved; ensure EN surfaces that need English copy use the two-level EN formulas (what + why/anchor).
- Update all in-repo SSOT and mirrors: `ABOUT.md`, banner constant, CLI/MCP descriptions, `package.json`, README, VERSIONING, openspec config, agent explain skill, CHANGELOG.
- Delta specs: `about-sdm` (tagline canon), `mcp-server` (initialize / tool description string).
- Document historical **RA = Resource Assessment** only as name etymology / FAQ — not as the live tagline.

## Non-goals

- No rename of product / package / MCP key `Specra`.
- No bilingual i18n system for CLI; RU remains primary for `about.what` / body where already Russian.
- No change to methodology YAML schemas, export formats, or CLI command contracts.
- No rebrand of archived OpenSpec change folders (historical snapshots stay as-is).
- Workspace-only docs (`../docs/idea.md`, `.cursor/`) may be synced in apply notes but are outside the Specra git tree unless explicitly listed in tasks as optional.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `about-sdm`: Canon tagline and positioning strings for `ABOUT.md` / `about` payload must use the new EN tagline and stay aligned with two-level what/why + competency-owner model.
- `mcp-server`: MCP server `description` / identity strings that embed the tagline must use **Spec-based Methodology Framework**.

## Impact

- Code: `packages/cli` (`banner.ts`, program description), `packages/mcp` (`MCP_SERVER_DESCRIPTION`, about tool help), tests asserting old tagline.
- Docs: `ABOUT.md`, `README.md`, `VERSIONING.md`, `AGENTS.md` / `agents/explain-sdm`, `CHANGELOG.md`, `openspec/config.yaml`, `package.json` description.
- Agent-first: `about --json` / MCP `about` remain the identity surface; after this change agents paraphrase the new tagline without inventing LMS/HR-testing stories.
