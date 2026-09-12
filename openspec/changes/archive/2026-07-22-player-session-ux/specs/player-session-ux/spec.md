## ADDED Requirements

### Requirement: Export test picker before session

The player SHALL allow the author to choose a `sdm.export.test/v1` JSON via the existing file picker/drag-and-drop and SHALL, when feasible (e.g. HTTP context with a discoverable `exports/` directory), present a list of candidate JSON files to load with one click. When listing is unavailable, the player SHALL still work with manual file selection only.

#### Scenario: Manual file selection still works

- **WHEN** the author picks a valid export JSON via the file input
- **THEN** the player loads the document and can start a session

#### Scenario: Listed export loads when available

- **WHEN** the player successfully discovers at least one JSON under an exports folder
- **AND** the author clicks one listed file
- **THEN** that document is loaded into the session flow

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

The player MUST NOT offer a control to reduce or sample the number of questions from a loaded package. Question count is determined solely by the export document produced by Specra (`export test`).

#### Scenario: No N picker in UI

- **WHEN** an author loads a package with 24 questions
- **THEN** the session presents those 24 questions (subject to skip/finish/timer) without a “take only K questions” control

### Requirement: Session options UI in interface language

Session option labels and timer/picker chrome SHALL match the player UI language (Russian for the current RU player chrome).

#### Scenario: Russian labels for new options

- **WHEN** the author opens the load screen of the RU player
- **THEN** auto-advance and timed-mode controls are labeled in Russian
