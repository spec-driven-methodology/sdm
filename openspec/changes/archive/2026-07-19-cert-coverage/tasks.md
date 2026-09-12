## 1. Project root discovery

- [x] 1.1 Add `findProjectRoot(startDir)` in `@spec-driven-methodology/core` (walk up for `sdm.yaml`)
- [x] 1.2 Export helper and cover missing-root error path used by CLI

## 2. Load methodology data

- [x] 2.1 Add loader for level YAML (`certifications/levels`) with Zod `LevelSchema`
- [x] 2.2 Add scanner for `library/questions/**/*.yaml` with `QuestionSchema` and per-file warnings
- [x] 2.3 Optionally validate role exists when `--role` is passed (`RoleSchema`)

## 3. Coverage engine

- [x] 3.1 Implement `computeCoverage(level, questions)` with constants `MIN_OK_QUESTIONS = 3`
- [x] 3.2 Map counts to statuses: missing ❌ / thin ⚠️ / ok ✅
- [x] 3.3 Return structured result including `hasMissing` for exit code

## 4. CLI command

- [x] 4.1 Add `sdm cert coverage --role <role> --level <level>` under Commander
- [x] 4.2 Print per-skill report (skill, depth, weight, count, status)
- [x] 4.3 Set non-zero exit code when any skill is missing (0 questions)

## 5. Playground verification

- [x] 5.1 Rebuild and relink CLI (`npm run build && npm link -w @spec-driven-methodology/cli`)
- [x] 5.2 Run in playground: `sdm cert coverage --role java-developer --level middle`
- [x] 5.3 Confirm docker is ❌, other skills report counts, exit code non-zero
