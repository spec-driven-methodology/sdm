## ADDED Requirements

### Requirement: studio sync does not touch bridge state

`sdm studio sync` (with or without `--force`) MUST NOT delete, overwrite, or clear files under `<project>/.sdm/studio/` (bridge `current-view.json` / `last-action.json`). Sync remains limited to the `studio/` template tree.

#### Scenario: Force sync preserves bridge files

- **WHEN** `.sdm/studio/current-view.json` exists and the user runs `sdm studio sync --force`
- **THEN** that bridge file still exists with the same content
- **AND** files under `studio/` are refreshed from the template
