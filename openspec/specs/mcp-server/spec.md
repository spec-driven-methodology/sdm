# mcp-server

## Purpose

Stdio MCP server exposing SDM domain operations as tools for AI hosts.
## Requirements
### Requirement: Stdio MCP server exposes SDM domain tools

The repository SHALL ship an `@spec-driven-methodology/mcp` package that runs an MCP server over stdio and exposes tools matching `TOOL_NAMES` / `ABOUT_MCP_TOOLS`, including: `about`, `suggest`, `doctor`, `audit`, `quality_report`, `init`, `player_sync`, `skill_add`, `skill_link`, `skill_graph`, `skill_impact`, `profile_create`, `cert_create`, `cert_patch`, `cert_reweight`, `cert_coverage`, `cert_gaps`, `question_add`, `question_validate`, `question_list`, `question_generate`, `export_test`, `export_matrix`, `export_learning`, `export_course`, `export_mermaid`, `export_confluence`, `index_rebuild`, `search`, and `content_stale`. Methodology Studio tools (`studio_sync`, `studio_push_view`, etc.) are removed — obsidian-sdm replaces Studio. Tools SHALL call `@spec-driven-methodology/core`.

#### Scenario: Tool returns JSON payload

- **WHEN** a host calls `question_list` against a methodology project cwd
- **THEN** the tool result MUST contain JSON text with `ok: true` and a `questions` array (or `ok: false` with a SdmError code on failure)

#### Scenario: Protocol uses stdout exclusively for MCP

- **WHEN** the MCP server is running
- **THEN** operational logs MUST go to stderr, not stdout

#### Scenario: Tool list includes quality and player tools

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `quality_report` and `player_sync`, and MUST NOT include `studio_serve` or any `studio_*` tool

#### Scenario: Tool list includes export and generate

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `question_generate`, `export_test`, `export_matrix`, and `export_mermaid` in addition to coverage/CRUD tools

#### Scenario: Tool list includes profile_create

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `profile_create`

#### Scenario: Tool list includes cert_reweight

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `cert_reweight`

#### Scenario: Tool list includes about

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `about`

#### Scenario: Tool list includes suggest

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `suggest`

### Requirement: MCP tool cert_reweight
The `@spec-driven-methodology/mcp` server SHALL expose tool `cert_reweight` that calls `@spec-driven-methodology/core` reweight logic and returns JSON text with `ok: true` and before/after weight maps on success, or `ok: false` with a SdmError `code` on failure. The tool SHALL accept optional `project`, required `level`, and either transfer fields (`skill`, `delta`, `from`) or a full `set` weight map.

#### Scenario: cert_reweight transfer success
- **WHEN** a host calls `cert_reweight` with a valid level, target skill, positive delta, and donor with sufficient weight
- **THEN** the tool result MUST contain JSON text with `ok: true`, `before`, and `after`

### Requirement: MCP cert_patch supports weight transfer args
The MCP `cert_patch` tool SHALL accept optional transfer arguments equivalent to CLI `--from` / `--absorb-into` so agents can add or remove requirements without silent renormalization.

#### Scenario: cert_patch add with from
- **WHEN** a host calls `cert_patch` with `addRequirements` and matching `from` transfer amounts that keep sum ≈ 1
- **THEN** the tool returns `ok: true` and the level reflects the transfer

### Requirement: MCP tools for methodology export
The `@spec-driven-methodology/mcp` server SHALL expose tools `export_test` and `export_matrix` that call `@spec-driven-methodology/core` export assemblers and return JSON text with `ok: true` and the export `document` (plus `format`) on success, or `ok: false` with a SdmError `code` on failure.

#### Scenario: export_test tool success
- **WHEN** a host calls `export_test` with profile and level against a valid methodology project cwd
- **THEN** the tool result MUST contain JSON text with `ok: true`, `format`, and `document` for the assembled test package

#### Scenario: export_matrix tool success
- **WHEN** a host calls `export_matrix` with profile against a valid methodology project cwd
- **THEN** the tool result MUST contain JSON text with `ok: true`, `format`, and `document` for the assembled matrix

### Requirement: export_test supports type filter args

