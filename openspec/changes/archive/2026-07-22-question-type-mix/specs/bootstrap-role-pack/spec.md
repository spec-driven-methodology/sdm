## ADDED Requirements

### Requirement: Profile-pack seed respects typeMix

The bootstrap profile-pack skill SHALL include optional `typeMix` in the structured plan seed (`single` | `mixed` | `full`, default `single`). After confirmation, when seeding questions the agent SHALL pass the mix into `question generate` (e.g. `--mix mixed`) instead of forcing every question to `single_choice`, unless the plan’s mix is `single`. Persistence remains `question add` per filled draft with the draft’s assigned type.

#### Scenario: Mixed seed uses generate --mix

- **WHEN** the confirmed profile-pack plan has `seed.typeMix: mixed`
- **AND** the agent seeds questions for a skill
- **THEN** the agent invokes `question generate` with `--mix mixed` (or MCP equivalent) before fill and `question add`

#### Scenario: Default seed remains single_choice path

- **WHEN** the confirmed plan omits `typeMix` or sets `single`
- **THEN** seeding may use homogeneous `single_choice` as today
