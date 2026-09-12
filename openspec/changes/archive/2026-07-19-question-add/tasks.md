## 1. Core: add question

- [x] 1.1 Add skill existence helper (`ontology/skills/<id>.yaml`)
- [x] 1.2 Implement `addQuestion(projectRoot, input)` with QuestionSchema validation
- [x] 1.3 Generate unique question ids; refuse overwrite unless `force`
- [x] 1.4 Export API + SdmError codes (`SKILL_NOT_FOUND`, `QUESTION_EXISTS`, `VALIDATION_FAILED`)

## 2. CLI: question add

- [x] 2.1 Add `sdm question add --to-skill …` (type, difficulty, text, options, correct, id, force)
- [x] 2.2 Wire project root discovery; print human-readable success summary
- [x] 2.3 Implement `--json` for success and failure payloads

## 3. Playground verification

- [x] 3.1 Rebuild and relink CLI
- [x] 3.2 Add a docker single_choice question in playground via CLI
- [x] 3.3 Re-run `cert coverage --role java-developer --level middle` and confirm docker is not missing
- [x] 3.4 Confirm `--json` success shape for agents
