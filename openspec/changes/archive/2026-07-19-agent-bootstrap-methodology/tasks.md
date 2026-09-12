## 1. New portable skill

- [x] 1.1 Create `agents/bootstrap-methodology/SKILL.md` with frontmatter (`sdm-bootstrap-methodology`) and ordered steps: doctor/init → skill add → cert create → question add → coverage --json
- [x] 1.2 Include inputs, `--json` examples, SdmError handling, minOkQuestions note, handoff to close-coverage
- [x] 1.3 Match existing close-coverage tone/structure (guardrails, no YAML hand-edit)

## 2. Index and cross-links

- [x] 2.1 Update `AGENTS.md` skills table + when-to-use for bootstrap vs close-coverage
- [x] 2.2 Update `agents/README.md` skills table
- [x] 2.3 Add short prerequisite guard + link in `agents/close-coverage/SKILL.md`

## 3. Docs

- [x] 3.1 CHANGELOG `[Unreleased]`: bootstrap-methodology skill
- [x] 3.2 README agents table: add bootstrap-methodology row
- [x] 3.3 Note for archive: add `bootstrap-methodology` to `openspec/config.yaml` baseline list

## 4. Smoke (optional but recommended)

- [x] 4.1 In a temp dir: `sdm init` → follow skill commands with `--json` (skill add → cert create → question add → coverage); do not commit playground dumps
- [x] 4.2 `npm run verify` still green (docs-only; no code expected to break)
