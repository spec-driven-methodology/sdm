## ADDED Requirements

### Requirement: View documents may include export-form phase

A `sdm.studio.view/v1` document MAY include a phase with `kind` equal to `export-form`. That phase SHALL declare `fields` as an array of field descriptors. Each field MUST have at least `id`, `widget`, and `label`. For `widget` `multi`, the field MUST include an `options` array of `{ label, value }` entries supplied by the document (not by Studio hardcoding domain types). The phase MAY include `defaults` (e.g. profile/level) and `target` hint (e.g. `export_test`).

#### Scenario: Multi field options from JSON

- **WHEN** an export-form field has widget `multi` with options for `single_choice` and `multi_choice`
- **THEN** the Studio shows those options from the document values
- **AND** does not require built-in question-type enums in Studio source to render them

### Requirement: Export form emits export_test action

When the author submits the export form, the Studio SHALL emit a `sdm.studio.action/v1` document with `type` `export_test` and a `values` object containing the selected field values (and MUST NOT write methodology YAML or run `export test` itself). When the bridge is available, the action SHALL also be POSTed to `/bridge/action` as for other actions.

#### Scenario: Submit export form

- **WHEN** the author fills the export-form and clicks the Russian submit control (e.g. **Экспортировать тест**)
- **THEN** an action with `type` `export_test` and populated `values` is produced for an external executor

### Requirement: Player handoff after export intent

The Studio SHALL provide a clear Russian control to open the author Player preview (e.g. **Открыть Player**). When the page is served by `sdm studio serve`, the control MUST navigate to the served `/player/` path. The Studio MUST NOT claim to be an LMS or candidate exam.

#### Scenario: Handoff link under serve

- **WHEN** Studio is open via `studio serve`
- **THEN** **Открыть Player** points at `/player/` (or `/player/index.html`) on the same origin
