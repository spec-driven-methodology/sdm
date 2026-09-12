## ADDED Requirements

### Requirement: Canonical English tagline is Spec-based Methodology Framework

The Specra package root `ABOUT.md` frontmatter `tagline` and the about payload field `tagline` SHALL equal exactly `Spec-based Methodology Framework`. Live product identity MUST NOT use `Spec-based Resource Assessment Framework` as the tagline. Historical etymology of Spec + RA MAY appear in prose as history only, not as the active tagline.

#### Scenario: About payload tagline

- **WHEN** an agent runs `sdm about --json` (or MCP `about`)
- **THEN** `tagline` is `Spec-based Methodology Framework`

#### Scenario: ABOUT frontmatter matches payload

- **WHEN** `ABOUT.md` frontmatter is parsed for the about payload
- **THEN** frontmatter `tagline` equals the payload `tagline`

### Requirement: Positioning states methodology-as-specs for assessment and learning

`ABOUT.md` positioning (`what` / `whatNot` / `model`) SHALL describe Specra as a framework for managing methodology as specifications (ontology → content → lifecycle), with one competency skeleton for assessment and learning, and SHALL identify competency owners as the human audience in the agent-first model. `whatNot` MUST continue to reject HR testing UI / LMS / candidate test-runner framing.

#### Scenario: What covers lifecycle and dual use

- **WHEN** a reader or agent inspects `positioning.what`
- **THEN** it conveys methodology-as-specifications and both assessment and learning (or equivalent RU wording already shipped)

#### Scenario: Model names competency owners

- **WHEN** a reader or agent inspects `positioning.model`
- **THEN** it refers to competency owners (or equivalent RU: владельцы компетенций) and agent-first execution via CLI/MCP

## MODIFIED Requirements

### Requirement: Positioning canon file exists

The Specra package root SHALL ship a short `ABOUT.md` that states what Specra is (methodology as specifications; assessment and learning on one competency skeleton), what it is not (including that it is not primarily an HR testing UI, not an LMS, and does not run candidate assessments as its primary product surface), the agent-first usage model for competency owners, the English tagline `Spec-based Methodology Framework`, and product boundaries for methodology infrastructure.

#### Scenario: Canon is discoverable

- **WHEN** an agent or human opens the Specra package root
- **THEN** `ABOUT.md` is present alongside `AGENTS.md`

#### Scenario: Canon rejects testing-platform framing

- **WHEN** a reader follows `ABOUT.md` what-not guidance
- **THEN** Specra MUST NOT be described as a primary HR testing platform or candidate test runner
