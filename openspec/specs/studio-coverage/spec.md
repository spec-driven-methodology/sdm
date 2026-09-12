# studio-coverage

## Purpose

Coverage/gaps phase in Methodology Studio: render пробелы with Russian labels, emit close_gap / suggest_lever actions, and optionally push a live coverage view via CLI — without Studio writing methodology YAML.

## Requirements

### Requirement: View documents may include coverage phase

A `sdm.studio.view/v1` document MAY include a phase with `kind` equal to `coverage`. That phase SHALL include a `skills` array whose entries have at least `id` and `status` (`missing`, `thin`, or `ok`). The phase MAY include `summary` counts, human `name` per skill, depth/count fields, and a `suggestions` array of suggest-like objects with `id`, `label`, and `levers` (`phrase`, `mapsTo`).

#### Scenario: Coverage skills in view

- **WHEN** a view contains a coverage phase with a skill status `missing` and another `thin`
- **THEN** the Studio can render both skills from the document without calling CLI itself

### Requirement: Studio renders coverage with Russian gap labels

When rendering a coverage phase, the Studio SHALL display status labels **не покрыто** for `missing`, **слабо покрыто** for `thin`, and **покрыто** for `ok`. The UI MUST NOT use the word «дыра» in these status labels. When `summary.missing` + `summary.thin` > 0 (or equivalent), the section MAY refer to **пробелы**.

#### Scenario: Missing skill label

- **WHEN** a skill has `status` `missing`
- **THEN** the Studio shows **не покрыто** for that skill

### Requirement: Close gap and suggest lever actions

For each non-ok skill in the coverage phase, the Studio SHALL offer a Russian control such as **Закрыть пробел** that emits `sdm.studio.action/v1` with `type` `close_gap` and the skill id (and profile/level when present on the phase). When suggestions with levers are present, the Studio SHALL render lever phrases as actionable chips that emit `type` `suggest_lever` including `phrase` and `mapsTo`. The Studio MUST NOT write methodology YAML or generate questions itself.

#### Scenario: Close gap emits action

- **WHEN** the author clicks **Закрыть пробел** for skill `docker`
- **THEN** an action with `type` `close_gap` and skill `docker` is produced

#### Scenario: Lever chip emits suggest_lever

- **WHEN** the author activates a lever chip with phrase «сгенерировать черновики»
- **THEN** an action with `type` `suggest_lever` and that phrase/`mapsTo` is produced

### Requirement: studio push-coverage builds bridge view from gaps

The system SHALL provide non-interactive `sdm studio push-coverage --profile <id> --level <id>` that reads live certification gaps (and MAY include suggest suggestions) for the methodology project, writes a valid `sdm.studio.view/v1` document containing a coverage phase into `.sdm/studio/current-view.json`, and supports `--json` success/failure output. The command MUST NOT modify ontology/library/certifications YAML.

#### Scenario: Push coverage writes view

- **WHEN** an agent runs `sdm studio push-coverage --profile <p> --level <l> --json` in a methodology project
- **THEN** stdout has `ok: true` and `current-view.json` contains a coverage phase with skills

#### Scenario: Not a project

- **WHEN** push-coverage runs outside a methodology project
- **THEN** it fails with `NOT_A_PROJECT` (or equivalent)
