# action-logging

## Purpose

Файловый журнал действий CLI/MCP (NDJSON) с ротацией и отдельным error.log для разбора пилотов и багов.

## Requirements

### Requirement: Action log files in methodology project

When logging is enabled and a methodology project root is known, Specra SHALL append NDJSON action records to `.sdm/logs/sdm.log`. Failed actions (`ok: false` or thrown SdmError/unexpected) SHALL also be appended to `.sdm/logs/error.log` (duplicate of the error record).

#### Scenario: Successful CLI action is logged

- **WHEN** agent runs `sdm cert gaps --profile X --level Y --json` inside a methodology project with logging enabled
- **THEN** `.sdm/logs/sdm.log` gains a line with `source: "cli"`, `action` identifying gaps, `ok: true`, and truncated/redacted args

#### Scenario: Failed action goes to error.log

- **WHEN** a CLI or MCP action fails with a SdmError
- **THEN** the same NDJSON error record appears in both `sdm.log` and `error.log`

#### Scenario: MCP does not write logs to stdout

- **WHEN** MCP tool handlers write action logs
- **THEN** log bytes MUST NOT be written to process stdout (stdio MCP remains clean)

### Requirement: Log rotation

The logger SHALL rotate `sdm.log` and `error.log` when a file exceeds the configured max size, retaining a bounded number of rotated files.

#### Scenario: Size rotation

- **WHEN** `sdm.log` exceeds `logging.maxBytes`
- **THEN** the current file is rotated and a new `sdm.log` is started; at most `logging.maxFiles` archived copies are kept

### Requirement: Enablement and redaction

Logging SHALL be enabled by default for methodology projects and MAY be disabled via `logging.enabled: false` in `sdm.yaml` or env `SDM_LOG=0`. Args/summary MUST redact values for secret-like keys and MUST truncate oversized strings.

#### Scenario: Disable via env

- **WHEN** `SDM_LOG=0` and a command runs
- **THEN** no new lines are appended under `.sdm/logs/`

#### Scenario: Secret-like keys redacted

- **WHEN** an action args object contains a key such as `token` or `password`
- **THEN** the logged value is replaced with a redacted placeholder

### Requirement: CLI and MCP coverage

Both the SDM CLI domain commands and MCP tool handlers SHALL emit action log records for successful and failed invocations (excluding pure help output).

#### Scenario: MCP tool logged

- **WHEN** host calls MCP tool `doctor`
- **THEN** `.sdm/logs/sdm.log` contains a record with `source: "mcp"` and action identifying `doctor`
