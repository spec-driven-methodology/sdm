## 1. Canon identity

- [x] 1.1 Update `ABOUT.md` frontmatter (`what` / `whatNot` / `model`) and body: эталон, system picture, harness whatNot, value/contexts
- [x] 1.2 Harden `packages/core/test/about.test.ts` for harness whatNot and эталон/SSOT language
- [x] 1.3 Update `agents/explain-specra/SKILL.md` (What/Why + harness anti-pattern)

## 2. Dependent product docs

- [x] 2.1 Update `README.md` intro / делает-не / «контроль из одной точки»
- [x] 2.2 Update `GETTING_STARTED.md` short эталон + agent-first blurb
- [x] 2.3 Update `AGENTS.md` and `agents/README.md` identity lines
- [x] 2.4 Update `openspec/config.yaml` context (system picture + harness)

## 3. MCP / CLI / templates

- [x] 3.1 Align MCP `TOOL_DESCRIPTIONS.about` and CLI `about` `.description`
- [x] 3.2 Update player/studio template lead copy (+ README if drift)

## 4. Version and verify

- [x] 4.1 Add CHANGELOG `[0.9.0-alpha.3]` for positioning/docs
- [x] 4.2 `npm run version:build` → `0.9.0-alpha.3` + `version:check`
- [x] 4.3 `npm run verify` and smoke `about --json` positioning/version
