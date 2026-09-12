## ADDED Requirements

### Requirement: Compute certification question coverage
The system SHALL compute question coverage for a certification level by counting questions in `library/questions` whose `skill` matches each `requirement.skill` of the selected level.

#### Scenario: Coverage for example middle java-developer
- **WHEN** the user runs `sdm cert coverage --role java-developer --level middle` in a project initialized with `--with-examples`
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
