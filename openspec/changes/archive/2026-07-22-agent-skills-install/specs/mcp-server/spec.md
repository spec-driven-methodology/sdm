## ADDED Requirements

### Requirement: Optional project argument on domain tools

Domain MCP tools that operate on a methodology project SHALL accept an optional `project` string argument (absolute or resolvable path to a directory containing `sdm.yaml` or an ancestor). Resolution order SHALL be: explicit `project` arg → `SDM_PROJECT_ROOT` env → process cwd. Tools SHALL then resolve the project via `findProjectRoot` as today.

#### Scenario: doctor with explicit project

- **WHEN** a host calls `doctor` with `project` set to a valid methodology directory while cwd is elsewhere
- **THEN** the tool returns `ok: true` and `projectRoot` for that methodology

#### Scenario: skill_add without project uses env or cwd

- **WHEN** a host calls `skill_add` without `project` and `SDM_PROJECT_ROOT` is unset
- **THEN** the tool uses `process.cwd()` as the start directory for project discovery
