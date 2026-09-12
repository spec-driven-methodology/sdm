## 1. CLI: couple mcp install → skills

- [x] 1.1 Add `--no-skills` to `sdm mcp install`; default runs skills install for the same `--hosts` / roots (`--cursor-root`, `--gigacode-home`, agents-root resolution)
- [x] 1.2 Reuse `agent-hosts` install helper; extend `--json` with `skills` object or `skills: null`; fail loud if skills fail after MCP write
- [x] 1.3 CLI tests: default installs skills + MCP; `--no-skills` skips; reinstall without `--project` clears stale `SDM_PROJECT_ROOT`

## 2. Init messaging + templates

- [x] 2.1 Update `initMethodologyProject` README/AGENTS templates: Host setup → `mcp install` (skills by default), multi-project `project` arg, link `GETTING_STARTED` / connect-mcp
- [x] 2.2 Update `sdm init` console “Next” lines to print copy-paste `mcp install` for gigacode + cursor (no baked `--project`)
- [x] 2.3 Init/core test or snapshot asserting new project docs mention host wire / mcp install

## 3. Docs and portable skills chase

- [x] 3.1 `GETTING_STARTED.md`: primary path without mandatory `--project`; checklist skills + doctor with `project`; note default skills-on-mcp-install
- [x] 3.2 `README.md` MCP section + `AGENTS.md` MCP block aligned with coupling / multi-project
- [x] 3.3 `agents/connect-mcp/SKILL.md` (+ `agents/README.md` if needed): default skills, `--no-skills`, omit `--project`, clear stale env by reinstall
- [x] 3.4 `about` / `explain-sdm` nextSteps hint if still implies split-only install; `CHANGELOG.md` `[Unreleased]`

## 4. Verify

- [x] 4.1 `npm run verify` in `specra/`
- [x] 4.2 Smoke in temp dir: `mcp install --hosts cursor --cursor-root <tmp> --json` → mcp.json without project env + `.cursor/skills/intent-loop`; optional `--no-skills` smoke
- [x] 4.3 Playground / methodology: MCP `doctor` with `project` = real methodology path succeeds after reload note
