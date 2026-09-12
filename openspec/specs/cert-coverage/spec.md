# cert-coverage

## Purpose

Report how well the question library covers certification level requirements.
## Requirements
### Requirement: Compute certification question coverage
The system SHALL compute question coverage for a certification level by counting questions in `library/questions` whose `skill` matches each `requirement.skill` of the selected level.

#### Scenario: Coverage for example middle java-developer
- **WHEN** the user runs `sdm cert coverage --profile java-developer --level middle` in a project initialized with `--with-examples`
- **THEN** the system reports coverage for java-core, spring, sql, and docker
- **AND** docker is marked as uncovered (zero questions)

#### Scenario: Level file missing
- **WHEN** the user requests a level that has no matching file under `certifications/levels`
- **THEN** the system reports an error and exits with a non-zero status code

### Requirement: Classify coverage status with simple heuristics
The system SHALL classify each required skill using transparent count-based heuristics with explicit constants:
- missing: 0 questions → ❌
- thin: greater than 0 and fewer than the minimum-ok threshold → ⚠️
- ok: at least the minimum-ok threshold → ✅

The default minimum-ok threshold SHALL be 3 questions per skill for this PoC.

#### Scenario: Skill with no questions
- **WHEN** a required skill has 0 matching questions
- **THEN** the skill status is ❌

#### Scenario: Skill with few questions
- **WHEN** a required skill has 1 or 2 matching questions
- **THEN** the skill status is ⚠️

#### Scenario: Skill with enough questions
- **WHEN** a required skill has 3 or more matching questions
- **THEN** the skill status is ✅

### Requirement: Print human-readable coverage report
The system SHALL print a per-skill report including skill id, required depth, weight, question count, and status symbol.

#### Scenario: Report includes requirement metadata
- **WHEN** coverage is computed successfully
- **THEN** each skill line includes depth, weight, question count, and status

### Requirement: Fail on uncovered skills
The system SHALL exit with a non-zero status code when at least one required skill has zero questions.

#### Scenario: Uncovered skills present
- **WHEN** any required skill has 0 questions
- **THEN** the process exit code is non-zero

#### Scenario: All skills have at least one question
- **WHEN** every required skill has one or more questions
- **THEN** the process exit code is zero (warnings for thin coverage do not fail the command)

### Requirement: Machine-readable coverage output
The system SHALL support `--json` on `sdm cert coverage` for agents and CI.

#### Scenario: JSON success
- **WHEN** `sdm cert coverage --profile <profile> --level <level> --json` succeeds
- **THEN** stdout contains JSON with `ok: true`, skill coverage entries (including status and questionCount), and `hasMissing`

#### Scenario: JSON failure
- **WHEN** coverage fails (e.g. project root or level not found) with `--json`
- **THEN** output contains JSON with `ok: false`, a stable error `code`, and `message`
- **AND** the process exit code is non-zero

#### Scenario: JSON preserves fail-on-missing
- **WHEN** coverage succeeds structurally but at least one skill is missing (0 questions) and `--json` is set
- **THEN** JSON includes `hasMissing: true`
- **AND** the process exit code is non-zero

### Requirement: Depth-aware coverage status
The system SHALL compute `achievedDepth` as the maximum question difficulty for each required skill and mark the skill `thin` when `depthRatio` is below 0.9 even if question count meets the minimum.

#### Scenario: Enough questions but shallow difficulty
- **WHEN** a skill requires depth 0.8 and has ≥3 questions all at difficulty 0.4
- **THEN** coverage status for that skill is `thin`
- **AND** the result includes `achievedDepth` and `depthRatio` fields

### Requirement: Coverage reports blueprint fields when enabled

When `quality.coverageMode` is `blueprint`, `sdm cert coverage --json` SHALL include per-skill `reasons` (and MAY include `workItems` at the report root or per skill) reflecting blueprint classification. When mode is `legacy`, the existing coverage JSON fields and status heuristics MUST remain unchanged.

#### Scenario: Blueprint coverage JSON includes reasons

- **WHEN** an agent runs `cert coverage --profile X --level Y --json` with blueprint mode and a thin skill due to topic gaps
- **THEN** the skill entry includes a non-empty `reasons` list explaining why status is not `ok`

