## 1. Spec deltas

- [x] 1.1 Delta `export-test`: `id`, `meta.revision`, consumer upsert scenarios
- [x] 1.2 Delta `export-course`: same for learning packs

## 2. Core

- [x] 2.1 `export-package-identity.ts`: buildTest/CoursePackageId, hashContentRevision
- [x] 2.2 Stamp in `export.ts` / `export-course.ts`
- [x] 2.3 `export-artifacts.ts`: optional `id` on refs

## 3. Tests + docs

- [x] 3.1 Unit tests: id stability, filter changes id, skill edit changes revision not id
- [x] 3.2 CHANGELOG, AGENTS, export-methodology + export-course skills
- [x] 3.3 `npm run verify`
