## 1. Core writers

- [x] 1.1 Implement `addSkill(projectRoot, input)` with SkillSchema + `SKILL_EXISTS` / `--force`
- [x] 1.2 Implement `linkSkill(projectRoot, id, { dependsOn, relatedTo })` with merge/dedupe
- [x] 1.3 Validate dependency targets exist; reject self-dependency; export SdmError codes
- [x] 1.4 Export API from `@spec-driven-methodology/core`

## 2. CLI

- [x] 2.1 Add `sdm skill add <id> --name … [--category] [--desc] [--force] [--json]`
- [x] 2.2 Add `sdm skill link <id> --depends-on … [--related-to …] [--json]`
- [x] 2.3 Wire project root + shared JSON/text error handling

## 3. Verification

- [x] 3.1 Rebuild and relink CLI
- [x] 3.2 In playground: add a new skill, link it to an existing skill, confirm YAML + `--json`
- [x] 3.3 Confirm `question add --to-skill <new>` succeeds after add
