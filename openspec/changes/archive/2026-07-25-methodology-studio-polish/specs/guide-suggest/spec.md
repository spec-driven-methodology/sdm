## ADDED Requirements

### Requirement: Suggest Russian gap wording uses пробел not дыра

User-facing Russian strings in the suggest payload (suggestion `label` and lever `phrase` values that describe coverage gaps) SHALL use **пробел** / **пробелы** (or «не покрыто» / «слабо покрыто») and MUST NOT use the word «дыра» / «дыры». The portable skill `guide-suggest` SHALL use the same wording in examples of learning/gap levers.

#### Scenario: Close-gaps label without дыра

- **WHEN** suggest includes a close-gaps suggestion for a project with missing/thin skills
- **THEN** that suggestion’s `label` does not contain «дыр»
- **AND** refers to пробел/пробелы or не покрыто / слабо покрыто

#### Scenario: From-gaps lever phrase

- **WHEN** suggest includes a learning-export lever for gaps-only scope
- **THEN** the Russian phrase uses «пробел» wording (not «дырам»)