The MCP tool `export_test` SHALL accept optional `includeTypes` and `excludeTypes` as arrays of question type strings, with the same semantics and mutual exclusion as CLI `--include-type` / `--exclude-type`. On success the returned `document` SHALL reflect the filtered package and `meta.typeFilter` when a filter was applied. On conflict or invalid type the tool SHALL return `ok: false` with the same SdmError codes as the CLI (`EXPORT_TYPE_FILTER_CONFLICT`, `EXPORT_TYPE_INVALID`).

#### Scenario: MCP exclude open

- **WHEN** a host calls `export_test` with `excludeTypes: ["open"]` against a valid project
- **THEN** the tool returns `ok: true` and `document.questions` has no `open` items

#### Scenario: MCP include/exclude conflict

- **WHEN** a host calls `export_test` with both non-empty `includeTypes` and `excludeTypes`
- **THEN** the tool returns `ok: false` with code `EXPORT_TYPE_FILTER_CONFLICT`

### Requirement: MCP tool registration is import-safe
Importing the MCP tool registration module MUST NOT start the stdio transport. Stdio connect SHALL occur only from the package entrypoint (`index` / `sdm-mcp` bin).

#### Scenario: Tests import handlers without hanging
- **WHEN** the test suite imports the tool registration / handler module
- **THEN** the process MUST NOT block waiting on stdio MCP transport

### Requirement: MCP tool for Mermaid export
The `@spec-driven-methodology/mcp` server SHALL expose tool `export_mermaid` that calls `@spec-driven-methodology/core` Mermaid export and returns JSON text with `ok: true`, `format`, and `document` on success, or `ok: false` with a SdmError `code` on failure.

#### Scenario: export_mermaid tool success
- **WHEN** a host calls `export_mermaid` with profile and level against a valid methodology project cwd
- **THEN** the tool result MUST contain JSON text with `ok: true` and a `document` including `schemaVersion` `sdm.export.mermaid/v1`

### Requirement: MCP skill_graph and skill_impact tools
The MCP server SHALL expose tools `skill_graph` and `skill_impact` mirroring the CLI domain operations with JSON payloads.

#### Scenario: skill_graph tool
- **WHEN** an MCP client calls `skill_graph` with profile and level
- **THEN** the tool returns JSON with `ok: true` and a graph document

#### Scenario: skill_impact tool
- **WHEN** an MCP client calls `skill_impact` with a skill id
- **THEN** the tool returns JSON with `ok: true` and an impact document

### Requirement: Optional project argument on domain tools

Domain MCP tools that operate on a methodology project SHALL accept an optional `project` string argument (absolute or resolvable path to a directory containing `sdm.yaml` or an ancestor). Resolution order SHALL be: explicit `project` arg → `SDM_PROJECT_ROOT` env → process cwd. Tools SHALL then resolve the project via `findProjectRoot` as today.

#### Scenario: doctor with explicit project

- **WHEN** a host calls `doctor` with `project` set to a valid methodology directory while cwd is elsewhere
- **THEN** the tool returns `ok: true` and `projectRoot` for that methodology

#### Scenario: skill_add without project uses env or cwd

- **WHEN** a host calls `skill_add` without `project` and `SDM_PROJECT_ROOT` is unset
- **THEN** the tool uses `process.cwd()` as the start directory for project discovery

### Requirement: MCP tool about

The `@spec-driven-methodology/mcp` server SHALL expose tool `about` that returns JSON text with the same about payload as `sdm about --json` (`ok: true`, version, positioning, capabilities, nextSteps, pointers). The tool MUST NOT require a methodology project. Optional `project` MAY be accepted for schema uniformity but MUST NOT be required for success.

#### Scenario: about tool success without project

- **WHEN** a host calls `about` with no project argument
- **THEN** the tool result MUST contain JSON text with `ok: true`, a `version` string, and `positioning`

#### Scenario: about matches CLI contract

- **WHEN** a host calls `about` and separately runs `sdm about --json` from the same SDM install
- **THEN** both payloads share the same field set for version, positioning, capabilities, nextSteps, and pointers

### Requirement: Tool list includes about

When a host lists SDM MCP tools, the set MUST include `about`.

#### Scenario: about is listed

- **WHEN** a host lists SDM MCP tools
- **THEN** the set includes `about`

