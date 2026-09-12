## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Session options UI in interface language

Session option labels and timer/picker chrome SHALL match the player UI language (Russian for the current RU player chrome).

#### Scenario: Russian labels for new options

- **WHEN** the author opens the load screen of the RU player
- **THEN** auto-advance, timed-mode, question-order shuffle, and answer-option shuffle controls are labeled in Russian
