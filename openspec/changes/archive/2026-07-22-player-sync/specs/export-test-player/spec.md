## ADDED Requirements

### Requirement: Existing projects upgrade player via player sync

For methodology projects created before the player scaffold existed, or when Specra ships a newer player template, authors SHALL use `sdm player sync` (optionally `--force`) rather than full `sdm init --force` to install or refresh `player/` without re-scaffolding the whole project.

#### Scenario: Docs mention player sync for upgrades

- **WHEN** an author reads the player README or Specra README/CHANGELOG entry for the player
- **THEN** `sdm player sync` is documented as the path to add or update the player in an existing project