### Requirement: MCP tool suggest

The `@spec-driven-methodology/mcp` server SHALL expose tool `suggest` that returns JSON text with the same suggest payload as `sdm suggest --json` (`ok: true`, snapshot, suggestions with levers). The tool SHALL accept optional `project`, `profile`, and `level`. On missing methodology project it SHALL return `ok: false` with the same SdmError code as the CLI.

#### Scenario: suggest tool success

- **WHEN** a host calls `suggest` with a valid `project` and resolvable profile/level focus
- **THEN** the tool result MUST contain JSON text with `ok: true` and a `suggestions` array of length 1 to 5

#### Scenario: suggest without project fails like CLI

- **WHEN** a host calls `suggest` with no resolvable methodology project
- **THEN** the tool returns `ok: false` with a stable SdmError code

### Requirement: Tool list includes suggest

When a host lists SDM MCP tools, the set MUST include `suggest`.

#### Scenario: suggest is listed

- **WHEN** a host lists SDM MCP tools
- **THEN** the set includes `suggest`

### Requirement: MCP studio bridge tools removed

Methodology Studio is removed; MCP server MUST NOT expose `studio_sync`, `studio_push_view`, `studio_push_coverage`, or `studio_pull_action`. obsidian-sdm replaces the Studio interaction layer.

### Requirement: export_test supports skill and question filters

The MCP tool `export_test` SHALL accept optional `includeSkills` and `excludeSkills` as arrays of skill id strings, and optional `includeQuestions` as an array of question id strings, with the same semantics, mutual exclusion, filter pipeline order, document `meta` fields, and SdmError codes as CLI `export test` (`EXPORT_SKILL_FILTER_CONFLICT`, `EXPORT_SKILL_UNKNOWN`, `EXPORT_QUESTION_NOT_FOUND`, `EXPORT_FILTER_EMPTY`). On success the returned `document` SHALL reflect the filtered package. These args MAY be combined with existing `includeTypes` / `excludeTypes` under the same pipeline rules as the CLI.

#### Scenario: export_test includeSkills

- **WHEN** a host calls `export_test` with `includeSkills: ["ai-quality"]` against a valid project and profile/level that requires that skill
- **THEN** the tool returns `ok: true` and every `document.questions[].skill` is `ai-quality`
- **AND** `document.meta.skillFilter.mode` is `include`

#### Scenario: export_test includeQuestions

- **WHEN** a host calls `export_test` with `includeQuestions: ["q-ai-quality-005"]` and that question is a valid candidate for the profile/level
- **THEN** the tool returns `ok: true` and `document.questions` contains exactly that question id
- **AND** `document.meta.questionFilter.mode` is `include`

#### Scenario: export_test skill filter conflict

- **WHEN** a host calls `export_test` with both non-empty `includeSkills` and `excludeSkills`
- **THEN** the tool returns `ok: false` with code `EXPORT_SKILL_FILTER_CONFLICT`

### Requirement: MCP initialize identity uses product branding and SSOT version

The `@spec-driven-methodology/mcp` stdio server SHALL advertise MCP initialize `serverInfo` with:

- `name`: logical id `sdm`
- `title`: `SDM`
- `description`: human string that includes `Methodology-as-Specs Framework` and the full product identity from SSOT (e.g. with a `v` prefix), including stage and build when present
- `version`: equal to the product identity SSOT (root `package.json` via `@spec-driven-methodology/core` helper), including stage and build when present

#### Scenario: Initialize reports SDM title and current version

- **WHEN** an MCP host completes initialize with the SDM server
- **THEN** `serverInfo.title` is `SDM`, `serverInfo.name` is `sdm`, and `serverInfo.version` equals root package version (e.g. `0.8.0-alpha.143`)

#### Scenario: Description includes tagline and full identity

- **WHEN** an MCP host reads `serverInfo.description`
- **THEN** it contains `Methodology-as-Specs Framework` and the same identity string as `serverInfo.version`

#### Scenario: Rebuild changes advertised identity under prerelease

- **WHEN** product identity was `0.8.0-alpha.5`, a build that increments the build number completes, and the MCP server is restarted
- **THEN** `serverInfo.version` equals the new identity (e.g. `0.8.0-alpha.6`) so hosts can distinguish the updated build

