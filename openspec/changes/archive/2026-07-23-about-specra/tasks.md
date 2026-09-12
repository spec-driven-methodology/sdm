## 1. Canon + core payload

- [x] 1.1 Add framework-root `ABOUT.md` (what / what-not / agent-first / boundaries; short; not idea.md dump)
- [x] 1.2 Implement `@spec-driven-methodology/core` about assembler + Zod payload (`version` from package.json, positioning from canon, capabilities registry, skills scan, nextSteps, pointers)
- [x] 1.3 Unit tests: about works without methodology project; version matches package.json; whatNot / boundaries present; mcp list includes `about`+`doctor`; skills include discoverable ids

## 2. CLI + MCP

- [x] 2.1 Add `sdm about [--json]` (thin CLI; text summary non-interactive; `--json` = core payload)
- [x] 2.2 Register MCP tool `about` (same payload; project not required)
- [x] 2.3 MCP/CLI tests: tool listed; payload `ok: true` without project

## 3. Agent surface + docs

- [x] 3.1 Add `agents/explain-specra/SKILL.md` (call about before answering identity questions; no HR-platform framing)
- [x] 3.2 Update `AGENTS.md` (+ agents README if needed): list skill + routing rule; mention `about` in MCP/CLI lists
- [x] 3.3 CHANGELOG `[Unreleased]` + README command one-liner (no semver bump)

## 4. Verify

- [x] 4.1 `npm run verify` in `specra/`
- [x] 4.2 Smoke: from non-project dir and from `my-methodology` / playground — `sdm about --json` succeeds; compare field set with MCP `about` if host available
