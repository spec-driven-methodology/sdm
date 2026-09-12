## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Session options UI in interface language

Session option labels and timer/picker chrome SHALL match the player UI language (Russian for the current RU player chrome).

#### Scenario: Russian labels for new options

- **WHEN** the author opens the load screen of the RU player
- **THEN** auto-advance, timed-mode, and question-order shuffle controls are labeled in Russian
