# player-export-library

## Purpose

Client-side library of loaded `sdm.export.test/v1` packages in the static export-test player: multi-file accumulate, localStorage persist, select and remove.

## Requirements

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

The player SHALL persist the export library in `localStorage` under a stable key namespace (`sdm.player.*`) that is scoped per player instance / methodology project path so that after a full page reload of the same player the previously loaded packages for that project are still listed without re-selecting files, and a different project's player does not share that library. Persistence MUST store enough data to reconstitute each document for a new session. Session answers and outcomes MUST NOT be required to persist with the library. The selected export id for that project SHALL be persisted with the same scoping rules as the library.

#### Scenario: Reload restores library

- **WHEN** the author has loaded at least one valid export into the library
- **AND** reloads the player page (same player path)
- **THEN** the library still lists that package
- **AND** the author can start a session from it without picking the file again

#### Scenario: Quota failure is surfaced

- **WHEN** saving the library to `localStorage` fails (e.g. quota exceeded)
- **THEN** the player shows an error in the UI language
- **AND** existing in-memory library entries remain usable for the current page session when possible

### Requirement: Library storage is project-scoped

The player SHALL persist the export library and selected export id under `localStorage` keys that include a scope derived from the player instance location (methodology project path / player directory), not only a global `sdm.player.exportLibrary` key shared by all projects on the same browser origin. Opening the player for methodology project B MUST NOT list library entries that were persisted while using the player for methodology project A when A and B have distinct player paths. Session preference keys (`autoNext`, shuffle, timed, minutes) MAY remain globally shared under `sdm.player.*`.

#### Scenario: New project does not show another project's library

- **WHEN** the author has loaded at least one valid export in project A's player and it was persisted
- **AND** the author opens a different methodology project's player (distinct player directory path) for the first time with an empty in-project library history
- **THEN** that player MUST show an empty library (no entries from project A)
- **AND** the author can add exports without seeing project A's packages

#### Scenario: Same project reload still restores library

- **WHEN** the author has loaded at least one valid export in a project's player
- **AND** reloads that same player page (same player path)
- **THEN** the library still lists that package
- **AND** the author can start a session from it without picking the file again

#### Scenario: Legacy unscoped key is not auto-imported

- **WHEN** `localStorage` still contains a legacy unscoped library key from before project scoping
- **AND** the author opens a player that uses scoped keys
- **THEN** the player MUST NOT populate the scoped library from that legacy key automatically
- **AND** the scoped library starts empty until the author adds exports through the normal add paths

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

### Requirement: Typed libraries for tests and courses

The player SHALL maintain separate client-side libraries for validated `sdm.export.test/v1` packages and validated `sdm.export.course/v1` packages. Loading a course MUST NOT remove test library entries, and loading a test MUST NOT remove course library entries. Persistence in `localStorage` SHALL use distinct scoped keys (or an equivalent typed namespace) under the existing per-player-path scoping rules so tests and courses for the same project do not overwrite each other.

#### Scenario: Course load keeps test library

- **WHEN** the author has a test package in the test library
- **AND** loads a valid course package
- **THEN** the test library still lists the test package
- **AND** the course library lists the course package

#### Scenario: Reload restores both libraries

- **WHEN** the author has loaded at least one test and one course into their respective libraries
- **AND** reloads the player page (same player path)
- **THEN** both libraries still list their packages without re-selecting files

### Requirement: exports discovery classifies by schemaVersion

When the player discovers JSON files under `exports/` (HTTP), it SHALL classify each file by `schemaVersion` and offer it for the matching library (test vs course). Selecting a discovered course file MUST NOT fail solely because the player expected a test schema.

#### Scenario: Discovered course file loads as course

- **WHEN** `exports/` contains a valid `sdm.export.course/v1` JSON
- **AND** the author selects that entry from the discovery list
- **THEN** the player adds it to the course library without a test-schema validation error
