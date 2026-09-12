## ADDED Requirements

### Requirement: Quality-hardening phase before export push

When the focused level still has blueprint thin/missing coverage, non-empty `workItems`, or library audit/validate-class quality findings under soft/strict quality policy, `sdm suggest` SHALL include a quality-hardening suggestion (close gaps / validate-rewrite / audit harden) that ranks above a primary export-test push. Export MAY still appear as a lower-priority preview option.

#### Scenario: Blueprint thin prefers harden over export

- **WHEN** suggest runs with focus on a level that has blueprint thin skills or workItems
- **THEN** a close-gaps or quality-harden suggestion ranks above the primary export suggestion

#### Scenario: Soft audit findings suggest harden

- **WHEN** the focused project has `quality.writeGate` or `distractorQuality` in `soft`/`strict` and audit reports distractor or near-dup findings
- **THEN** suggestions include a harden/validate-oriented action with Russian levers referencing validate or audit
