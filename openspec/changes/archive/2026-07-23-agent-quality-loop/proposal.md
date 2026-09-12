## Why

Agent-first цикл через MCP уже наполняет библиотеку до «зелёного» coverage, но потолок качества низкий: агент останавливается на эвристике count+max(difficulty), `question generate` даёт слабый brief, `question add` почти всё принимает, dry-run validate до записи отсутствует, `suggest` толкает к export, а не к hardening. Нужны доменные рычаги в ядре (`--json`, стабильные `SdmError`), чтобы агент не мог закончить с тонким банком и был вынужден rewrite-loop’ом улучшать черновики.

## What Changes

- Blueprint-aware coverage/gaps: status зависит не только от count и max(difficulty), но и от topic coverage, difficulty bands и type mix (конфиг + work items в `--json`).
- CLI/MCP `question validate` — dry-run тех же (и расширенных) правил, что write-path; structured `errors[]` / `findings[]` для rewrite.
- Жёстче `question add` / audit policy: topics ⊆ skill.topics, near-dup reject, distractor/position gates, optional require explanation; политика в `sdm.yaml` (`quality.*`).
- Богаче `question generate`: per-draft brief (`mustCoverTopic`, difficulty, type, avoidNearIds, related skills).
- `cert gaps` как actionable work queue для агента.
- `suggest`: фаза quality harden до export levers.
- Portable skills / `AGENTS.md`: канонический agent quality loop.
- Default: backward-compatible `legacy` / soft; высокий потолок — opt-in `blueprint` + `strict`.

## Capabilities

### New Capabilities

- `question-validate`: dry-run validation + quality findings (`question validate --json` / MCP `question_validate`)
- `coverage-blueprint`: blueprint rules for ok/thin/missing + gap work items (config + classifier)

### Modified Capabilities

- `cert-coverage`: blueprint-aware status and reasons when mode enabled
- `cert-gaps`: work items queue in JSON for agents
- `question-add`: shared validate pipeline; soft warnings / strict reject
- `distractor-quality`: integrated into writeGate / shared validators
- `methodology-audit`: align findings with validate pipeline where applicable
- `question-generate`: per-draft assignment briefs from gaps/work items
- `guide-suggest`: quality-phase suggestions before export
- `skill-write`: optional min description/topics gate (`quality.skillGate`)
- `mcp-server`: register `question_validate`; extend gaps/generate/add/suggest payloads

## Impact

- `@spec-driven-methodology/core`: shared validate, blueprint coverage, generate briefs, suggest
- `@spec-driven-methodology/cli` + MCP tool schemas / tests
- `agents/generate-questions`, `close-coverage`, `guide-suggest`, `AGENTS.md`, README, CHANGELOG
- Methodology `sdm.yaml` quality knobs (no forced migration)

## Non-goals

- LMS / candidate psychometrics / IRT / attempt analytics in core
- LLM inside `@spec-driven-methodology/core`
- Full item lifecycle (draft/approved/retired) — follow-up
- Real LanceDB embeddings (lexical near-dup v1; embeddings follow-up)
- `export course` (отдельный change)
- HR connectors / multi-tenant RBAC
