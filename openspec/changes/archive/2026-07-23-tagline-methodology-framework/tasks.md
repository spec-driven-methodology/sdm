## 1. Canon and runtime constants

- [x] 1.1 Set `ABOUT.md` frontmatter `tagline` to `Spec-based Methodology Framework`; keep RU `what` / `whatNot` / `model`; add one short etymology note that RA is historical, not the live tagline
- [x] 1.2 Update `SDM_TAGLINE` in `packages/cli/src/banner.ts` and CLI program `.description(...)`
- [x] 1.3 Update `MCP_SERVER_DESCRIPTION` in `packages/mcp/src/server.ts` (and any initialize description composition)
- [x] 1.4 Update root `package.json` `"description"` and `openspec/config.yaml` opening line

## 2. Docs and agent instructions

- [x] 2.1 Replace live tagline in `README.md`, `VERSIONING.md`, `AGENTS.md` (if present), `agents/explain-specra/SKILL.md`, `agents/README.md`
- [x] 2.2 CHANGELOG `[Unreleased]`: note EN tagline rename + identity surfaces
- [x] 2.3 Optional (workspace, outside Specra git): sync `../docs/idea.md` branding table / name etymology section

## 3. Specs, tests, verify

- [x] 3.1 Grep active tree (exclude `openspec/changes/archive/**`) for `Spec-based Resource Assessment Framework` — zero hits as live tagline
- [x] 3.2 Extend unit tests: `buildAbout().tagline` equals new string; MCP/CLI tests that assert old tagline updated
- [x] 3.3 `npm run verify`; smoke `sdm about --json` and `sdm --version` show new tagline
- [x] 3.4 After apply: archive change so main `openspec/specs/about-sdm` and `mcp-server` pick up deltas
