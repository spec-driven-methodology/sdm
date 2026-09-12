## ADDED Requirements

### Requirement: Static methodology studio ships with methodology init

The system SHALL include a static HTML/CSS/JS Methodology Studio under `packages/core/templates/methodology/studio/` and SHALL copy it to `<project>/studio/` when `sdm init` creates a methodology project. Existing `studio/` files SHALL follow the same absent-or-force rules as other init scaffolds (including `player/`). The Studio MUST NOT require a network backend to render a loaded view document. Studio MUST remain a separate directory from `player/` (not a tab inside the export player).

#### Scenario: Init creates studio directory

- **WHEN** a user runs `sdm init` in an empty directory
- **THEN** the project contains `studio/index.html` and accompanying studio assets needed to open in a browser without a build step

#### Scenario: Init does not overwrite studio without force

- **WHEN** `studio/index.html` already exists and init runs without `--force`
- **THEN** the existing studio files are left unchanged (skipped)

### Requirement: Studio is display and action-dispatch only

The Studio MUST NOT write files under `ontology/`, `library/`, `certifications/`, or `sdm.yaml`. The Studio MUST NOT call SDM CLI, MCP, or any remote API to mutate methodology. The Studio SHALL only render view documents and emit action documents for an external executor (human/agent/API).

#### Scenario: Confirm does not touch methodology YAML

- **WHEN** the author confirms a plan in the Studio UI
- **THEN** no methodology YAML path is created or modified by the Studio itself
- **AND** an action document of schema `sdm.studio.action/v1` is produced for an external executor

### Requirement: Studio loads sdm.studio.view/v1 documents

The Studio SHALL accept JSON documents with `schemaVersion` equal to `sdm.studio.view/v1` (at least via bundled fixture and file picker and/or drag-and-drop). A valid view document MUST drive the UI phases present in the document. Documents with unsupported `schemaVersion` MUST be rejected with an error that names the unsupported version and the expected studio view version.

#### Scenario: Load valid view fixture

- **WHEN** the author opens Studio with the shipped demo fixture (or loads an equivalent valid view JSON)
- **THEN** the Studio shows the clarifications and/or plan phases contained in that document

#### Scenario: Reject unsupported view version

- **WHEN** the selected file has a `schemaVersion` other than `sdm.studio.view/v1`
- **THEN** the Studio shows an error naming the unsupported version and `sdm.studio.view/v1`

### Requirement: Dynamic clarifications from view options

When a view document includes a clarifications phase, the Studio SHALL render each clarification’s options from the document’s `options` arrays (each option at least `label` and `value`). The Studio MUST NOT hardcode domain option sets such as frontend/backend/fullstack or AI skill packs in application logic. Selecting options and continuing SHALL emit or stage values for a subsequent action (e.g. `answer_clarification`) using the option `value` fields.

#### Scenario: Options come from JSON

- **WHEN** a clarifications phase lists two options with values `backend` and `fullstack`
- **THEN** the Studio shows those two choices from the document
- **AND** does not require built-in enums for those values in Studio source

### Requirement: Plan review and confirm or reject

When a view document includes a plan phase (including an embedded or referenced intent plan with profile, level, skills, links, requirements, and/or seed), the Studio SHALL present a human-readable review (not JSON-only as the sole UI) and SHALL provide Russian-labeled actions **Подтвердить план** and **Отклонить**. Confirm MUST emit `sdm.studio.action/v1` with type `confirm_plan`. Reject MUST emit type `reject_plan`.

#### Scenario: Confirm plan emits action

- **WHEN** the author clicks **Подтвердить план** on a loaded plan phase
- **THEN** the Studio produces a JSON action with `schemaVersion` `sdm.studio.action/v1` and `type` `confirm_plan`

#### Scenario: Reject plan emits action

- **WHEN** the author clicks **Отклонить**
- **THEN** the Studio produces a JSON action with `type` `reject_plan`

### Requirement: Russian author-facing copy and coverage wording

Studio chrome and primary action labels SHALL be in Russian. If the UI displays coverage gap status labels, it MUST use «не покрыто», «слабо покрыто», and/or «пробел» — not «дыра».

#### Scenario: Confirm button label

- **WHEN** a plan phase is shown
- **THEN** the confirm control is labeled **Подтвердить план** (or equivalent Russian wording with the same meaning)
