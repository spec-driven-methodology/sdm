## Purpose

Summary quality report for methodology projects and markdown corpora: verdict, density matrix, glossary, persist/diff — complementary to detailed `audit`.

## Requirements

### Requirement: Quality report document schema
The system SHALL produce a quality report document with `schemaVersion` equal to `sdm.quality.report/v1` that includes `id`, `createdAt`, `mode` (`methodology` | `corpus` | `diff`), `scope`, `verdict`, `score` (integer 1–5), `readiness` (`high` | `medium` | `low`), `summaryRu` (and English summary when locale is `en`), `matrix` with density cells (`full` | `partial` | `thin` | `none`) and human symbols `●●●` / `●●○` / `●○○` / `○○○`, `topActions` (at most 5) with entity references, `glossary`, `entityScores`, `findings`, and `contentHash`. The report MUST include a matrix legend matching: dense / with gaps / thin / almost none.

#### Scenario: Methodology report JSON envelope
- **WHEN** an agent runs `sdm quality report --profile <id> --level <id> --json` in a valid methodology project
- **THEN** stdout contains `{ ok: true, document, projectRoot }` with `document.schemaVersion` = `sdm.quality.report/v1` and non-empty `summaryRu` when locale is `ru`

#### Scenario: Matrix density symbols
- **WHEN** a report cell has density `partial`
- **THEN** the cell exposes symbol `●●○` (or equivalent field used by the text formatter)

### Requirement: Quality report CLI and modes
The system SHALL provide `sdm quality report` supporting `--sources <dir>` (corpus mode), `--profile` / `--level` (methodology focus), `--diff <reportId>`, `--save`, `--locale ru|en`, and `--json`. Without `--sources`, mode SHALL be `methodology` (project root required). With `--sources`, mode SHALL be `corpus`. With `--diff`, the document mode SHALL be `diff` comparing a saved report to a freshly built report (or to another saved id when provided). CLI SHALL NOT persist unless `--save` is set. Human-readable output (non-JSON) SHALL use the resolved locale.

#### Scenario: Persist on explicit save
- **WHEN** `sdm quality report --json --save` succeeds
- **THEN** a file is written under `.sdm/reports/quality/<id>.json` and the JSON envelope includes the saved `id` / path

#### Scenario: Diff missing report
- **WHEN** `sdm quality report --diff missing-id --json` is run and no such report exists
- **THEN** the command fails with SdmError code `QUALITY_REPORT_NOT_FOUND`

### Requirement: Methodology mode builds on audit without breaking it
Methodology mode SHALL call the existing methodology audit (and coverage/gaps when profile and level are supplied) and project summary fields and matrix rows from skills/topics and coverage density. It MUST NOT change `sdm.audit/v1` required fields or remove the `audit` command.

#### Scenario: Audit still available
- **WHEN** `sdm audit --json` runs after this change
- **THEN** the response still uses `schemaVersion` `sdm.audit/v1` with ontology and library sections

### Requirement: Human locale for report text
The system SHALL resolve locale as: explicit `--locale` or MCP `locale`, else `SDM_LOCALE`, else `ru`. When locale is `ru`, human text fields and non-JSON formatting SHALL be Russian and include a glossary with at least SSOT, HITL, coverage, and quarry explanations. CLI and MCP tool names and JSON property names MUST remain English.

#### Scenario: Default Russian summary
- **WHEN** quality report runs without `--locale` and without `SDM_LOCALE`
- **THEN** `summaryRu` is non-empty and glossary entries explain SSOT in Russian

### Requirement: Portable quality-report skill
The repository SHALL ship `agents/quality-report/SKILL.md` describing when to use corpus vs methodology modes, how to read the ●○○ matrix, and handoff to intent-loop / bootstrap after HITL.

#### Scenario: Skill present
- **WHEN** an agent lists portable skills after install/sync
- **THEN** `quality-report` appears with a purpose string mentioning quality report or corpus
