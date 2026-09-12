# cert-reweight

## Purpose

Adjust requirement weight shares on an existing certification level without changing depths, enforcing `sum(weights) ≈ 1`.

## Requirements

### Requirement: Reweight certification level shares
The system SHALL provide a non-interactive command `sdm cert reweight` that adjusts requirement weights on an existing level while enforcing that the sum of weights equals 1 within ε (`1e-6`). The command MUST NOT change skill `depth` values. The command SHALL support `--json` for agents.

#### Scenario: Transfer weight from donor to target
- **WHEN** level `middle` has requirements including `docker` (weight 0.10) and `kubernetes` (weight 0.05)
- **AND** an agent runs `sdm cert reweight --level middle --skill kubernetes --delta 0.05 --from docker --json`
- **THEN** persisted weights are `kubernetes=0.10`, `docker=0.05` (other skills unchanged)
- **AND** the sum of all requirement weights is within ε of 1
- **AND** JSON includes `ok: true`, `before`, `after`, and transfer details

#### Scenario: Donor has insufficient weight
- **WHEN** donor skill weight is less than the requested delta
- **THEN** the system fails with stable error code `WEIGHT_DONOR_INSUFFICIENT`
- **AND** the level file is unchanged

#### Scenario: Target skill not on level
- **WHEN** `--skill` references a skill not present in the level requirements
- **THEN** the system fails with stable error code `WEIGHT_SKILL_NOT_ON_LEVEL`
- **AND** the level file is unchanged

### Requirement: Replace full weight map
The system SHALL allow `sdm cert reweight --level <id>` with repeatable `--set <skill>=<weight>` covering every current requirement skill exactly once, with weights summing to 1 within ε.

#### Scenario: Set complete weight map
- **WHEN** level `middle` has skills `java-core`, `spring`, `sql`, `docker`
- **AND** an agent runs `sdm cert reweight --level middle --set java-core=0.4 --set spring=0.3 --set sql=0.2 --set docker=0.1 --json`
- **THEN** those weights are persisted and sum to 1 within ε
- **AND** depths are unchanged

#### Scenario: Incomplete or invalid set map
- **WHEN** `--set` omits a required skill, includes an unknown skill, or the weights do not sum to 1 within ε
- **THEN** the system fails with stable error code `WEIGHT_SUM_INVALID` (or `WEIGHT_SKILL_NOT_ON_LEVEL` when a skill is not on the level)
- **AND** the level file is unchanged

### Requirement: Machine-readable reweight output
The system SHALL emit JSON with `ok: true`, level id, `before` and `after` per-skill weight maps (and optional transfers) on success; on failure `ok: false`, stable `code`, and `message` with non-zero exit.

#### Scenario: JSON failure envelope
- **WHEN** `cert reweight` fails with `--json`
- **THEN** output contains JSON with `ok: false`, stable `code`, and `message`
- **AND** the process exit code is non-zero
