## ADDED Requirements

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

## MODIFIED Requirements

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
