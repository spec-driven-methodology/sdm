## Why

`cert coverage` already shows gaps (e.g. docker with 0 questions), but agents and CI cannot close them through Specra — they would hand-edit YAML and bypass validation. We need a domain operation to add a question to a skill so the agent-first loop works: intent → tool → valid library file → re-check coverage.

## What Changes

- Domain CLI: `sdm question add --to-skill <skill> …` (non-interactive, agent-friendly)
- Core writer: validate with `QuestionSchema`, persist under `library/questions/`
- Optional existence check that `--to-skill` is present in ontology (warn or error — see design)
- `--json` output with created path / question id; stable `SdmError` codes on failure
- Human-readable summary by default for agent transcripts

## Non-goals

- Interactive TTY wizard
- AI `question generate`
- Edit / delete / list commands (list can follow later)
- MCP server / Cursor skills packaging (same op will be wrapped later)
- Filling all coverage thin/ok thresholds automatically

## Capabilities

### New Capabilities

- `question-add`: add a validated question bound to a skill in the methodology library

### Modified Capabilities

- (none — `cert-coverage` behavior unchanged; consumers re-run it after add)

## Impact

- `@spec-driven-methodology/core`: question write helpers, id generation, ontology skill lookup
- `@spec-driven-methodology/cli`: `question add` command + `--json`
- Agent-first: deterministic args + JSON enable Cursor/MCP without schema-bypass edits
- Playground: add docker question → `cert coverage` no longer FAIL on missing docker
