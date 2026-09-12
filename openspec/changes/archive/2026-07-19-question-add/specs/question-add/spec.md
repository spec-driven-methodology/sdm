## ADDED Requirements

### Requirement: Add question bound to a skill
The system SHALL provide a non-interactive command `sdm question add` that creates a question file in `library/questions` bound to a skill via required `--to-skill`.

#### Scenario: Add single_choice question for existing skill
- **WHEN** the user or agent runs `sdm question add --to-skill docker --type single_choice --difficulty 0.3 --text "…" --option "a" --option "b" --correct 1` in a methodology project where skill `docker` exists
- **THEN** the system writes a YAML file under `library/questions/`
- **AND** the file validates against the question schema with `skill: docker`

#### Scenario: Skill missing from ontology
- **WHEN** `--to-skill` refers to a skill with no file under `ontology/skills`
- **THEN** the system fails with a stable error code indicating the skill was not found
- **AND** no question file is written

#### Scenario: Refuse overwrite without force
- **WHEN** a question file with the same id already exists and `--force` is not set
- **THEN** the system fails with a stable error code
- **AND** the existing file is left unchanged

### Requirement: Validate before persist
The system SHALL validate the question payload with the shared Zod question schema before writing any file.

#### Scenario: Invalid payload
- **WHEN** required fields for the chosen type are missing or invalid (e.g. single_choice without options)
- **THEN** the system fails with a validation error
- **AND** no file is written

### Requirement: Machine-readable success and failure
The system SHALL support `--json` output for agents and CI.

#### Scenario: JSON success
- **WHEN** `question add` succeeds with `--json`
- **THEN** stdout contains JSON including at least question id, skill, and file path

#### Scenario: JSON failure
- **WHEN** `question add` fails with `--json`
- **THEN** stdout or stderr contains JSON including a stable error `code` and `message`
- **AND** the process exit code is non-zero

### Requirement: Close coverage gap after add
After a successful add for a previously uncovered skill, a subsequent `cert coverage` run SHALL count the new question toward that skill.

#### Scenario: Docker gap closed from missing
- **WHEN** a methodology project has level requirements including docker with zero questions
- **AND** an agent adds at least one valid question with `--to-skill docker`
- **AND** the user runs `sdm cert coverage` for that level
- **THEN** docker is no longer classified as missing (0 questions)
