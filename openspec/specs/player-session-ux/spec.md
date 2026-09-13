# player-session-ux

## Purpose

Session UX for the static export-test player: export picker, optional auto-advance, optional timed run, optional question-order shuffle — without letting the player choose question count N.

## Requirements

### Requirement: Export test picker before session

The player SHALL allow the author to choose a `sdm.export.test/v1` JSON via the existing file picker/drag-and-drop and SHALL, when feasible (e.g. HTTP context with a discoverable `exports/` directory), present a list of candidate JSON files to load with one click. When listing is unavailable, the player SHALL still work with manual file selection only. Successful picks SHALL add the document to the player export library (see `player-export-library`) rather than replacing the only in-memory package. The load screen SHALL present the library of loaded packages so the author can select which one to start.

#### Scenario: Manual file selection still works

- **WHEN** the author picks a valid export JSON via the file input
- **THEN** the player adds the document to the library and can start a session from the selected entry

#### Scenario: Listed export loads when available

- **WHEN** the player successfully discovers at least one JSON under an exports folder
- **AND** the author clicks one listed file
- **THEN** that document is added to the library and available for session start

#### Scenario: Multiple manual loads accumulate

- **WHEN** the author picks two different valid export files in sequence
- **THEN** both appear in the loaded-packages library on the load screen

### Requirement: Optional auto-advance after check

The player SHALL provide a session option (default off) that, after a successful Check with feedback shown, automatically advances to the next question after a short delay (~1 second). Manual Next/Skip/Prev/Finish SHALL cancel any pending auto-advance timer.

#### Scenario: Auto-advance off by default

- **WHEN** the author starts a session without enabling auto-advance
- **THEN** after Check the player waits for an explicit Next (or Skip/Finish)

#### Scenario: Auto-advance moves forward

- **WHEN** auto-advance is enabled and the author Checks a non-final question
- **THEN** after the delay the player shows the next question

### Requirement: Optional timed session

The player SHALL provide a session option to enable a total time budget for the run. When enabled, the budget defaults to a function of question count (questions × configured seconds-per-question) and MAY allow the author to override the total duration before start. While timed, the player SHALL show remaining time; when it reaches zero the session SHALL finish automatically (remaining unanswered treated as skipped). The author MAY finish early at any time via Finish regardless of the timer. Timed mode SHALL be off by default.

#### Scenario: Time up finishes the test

- **WHEN** timed mode is on and remaining time reaches zero with unanswered questions
- **THEN** the player ends the session and shows stats
- **AND** unanswered questions are counted as skipped

#### Scenario: Early finish while timed

- **WHEN** timed mode is on and the author presses Finish before time is up
- **THEN** the session ends immediately with current outcomes

#### Scenario: Untimed session ignores countdown

- **WHEN** timed mode is off
- **THEN** no countdown constrains the session

### Requirement: Player does not choose question count N

The player MUST NOT offer a control to reduce or sample the number of questions from a loaded package. Question count is determined solely by the export document produced by SDM (`export test`).

#### Scenario: No N picker in UI

- **WHEN** an author loads a package with 24 questions
- **THEN** the session presents those 24 questions (subject to skip/finish/timer) without a “take only K questions” control

### Requirement: Optional question-order shuffle

The player SHALL provide a session option (default off) that, when enabled, permutes the order of questions for that session when the author starts (**Начать**). The permutation SHALL use a uniform random shuffle of the loaded package’s questions. The on-disk / loaded export document MUST NOT be modified. Each new start with the option enabled SHALL shuffle again (including after returning home and restarting the same loaded package). When the option is off, the player SHALL present questions in export order.

#### Scenario: Shuffle off keeps export order

- **WHEN** the author starts a session with question-order shuffle disabled
- **THEN** questions appear in the same order as in the loaded `sdm.export.test/v1` document

#### Scenario: Shuffle on permutes at start

- **WHEN** the author enables question-order shuffle and presses start on a package with at least two questions
- **THEN** the session question sequence is a permutation of the package questions (same set and count)
- **AND** the loaded document used for title/meta is not rewritten

#### Scenario: Retake reshuffles

- **WHEN** question-order shuffle is enabled
- **AND** the author finishes (or returns home) and starts the same loaded package again
- **THEN** the player applies a new shuffle for the new session

### Requirement: Optional answer-option shuffle

The player SHALL provide a session option (default off) that, when enabled, permutes the `options` of each `single_choice` and `multi_choice` question for that session when the author starts (**Начать**), remapping 1-based `correct` to match. The permutation SHALL use a uniform random shuffle per choice question on a session-local copy. The loaded export document in memory/library/`localStorage` MUST NOT be permanently rewritten. Each new start with the option enabled SHALL shuffle options again. When the option is off, option order SHALL match the loaded document. This option MUST be independent of question-order shuffle.

#### Scenario: Option shuffle off keeps export option order

- **WHEN** the author starts a session with answer-option shuffle disabled
- **THEN** choice questions present options in the same order as in the loaded `sdm.export.test/v1` document

#### Scenario: Option shuffle on remaps correct

- **WHEN** the author enables answer-option shuffle and starts a package containing a `single_choice` question
- **THEN** the session shows a permutation of that question’s options
- **AND** checking the option text that was correct in the export still grades as correct

#### Scenario: Retake reshuffles options

- **WHEN** answer-option shuffle is enabled
- **AND** the author finishes (or returns home) and starts the same loaded package again
- **THEN** the player applies a new option permutation for the new session

#### Scenario: Persisted preference

- **WHEN** the author toggles answer-option shuffle
- **THEN** the preference is persisted in `localStorage` under a stable key (e.g. `sdm.player.shuffleOptions`) and restored on next load

### Requirement: Session options UI in interface language

Session option labels and timer/picker chrome SHALL match the player UI language (Russian for the current RU player chrome).

#### Scenario: Russian labels for new options

- **WHEN** the author opens the load screen of the RU player
- **THEN** auto-advance, timed-mode, question-order shuffle, and answer-option shuffle controls are labeled in Russian