### Requirement: MCP tool question_validate

The MCP server SHALL expose tool `question_validate` that invokes the shared question validate pipeline in `@spec-driven-methodology/core` and returns JSON with `ok`, `errors`, and `findings` (or equivalent warning fields) for agent rewrite loops. The tool MUST support the optional `project` argument used by other domain tools.

#### Scenario: Tool list includes question_validate

- **WHEN** a host lists SDM MCP tools
- **THEN** the set MUST include `question_validate`

#### Scenario: question_validate returns structured JSON

- **WHEN** a host calls `question_validate` with a draft bound to an existing skill
- **THEN** the tool result JSON includes `ok` and arrays for blocking errors and advisory findings (possibly empty)

### Requirement: MCP gaps and generate expose quality-loop fields

MCP `cert_gaps` SHALL pass through blueprint `workItems` when present. MCP `question_generate` SHALL pass through per-draft brief fields. MCP `question_add` SHALL pass through soft-mode warnings/findings when the write succeeds under `writeGate: soft`. MCP `suggest` SHALL reflect quality-hardening suggestions when applicable.

#### Scenario: cert_gaps includes workItems in blueprint mode

- **WHEN** a host calls `cert_gaps` for a blueprint-mode project with thin coverage
- **THEN** the JSON payload includes `workItems` when the core gaps result defines them

### Requirement: MCP tool quality_report
The `@spec-driven-methodology/mcp` server SHALL expose tool `quality_report` that calls `@spec-driven-methodology/core` quality-report helpers with the same semantics as CLI `quality report` (modes methodology/corpus/diff via args `sources`, `profile`, `level`, `diff`, `save`, `locale`). On success it SHALL return JSON text with `ok: true` and `document` (`sdm.quality.report/v1`). On failure it SHALL return `ok: false` with a SdmError code. Arg `save` SHALL default to `true`. Optional `project` SHALL behave like other methodology tools.

#### Scenario: Tool listed and succeeds on methodology project
- **WHEN** a client lists tools and then calls `quality_report` with `profile` and `level` on a valid project
- **THEN** `quality_report` is in the tool list and the response JSON has `ok: true` and `document.schemaVersion` `sdm.quality.report/v1`

### Requirement: MCP tool input parameters have descriptions

Every property in each registered MCP tool's input schema SHALL include a non-empty `description` (via Zod `.describe()` or equivalent) so hosts (e.g. Cursor) and agents can display parameter help. Shared repeated fields (project, profile, level, force, team) SHOULD reuse one description string.

#### Scenario: All tool params describe

- **WHEN** tests inspect the published input schema for every tool in `TOOL_NAMES`
- **THEN** each property under `properties` has a non-empty string `description`

### Requirement: ABOUT MCP list matches TOOL_NAMES

`ABOUT_MCP_TOOLS` in `@spec-driven-methodology/core` SHALL list exactly the same tool names as `TOOL_NAMES` in `@spec-driven-methodology/mcp` (order may differ; equality is by set).

#### Scenario: About and TOOL_NAMES parity

- **WHEN** the MCP test suite runs
- **THEN** sorting `ABOUT_MCP_TOOLS` and `TOOL_NAMES` yields identical arrays

### Requirement: MCP content_stale tool

The MCP server SHALL expose tool `content_stale` mirroring `sdm content stale` with JSON payload (`ok`, stale document). Optional args SHALL include `skill`, `profile`, `level`, and `project` consistent with other domain tools.

#### Scenario: content_stale tool success

- **WHEN** an MCP client calls `content_stale` with a valid `skill` against a methodology project
- **THEN** the tool returns JSON text with `ok: true` and a document whose `schemaVersion` is `sdm.content.stale/v1`

### Requirement: MCP skill_impact returns artifact fields

MCP `skill_impact` SHALL return the expanded impact document including `questions` and `exports` arrays and schema `sdm.skill.impact/v2` (or newer), matching core/CLI.

#### Scenario: skill_impact includes questions key

- **WHEN** an MCP client calls `skill_impact` with a skill id
- **THEN** the JSON impact document includes `questions` and `exports` arrays (possibly empty)
