## ADDED Requirements

### Requirement: Studio bridge file exchange under .sdm/studio

The system SHALL store ephemeral Studio bridge documents under `<project>/.sdm/studio/`: `current-view.json` for the active view and `last-action.json` for the latest action. These paths MUST NOT be part of the shipped `studio/` template tree. Bridge files MUST be listed in the methodology project `.gitignore` for new `sdm init` projects (pattern covering `.sdm/studio/`).

#### Scenario: Push view writes current-view.json

- **WHEN** an agent runs `sdm studio push-view` with a valid `sdm.studio.view/v1` document in a methodology project
- **THEN** `<project>/.sdm/studio/current-view.json` contains that document

#### Scenario: Pull action reads last-action.json

- **WHEN** `last-action.json` exists and the agent runs `sdm studio pull-action --json`
- **THEN** stdout reports `ok: true` and the action payload with `schemaVersion` `sdm.studio.action/v1`

### Requirement: studio push-view command

The system SHALL provide non-interactive `sdm studio push-view` that accepts a file path argument or stdin (`-`), validates that the JSON has `schemaVersion` equal to `sdm.studio.view/v1`, and writes it to the bridge view path. It SHALL support `--json` success/failure output. Invalid documents MUST fail with a stable SdmError code (e.g. `STUDIO_VIEW_INVALID`) and non-zero exit. The command MUST NOT modify methodology YAML.

#### Scenario: Push invalid schema fails

- **WHEN** push-view receives JSON with a different `schemaVersion`
- **THEN** the command fails with a stable error code and does not overwrite a previous valid view unless the implementation documents atomic replace-on-success only (MUST NOT write invalid content as the current view)

#### Scenario: Not a project

- **WHEN** push-view runs outside a methodology project
- **THEN** it fails with `NOT_A_PROJECT` (or equivalent)

### Requirement: studio pull-action command

The system SHALL provide `sdm studio pull-action` with `--json` that reads `last-action.json`. When no action file exists, the command SHALL succeed with `ok: true` and `action: null` (or equivalent empty indicator) rather than treating absence as a hard project error. With `--consume`, after a successful read of a present action the file SHALL be removed (or cleared) so a subsequent pull returns null until a new action is posted.

#### Scenario: Consume clears action

- **WHEN** an action exists and the agent runs `sdm studio pull-action --json --consume`
- **THEN** the action is returned once
- **AND** a following pull reports no action

### Requirement: Localhost studio serve bridge API

The system SHALL provide `sdm studio serve [--port <n>]` that binds to `127.0.0.1` (localhost only), serves static files from `<project>/studio/`, and exposes:

- `GET /bridge/status` — bridge available marker
- `GET /bridge/view` — current view JSON (404 if missing)
- `POST /bridge/action` — body is `sdm.studio.action/v1` JSON written to `last-action.json`

The serve process MUST NOT write under `ontology/`, `library/`, `certifications/`, or `sdm.yaml`. It MAY create/update only `.sdm/studio/*` bridge files and serve existing studio assets.

#### Scenario: POST action persists for pull-action

- **WHEN** Studio (or a client) POSTs a valid action to `/bridge/action` while serve is running
- **THEN** `sdm studio pull-action --json` returns that action

#### Scenario: Serve rejects non-localhost bind by default

- **WHEN** `sdm studio serve` starts with default options
- **THEN** it listens on `127.0.0.1` (not `0.0.0.0`)
