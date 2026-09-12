## ADDED Requirements

### Requirement: Suggest stale-content review before export push

When `sdm suggest` runs with a focus that has one or more content-staleness mismatches (`skill_basis_mismatch` or `level_basis_mismatch` from the same rules as `content stale`), the suggestion list SHALL include a stale-review action (Russian lever) that ranks above a primary export-test push. `missing_basis` alone MAY yield a lower-priority stamp/review hint without blocking export ranking.

#### Scenario: Basis mismatch outranks export

- **WHEN** suggest runs focused on a skill or level that has at least one `skill_basis_mismatch` stale item
- **THEN** suggestions include a stale-review item ranked above the primary export-test suggestion

#### Scenario: No mismatches omits stale harden

- **WHEN** suggest runs and scoped `content stale` reports no basis mismatches
- **THEN** suggestions NEED NOT include a stale-review primary lever (export/gap levers follow existing rules)
