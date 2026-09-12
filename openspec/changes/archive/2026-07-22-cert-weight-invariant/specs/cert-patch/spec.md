## ADDED Requirements

### Requirement: No silent weight renormalization on patch
The system MUST NOT automatically redistribute or renormalize existing requirement weights when patching a level, except when applying explicit transfer / absorb instructions supplied by the caller.

#### Scenario: Add without transfer when sum would break
- **WHEN** level weights already sum to 1
- **AND** an agent runs `sdm cert patch --level mid --add-requirement linux:0.5:0.1` without `--from` (or equivalent absorb/transfer flags)
- **THEN** the system fails with stable error code `WEIGHT_TRANSFER_REQUIRED`
- **AND** the level file is unchanged

### Requirement: Add requirement with explicit weight transfer
The system SHALL accept repeatable `--from <skill>:<amount>` (or equivalent) with `--add-requirement` so that donor skills lose the specified weight and the new requirement receives its declared weight, leaving `sum(weights) ≈ 1`.

#### Scenario: Add with balanced transfer
- **WHEN** level `mid` has `docker` at weight 0.10 and total weights sum to 1
- **AND** an agent runs `sdm cert patch --level mid --add-requirement kubernetes:0.4:0.05 --from docker:0.05 --json`
- **THEN** the level includes `kubernetes` with weight 0.05 and `docker` with weight 0.05
- **AND** the sum of weights is within ε of 1
- **AND** JSON reports `ok: true`

#### Scenario: Transfer exceeds donor weight
- **WHEN** `--from` requests more weight than a donor has
- **THEN** the system fails with stable error code `WEIGHT_DONOR_INSUFFICIENT`
- **AND** the level file is unchanged

### Requirement: Remove requirement preserves invariant via absorb
When removing a requirement, the system SHALL either absorb the removed weight into a specified skill (`--absorb-into <skill>`) so the remaining weights sum to 1 within ε, or fail with `WEIGHT_SUM_INVALID` / `WEIGHT_TRANSFER_REQUIRED` without writing.

#### Scenario: Remove with absorb-into
- **WHEN** an agent runs `sdm cert patch --level mid --remove-requirement docker --absorb-into java-core --json`
- **THEN** `docker` is absent from requirements
- **AND** `java-core` weight increases by the former docker weight
- **AND** remaining weights sum to 1 within ε

## MODIFIED Requirements

### Requirement: Patch certification level requirements

The system SHALL provide `sdm cert patch --level` to add, upsert, or remove requirement triples on an existing level without recreating it, with `--json` for agents. After a successful patch that mutates requirements, the sum of requirement weights MUST equal 1 within ε (`1e-6`). Adding a requirement that introduces new weight MUST use an explicit transfer (`--from`) so existing shares are not silently renormalized.

#### Scenario: Add requirement to existing level

- **WHEN** an agent runs `sdm cert patch --level mid --add-requirement linux:0.5:0.1 --from docker:0.1 --json` and skill `linux` exists and `docker` has sufficient weight
- **THEN** the level YAML MUST include the linux requirement, donor weights MUST reflect the transfer, total weights MUST sum to 1 within ε, and JSON MUST report `ok: true`

#### Scenario: Remove requirement

- **WHEN** an agent runs `sdm cert patch --level mid --remove-requirement docker --absorb-into java-core --json`
- **THEN** docker MUST be absent from level requirements (and remaining requirements MUST be non-empty)
- **AND** remaining weights MUST sum to 1 within ε
