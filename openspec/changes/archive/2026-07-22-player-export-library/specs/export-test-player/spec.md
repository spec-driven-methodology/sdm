## MODIFIED Requirements

### Requirement: Player loads sdm.export.test/v1 documents

The player SHALL let the author load JSON documents with `schemaVersion` `sdm.export.test/v1` (file picker and/or drag-and-drop) into a client-side library of packages, select one package, and present that package’s title, profile, level, and questions for interactive preview. The player MUST NOT require a network backend. The player MAY persist loaded packages in browser `localStorage` for author convenience; it MUST NOT persist session answers to disk as a product feature.

#### Scenario: Load valid export JSON

- **WHEN** the author selects a valid `export test` JSON file
- **THEN** the player adds it to the library and, once started, shows the first question and progress (e.g. current index / total)

#### Scenario: Reject invalid JSON

- **WHEN** the selected file is not valid JSON or lacks a `questions` array
- **THEN** the player shows an error and does not start a session
- **AND** previously loaded library entries remain available

### Requirement: Session UX options ship with player template

The shipped static player template SHALL include the session UX capabilities defined by `player-session-ux` and the export library capabilities defined by `player-export-library` (multi-package library, localStorage persist, select/remove). Existing projects obtain updates via `sdm player sync` (optionally `--force`).

#### Scenario: Sync refreshes session UX

- **WHEN** Specra ships an updated player template with session UX and export library and the author runs `sdm player sync --force`
- **THEN** the project's `player/` assets include the new session option controls and the loaded-packages library UI
