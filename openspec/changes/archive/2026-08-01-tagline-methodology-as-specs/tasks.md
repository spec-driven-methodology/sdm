## 1. Canon and runtime identity

- [x] 1.1 Set `ABOUT.md` frontmatter `tagline` and prose EN tagline line to `Methodology-as-Specs Framework`; keep RU `what` / etymology note (RA historical only)
- [x] 1.2 Update `SDM_TAGLINE` (`packages/cli/src/banner.ts`), CLI `.description`, `MCP_SERVER_DESCRIPTION`, root `package.json` `description`
- [x] 1.3 Update player template tagline in `packages/core/templates/methodology/player/index.html` (studio if it hardcodes the old string)

## 2. Docs and agents

- [x] 2.1 Replace live tagline in `README.md`, `VERSIONING.md`, `openspec/config.yaml`, `agents/explain-specra/SKILL.md` (and any other active non-archive hits)
- [x] 2.2 CHANGELOG `[Unreleased]` `### Изменено`: EN tagline → Methodology-as-Specs Framework + surfaces; note `player sync --force`
- [x] 2.3 Update workspace `docs/idea.md` tagline lines (outside product commit)

## 3. Specs, tests, verify

- [x] 3.1 Sync delta into main specs is archive’s job; ensure change deltas for `about-sdm` / `mcp-server` are complete
- [x] 3.2 Grep active tree (exclude `openspec/changes/archive/**`) for `Spec-based Methodology Framework` as live tagline — zero hits
- [x] 3.3 Update unit tests (`about.test.ts`, MCP/CLI asserts) for new tagline; forbid old live strings
- [x] 3.4 `npm run verify`; smoke `sdm about --json` and `sdm --version` show new tagline
