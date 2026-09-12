## 1. Core

- [x] 1.1 Add requirement triple parser (`skill:depth:weight`) with VALIDATION_FAILED on bad input
- [x] 1.2 Implement `createCertification(projectRoot, input)` — validate skills, write level, upsert role
- [x] 1.3 Enforce LEVEL_EXISTS without `--force`; export API + error codes
- [x] 1.4 Ensure validations run before any write (no partial level on failure)

## 2. CLI

- [x] 2.1 Add `sdm cert create` with role/level titles, repeatable `--requirement`, `--threshold`, `--force`, `--json`
- [x] 2.2 Wire project root + shared JSON/text error handling

## 3. Verification

- [x] 3.1 Rebuild and relink CLI
- [x] 3.2 Playground: create a new role/level (or distinct ids), confirm YAML + `--json`
- [x] 3.3 Run `cert coverage --json` against the new role/level successfully
