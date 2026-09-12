## 1. Gap framing (docs in-repo)

- [x] 1.1 Add «разрыв / целевой цикл» to `docs/idea.md` §1.1: intent → clarify → plan → confirm → execute → result; CLI = agent-only; entity = **Profile**
- [x] 1.2 List `intent-loop` in `openspec/config.yaml` baseline only at archive time

## 2. Portable skill intent-loop (P0)

- [x] 2.1 Create `agents/intent-loop/SKILL.md`: Intake / Clarify / Plan / Confirm / Execute / Result; MCP|CLI; max clarify; no writes before confirm; **Profile** language
- [x] 2.2 Route plan kinds: `profile-pack` → bootstrap pack (path may still be `bootstrap-role-pack` until rename); handoff close-coverage / export / audit
- [x] 2.3 Human result summary checklist (entities, gaps/coverage, next NL intents)
- [x] 2.4 Update bootstrap pack SKILL cross-link to prefer `intent-loop` for incomplete NL
- [x] 2.5 Update `AGENTS.md` + `agents/README.md`: `intent-loop` primary; pack as underlying

## 3. Plan validation helper (P1)

- [x] 3.1 Zod schemas `sdm.intent.plan/v1` with `kind: profile-pack` + profile/level fields; SdmError codes
- [x] 3.2 CLI `sdm intent validate-plan` (stdin or `--file`) `--json`; unit tests
- [x] 3.3 MCP `intent_validate_plan` deferred — CHANGELOG note
- [x] 3.4 Document validate-plan in skill as optional check before confirm

## 4. Init + human docs (P0)

- [x] 4.1 Init `AGENTS.md` template: intent examples + `intent-loop`; Profile wording; CLI appendix for agents
- [x] 4.2 `GETTING_STARTED.md`: after smoke → intent to agent; CLI for agents/CI
- [x] 4.3 `README.md` intent-first
- [x] 4.4 CHANGELOG `[Unreleased]`

## 5. Verification

- [x] 5.1 `npm run verify`
- [x] 5.2 Dry-run clarify→plan contract documented in intent-loop skill (Java Middle backend profile)
- [x] 5.3 `intent validate-plan --json` rejects invalid plan
- [x] 5.4 Archive prep: sync delta specs to main + baseline list
