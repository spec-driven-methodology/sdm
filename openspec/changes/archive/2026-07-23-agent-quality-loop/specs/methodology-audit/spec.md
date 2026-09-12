## ADDED Requirements

### Requirement: Audit aligns with shared quality findings where applicable

`sdm audit` SHALL reuse or mirror the shared validate heuristics for library-level issues already covered by the validate pipeline (e.g. distractor length/position, near-dup pairs) so agents see consistent codes/messages between `question validate` and `audit --json` where overlap exists. Audit MAY continue to report additional ontology/coverage findings beyond per-draft validate.

#### Scenario: Near-dup pair appears in audit JSON

- **WHEN** two same-skill questions exceed the near-dup threshold and the agent runs `audit --json`
- **THEN** the audit payload includes a finding referencing those question ids (or equivalent duplicate finding)
