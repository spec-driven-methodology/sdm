## ADDED Requirements

### Requirement: Session UX options ship with player template

The shipped static player template SHALL include the session UX capabilities defined by `player-session-ux` (export picker enhancements, optional auto-advance, optional timed session). Existing projects obtain updates via `sdm player sync` (optionally `--force`).

#### Scenario: Sync refreshes session UX

- **WHEN** Specra ships an updated player template with session UX and the author runs `sdm player sync --force`
- **THEN** the project's `player/` assets include the new session option controls
