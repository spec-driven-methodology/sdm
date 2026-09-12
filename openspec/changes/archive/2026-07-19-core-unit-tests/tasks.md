## 1. Test runner wiring

- [x] 1.1 Add `tsx` as `@spec-driven-methodology/core` devDependency; add `"test": "tsx --test \"test/**/*.test.ts\""` in `packages/core/package.json`
- [x] 1.2 Add root scripts: `"test": "npm run test -w @spec-driven-methodology/core"` and `"verify": "npm run build && npm run typecheck && npm test"`

## 2. Fixtures helper

- [x] 2.1 Create `packages/core/test/helpers/temp-project.ts` with `withTempProject(fn)` using `mkdtemp` + `initMethodologyProject({ withExamples: false })` + recursive cleanup
- [x] 2.2 Ensure helper seeds only synthetic ids (no playground paths, no PII)

## 3. Core API tests

- [x] 3.1 `test/parse-requirement-triple.test.ts` — valid triple + malformed → `VALIDATION_FAILED`
- [x] 3.2 `test/skill-write.test.ts` — `addSkill` creates YAML; `linkSkill` updates links; missing target → SdmError
- [x] 3.3 `test/question-add.test.ts` — `addQuestion` writes library file; missing skill → SdmError
- [x] 3.4 `test/cert-write.test.ts` — `createCertification` writes role/level; invalid triple rejected
- [x] 3.5 `test/coverage.test.ts` — `computeCoverage` fail/thin/ok (or project-equivalent statuses) for synthetic requirement counts

## 4. Docs and hygiene

- [x] 4.1 CHANGELOG `[Unreleased]`: note `npm test` / `npm run verify` and core suite
- [x] 4.2 README Development section: document `npm run verify`
- [x] 4.3 Update workspace hygiene rule to require `npm test` (and mention `verify`) instead of commented placeholder
- [x] 4.4 Add `core-tests` to `openspec/config.yaml` baseline list when archiving (or note for archive step)

## 5. Verify

- [x] 5.1 Run `npm run verify` from `specra/` and confirm green
- [x] 5.2 Confirm no playground/methodology dumps staged under `packages/core/test/`
