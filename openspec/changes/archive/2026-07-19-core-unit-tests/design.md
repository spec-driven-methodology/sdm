## Context

`@spec-driven-methodology/core` holds the write/coverage APIs that CLI and agents depend on (`addSkill`, `linkSkill`, `addQuestion`, `createCertification`, `parseRequirementTriple`, `computeCoverage`). Hygiene already lists `npm test`, but no runner or suite exists. CLI smoke in playground is manual and must not become git fixtures.

## Goals / Non-Goals

**Goals:**
- Minimal, deterministic suite for the listed core APIs
- Temp-dir project fixtures (OS `mkdtemp` + `initMethodologyProject`) — nothing from `playground/` in git
- `npm test` at root and in `@spec-driven-methodology/core`
- Single `npm run verify` = build → typecheck → test
- Docs/hygiene align with the real scripts

**Non-Goals:**
- CLI process e2e, coverage thresholds, CI provider config
- Checking in methodology YAML dumps
- Exhaustive Zod matrix

## Decisions

1. **Runner: Node built-in `node:test` + `node:assert/strict`**
   - Node `>=20.19` already required; no Jest/Vitest stack for v1
   - Alternative: Vitest — rejected for PoC; can revisit if watch/DX becomes painful

2. **TypeScript execution via `tsx` (devDependency of `@spec-driven-methodology/core`)**
   - Tests live in `packages/core/test/**/*.test.ts` (not shipped in `files`)
   - Script: `tsx --test "test/**/*.test.ts"`
   - Alternative: compile tests into `dist/` — rejected; keeps package `dist` product-only

3. **Fixtures: temp project helper**
   - Shared helper creates `os.tmpdir()` dir, calls `initMethodologyProject({ targetDir, withExamples: false })`, seeds only what each test needs (synthetic skill ids)
   - Prefer exercising public exports from `@spec-driven-methodology/core` (import from `../src/index.ts` via relative or package name — relative to source for speed without packing)
   - Cleanup: `rmSync(dir, { recursive: true, force: true })` in `after` / `finally`

4. **Minimum cases (happy path + one failure each where cheap)**
   - `parseRequirementTriple`: valid `skill:depth:weight`; invalid format → `VALIDATION_FAILED`
   - `addSkill` / `linkSkill`: create skill file; link updates related fields; missing skill → `SKILL_NOT_FOUND` (or current SdmError codes)
   - `addQuestion`: write under `library/questions/`; missing skill → error
   - `createCertification`: role + level YAML + requirements; bad triple rejected before write
   - `computeCoverage`: empty/missing questions → fail/thin status; enough questions → ok (use existing thresholds)

5. **npm scripts**
   - `@spec-driven-methodology/core`: `"test": "tsx --test \"test/**/*.test.ts\""`
   - Root: `"test": "npm run test -w @spec-driven-methodology/core"`
   - Root: `"verify": "npm run build && npm run typecheck && npm test"`
   - Order in verify: build first (catches emit breaks), then typecheck, then tests

6. **Docs surface**
   - CHANGELOG `[Unreleased]`: developer verify/test scripts
   - README: short “Development” note with `npm run verify`
   - Workspace hygiene rule: uncomment/require `npm test` (and mention `verify`)

7. **Schemas / Zod**
   - No schema changes; tests assert current validation behavior (writers still go through Zod)

## Risks / Trade-offs

- [tsx as only TS test loader] → pin as core devDependency; verify script still builds independently
- [Tests import `src/` not `dist/`] → may diverge from published emit; mitigate by `verify` running build+typecheck before/alongside tests
- [init templates change break fixtures] → helper uses public `initMethodologyProject`; update tests if scaffold contract changes
- [Flaky temp dirs on CI] → unique `mkdtemp` prefixes; always cleanup

## Migration Plan

1. Add `tsx`, test files, scripts
2. Run `npm run verify` green locally
3. Archive change; update hygiene so pre-push expects tests
4. No runtime migration for end users

## Open Questions

- None blocking. Follow-up: thin CLI smoke tests spawning `packages/cli/dist` against temp dirs.
