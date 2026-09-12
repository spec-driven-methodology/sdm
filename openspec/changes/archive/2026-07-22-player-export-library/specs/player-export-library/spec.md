## ADDED Requirements

### Requirement: Multi-export library in the player

The player SHALL maintain a library of one or more validated `sdm.export.test/v1` documents on the load screen. Loading an additional valid export MUST NOT remove other library entries. The author SHALL select exactly one library entry as the active package before starting a session; a session SHALL run only that selected package.

#### Scenario: Second upload keeps the first

- **WHEN** the author has already loaded a valid export into the library
- **AND** the author loads a second valid export with a different source name
- **THEN** both entries appear in the library
- **AND** either can be selected for «Начать»

#### Scenario: Start uses selected package only

- **WHEN** the library contains two packages and the author selects one
- **AND** presses «Начать»
- **THEN** the session questions come only from the selected package

### Requirement: Persist library in localStorage

The player SHALL persist the export library in `localStorage` under a stable key namespace (`sdm.player.*`) so that after a full page reload the previously loaded packages are still listed without re-selecting files. Persistence MUST store enough data to reconstitute each document for a new session. Session answers and outcomes MUST NOT be required to persist with the library.

#### Scenario: Reload restores library

- **WHEN** the author has loaded at least one valid export into the library
- **AND** reloads the player page
- **THEN** the library still lists that package
- **AND** the author can start a session from it without picking the file again

#### Scenario: Quota failure is surfaced

- **WHEN** saving the library to `localStorage` fails (e.g. quota exceeded)
- **THEN** the player shows an error in the UI language
- **AND** existing in-memory library entries remain usable for the current page session when possible

### Requirement: Remove library entries

The player SHALL let the author delete a library entry. Deletion MUST remove that entry from the UI and from the persisted `localStorage` library. If the deleted entry was selected, the player SHALL clear or reassign selection so «Начать» does not start a removed package.

#### Scenario: Delete removes from storage

- **WHEN** the author deletes a library entry
- **AND** reloads the player page
- **THEN** that entry no longer appears in the library

#### Scenario: Delete clears selection when needed

- **WHEN** the selected library entry is deleted
- **THEN** «Начать» does not start a session until another valid entry is selected (or the library is empty and start stays unavailable)

### Requirement: Add paths feed the library

File picker (including multi-file when supported), drag-and-drop, and one-click load from a discovered `exports/` list SHALL add validated documents to the library (upsert by source name is allowed). Invalid files MUST NOT add an entry and MUST show an error without wiping the library.

#### Scenario: Invalid file leaves library intact

- **WHEN** the library already has one valid entry
- **AND** the author picks a file that is not valid export JSON
- **THEN** the player shows an error
- **AND** the existing library entry remains
