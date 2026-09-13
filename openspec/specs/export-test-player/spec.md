# export-test-player

## Purpose

Ship a static author-preview player for `sdm.export.test/v1` packages, scaffolded into methodology projects on `sdm init`.

## Requirements

### Requirement: Static export test player ships with methodology init

The system SHALL include a static HTML/CSS/JS export-test player under `packages/core/templates/methodology/player/` and SHALL copy it to `<project>/player/` when `sdm init` creates a methodology project (including when `--with-examples` is not set). Existing `player/` files SHALL follow the same absent-or-force rules as other init scaffolds.

#### Scenario: Init creates player directory

- **WHEN** a user runs `sdm init` in an empty directory
- **THEN** the project contains `player/index.html` and the accompanying player assets needed to run in a browser without a build step

#### Scenario: Init does not overwrite player without force

- **WHEN** `player/index.html` already exists and init runs without `--force`
- **THEN** the existing player files are left unchanged (skipped)

### Requirement: Player loads sdm.export.test/v1 documents

The player SHALL let the author load JSON documents with `schemaVersion` `sdm.export.test/v1` (file picker and/or drag-and-drop) into a client-side library of packages, select one package, and present that package’s title, profile, level, and questions for interactive preview. The player MUST NOT require a network backend. The player MAY persist loaded packages in browser `localStorage` for author convenience; it MUST NOT persist session answers to disk as a product feature.

#### Scenario: Load valid export JSON

- **WHEN** the author selects a valid `export test` JSON file
- **THEN** the player adds it to the library and, once started, shows the first question and progress (e.g. current index / total)

#### Scenario: Reject invalid JSON

- **WHEN** the selected file is not valid JSON or lacks a `questions` array
- **THEN** the player shows an error and does not start a session
- **AND** previously loaded library entries remain available

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

### Requirement: Existing projects upgrade player via player sync

For methodology projects created before the player scaffold existed, or when SDM ships a newer player template, authors SHALL use `sdm player sync` (optionally `--force`) rather than full `sdm init --force` to install or refresh `player/` without re-scaffolding the whole project.

#### Scenario: Docs mention player sync for upgrades

- **WHEN** an author reads the player README or SDM README/CHANGELOG entry for the player
- **THEN** `sdm player sync` is documented as the path to add or update the player in an existing project

### Requirement: Session UX options ship with player template

The shipped static player template SHALL include the session UX capabilities defined by `player-session-ux` and the export library capabilities defined by `player-export-library` (multi-package library, localStorage persist, select/remove). Existing projects obtain updates via `sdm player sync` (optionally `--force`).

#### Scenario: Sync refreshes session UX

- **WHEN** SDM ships an updated player template with session UX and export library and the author runs `sdm player sync --force`
- **THEN** the project's `player/` assets include the new session option controls and the loaded-packages library UI

### Requirement: Shipped player supports course preview mode

The static HTML/CSS/JS player scaffolded under `packages/core/templates/methodology/player/` (and copied into methodology projects on init / player sync) SHALL include author-preview support for `sdm.export.course/v1` in addition to `sdm.export.test/v1`, including a Тесты/Курсы mode switch and a course reader view. Course preview MUST remain client-side only and MUST NOT claim LMS progress tracking.

#### Scenario: Synced player template includes course UI

- **WHEN** a methodology project receives the current player template via init or `player sync`
- **THEN** the player assets include the Тесты/Курсы mode switch and course reader markup/logic needed to open a valid course export without a build step
