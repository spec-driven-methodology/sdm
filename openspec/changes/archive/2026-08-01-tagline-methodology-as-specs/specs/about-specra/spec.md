## MODIFIED Requirements

### Requirement: Positioning canon file exists

The Specra package root SHALL ship a short `ABOUT.md` that states what Specra is (methodology-as-specs framework: ontology of skills → content library → profiles/thresholds → coverage audit and export; assessment and learning on one competency skeleton), what it is not (including that it is not primarily an HR testing UI, not an LMS, and does not run candidate assessments as its primary product surface), the agent-first usage model for competency owners, the English tagline `Methodology-as-Specs Framework`, and product boundaries for methodology infrastructure.

#### Scenario: Canon is discoverable

- **WHEN** an agent or human opens the Specra package root
- **THEN** `ABOUT.md` is present alongside `AGENTS.md`

#### Scenario: Canon rejects testing-platform framing

- **WHEN** a reader follows `ABOUT.md` what-not guidance
- **THEN** Specra MUST NOT be described as a primary HR testing platform or candidate test runner

### Requirement: Canonical English tagline is Methodology-as-Specs Framework

The Specra package root `ABOUT.md` frontmatter `tagline` and the about payload field `tagline` SHALL equal exactly `Methodology-as-Specs Framework`. Live product identity MUST NOT use `Spec-based Methodology Framework` or `Spec-based Resource Assessment Framework` as the tagline. Historical etymology of Spec + RA MAY appear in prose as history only, not as the active tagline.

#### Scenario: About payload tagline

- **WHEN** an agent runs `sdm about --json` (or MCP `about`)
- **THEN** `tagline` is `Methodology-as-Specs Framework`

#### Scenario: ABOUT frontmatter matches payload

- **WHEN** `ABOUT.md` frontmatter is parsed for the about payload
- **THEN** frontmatter `tagline` equals the payload `tagline`

## RENAMED Requirements

### Requirement: Canonical English tagline is Spec-based Methodology Framework

FROM: Canonical English tagline is Spec-based Methodology Framework
TO: Canonical English tagline is Methodology-as-Specs Framework
