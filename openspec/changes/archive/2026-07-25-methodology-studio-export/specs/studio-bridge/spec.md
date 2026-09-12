## ADDED Requirements

### Requirement: studio serve mounts player and exports read-only

`sdm studio serve` SHALL serve static files from `<project>/player/` under the URL prefix `/player/` and from `<project>/exports/` under `/exports/` when those directories exist. These mounts are read-only: the serve process MUST NOT create or modify files under `player/` or `exports/` in response to Studio bridge actions. Path traversal outside those roots MUST be rejected. If `player/` or `exports/` is missing, requests under that prefix MAY return 404 without failing the whole server.

#### Scenario: GET player index

- **WHEN** `studio serve` runs in a project that has `player/index.html`
- **THEN** `GET /player/index.html` (or `/player/`) returns that file

#### Scenario: Bridge still does not write methodology

- **WHEN** a client POSTs to `/bridge/action`
- **THEN** only `.sdm/studio/` bridge files may be written (not `exports/`, `player/`, or methodology YAML)
