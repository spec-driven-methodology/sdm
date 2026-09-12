## ADDED Requirements

### Requirement: Level weight sum invariant on create
The system SHALL treat requirement `weight` values as score shares. After a successful `sdm cert create`, the sum of persisted requirement weights MUST equal 1 within ε (`1e-6`).

#### Scenario: Normalize relative weights on create
- **WHEN** an agent runs `sdm cert create` with requirements whose weights are positive and sum to a value other than 1 (e.g. `4`, `3`, `2`, `1` scaled into 0..1 triples, or shares that sum to 0.9)
- **AND** `--no-normalize-weights` is not set
- **THEN** the system persists proportionally normalized shares summing to 1 within ε
- **AND** JSON success payload includes the persisted requirements and indicates weights were normalized

#### Scenario: Strict create rejects non-unit sum
- **WHEN** an agent runs `cert create` with `--no-normalize-weights` and requirement weights do not sum to 1 within ε
- **THEN** the system fails with stable error code `WEIGHT_SUM_INVALID`
- **AND** no level file is written and the profile is not mutated

#### Scenario: Zero total weight rejected
- **WHEN** all requirement weights are 0
- **THEN** the system fails with stable error code `WEIGHT_SUM_INVALID`
- **AND** no incomplete certification files are left from the failed write

### Requirement: Create JSON exposes final shares
On successful `cert create --json`, the system SHALL return the final per-requirement weights as stored on disk (post-normalization when applicable).

#### Scenario: JSON includes persisted weights
- **WHEN** `cert create` succeeds with `--json` after normalizing weights
- **THEN** the level payload in JSON matches the written YAML weights
