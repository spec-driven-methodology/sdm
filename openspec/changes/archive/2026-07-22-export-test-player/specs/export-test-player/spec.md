## ADDED Requirements

### Requirement: Static export test player ships with methodology init

The system SHALL include a static HTML/CSS/JS export-test player under `packages/core/templates/methodology/player/` and SHALL copy it to `<project>/player/` when `sdm init` creates a methodology project (including when `--with-examples` is not set). Existing `player/` files SHALL follow the same absent-or-force rules as other init scaffolds.

#### Scenario: Init creates player directory

- **WHEN** a user runs `sdm init` in an empty directory
- **THEN** the project contains `player/index.html` and the accompanying player assets needed to run in a browser without a build step

#### Scenario: Init does not overwrite player without force

- **WHEN** `player/index.html` already exists and init runs without `--force`
- **THEN** the existing player files are left unchanged (skipped)

### Requirement: Player loads sdm.export.test/v1 documents

The player SHALL let the author load a JSON document with `schemaVersion` `sdm.export.test/v1` (file picker and/or drag-and-drop) and SHALL present the test title, profile, level, and questions for interactive preview. The player MUST NOT require a network backend or persist answers to disk.

#### Scenario: Load valid export JSON

- **WHEN** the author selects a valid `export test` JSON file
- **THEN** the player shows the first question and progress (e.g. current index / total)

#### Scenario: Reject invalid JSON

- **WHEN** the selected file is not valid JSON or lacks a `questions` array
- **THEN** the player shows an error and does not start a session

### Requirement: Interactive run with check, skip, and navigation

During a session the player SHALL support answering the current question, checking the answer when auto-gradable, skipping the question, and moving through the question list until the author finishes. Immediate feedback MAY reveal `explanation` and correctness because this is an author preview.

#### Scenario: Check single_choice

- **WHEN** the author selects one option on a `single_choice` question and checks
- **THEN** the player marks the answer correct iff the selection matches the 1-based `correct` index

#### Scenario: Check multi_choice

- **WHEN** the author selects a set of options on a `multi_choice` question and checks
- **THEN** the player marks correct iff the selected 1-based indexes match the `correct` array as a set

#### Scenario: Skip question

- **WHEN** the author skips a question
- **THEN** that question is recorded as skipped (not incorrect) and the player advances

### Requirement: Open and code handling in the player

For `open` questions with `expected`, the player SHALL provide a text field and auto-check using normalized exact match against any expected string. For `open` without `expected`, and for `code` questions, the player SHALL NOT auto-grade (unscored); `code` MAY display `validation.criteria` for human review. Code editing beyond a plain textarea is NOT required.

#### Scenario: Open with expected matches

- **WHEN** the author submits text that equals one `expected` value after trim, whitespace collapse, and case-folding
- **THEN** the player marks the answer correct

#### Scenario: Code is unscored

- **WHEN** the current question has `type: code`
- **THEN** the player does not claim automatic correctness from the submitted text

### Requirement: End-of-run statistics including requirements

When the author finishes, the player SHALL show aggregate counts (answered scored, correct, incorrect, skipped, unscored) and overall percent correct among scored answers, a per-skill breakdown, and a weighted score derived from level `requirements` weights compared to `threshold`.

#### Scenario: Weighted score vs threshold

- **WHEN** the session ends after scored answers across required skills
- **THEN** the stats view shows a weighted score and whether it meets the document `threshold`

#### Scenario: Skipped excluded from wrong

- **WHEN** some questions were skipped
- **THEN** skipped counts appear separately and are not counted as incorrect in the overall percent

### Requirement: Author-preview boundary documented

The player UI and shipped player README (or equivalent short notice) SHALL state that the player is an author/demo preview with answers present in the source JSON, not a secure candidate exam product.

#### Scenario: Notice visible before or during session

- **WHEN** an author opens the player
- **THEN** a short notice communicates the preview/non-exam boundary
