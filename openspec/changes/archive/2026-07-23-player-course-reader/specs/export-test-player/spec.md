## ADDED Requirements

### Requirement: Shipped player supports course preview mode

The static HTML/CSS/JS player scaffolded under `packages/core/templates/methodology/player/` (and copied into methodology projects on init / player sync) SHALL include author-preview support for `sdm.export.course/v1` in addition to `sdm.export.test/v1`, including a Тесты/Курсы mode switch and a course reader view. Course preview MUST remain client-side only and MUST NOT claim LMS progress tracking.

#### Scenario: Synced player template includes course UI

- **WHEN** a methodology project receives the current player template via init or `player sync`
- **THEN** the player assets include the Тесты/Курсы mode switch and course reader markup/logic needed to open a valid course export without a build step
