## ADDED Requirements

### Requirement: Studio shows coverage phase when present

When a loaded view includes a `coverage` phase, the Studio SHALL render it in the work view (alongside or after other phases as appropriate) using studio-coverage labeling and action rules, without requiring a separate product surface.

#### Scenario: Coverage with plan in one view

- **WHEN** a view includes both `plan` and `coverage` phases
- **THEN** the author can see coverage/пробелы in Studio for that view session
