## ADDED Requirements

### Requirement: Overview module appears first in course navigation

When a loaded course document contains a module with `kind` equal to `overview`, the player course reader SHALL list that module first in navigation order (document order MUST already place it first; the player MUST NOT hide overview lessons). Overview lessons SHALL use the same prev/next navigation as skill lessons.

#### Scenario: Author opens overview before skill lessons

- **WHEN** the author opens a course whose first module has `kind: overview` and at least one lesson
- **THEN** the first lesson shown in reader order is an overview lesson
- **AND** next navigation can reach subsequent skill-module lessons

### Requirement: Glossary and footnotes in course reader

When the course document includes a non-empty `glossary`, the player SHALL show a terms section (course-level or accessible from the reader) listing each term and its definition when definition is non-empty. When the current lesson includes non-empty `footnotes`, the player SHALL render them below the lesson body as footnotes or an equivalent terms block for that lesson. Empty definitions MAY be omitted or shown as stubs without blocking navigation.

#### Scenario: Glossary with definitions renders

- **WHEN** a loaded course has `glossary` entries with non-empty `definition`
- **AND** the author views the course reader
- **THEN** the player displays those terms and definitions

#### Scenario: Lesson footnotes render under body

- **WHEN** the current lesson has `footnotes` with term and definition
- **THEN** the reader shows those footnotes in association with the lesson body
- **AND** practice controls remain driven by `practiceQuestionIds`, not footnotes

### Requirement: Practice UI is the sole practice list

The player SHALL present practice for a module from `practiceQuestionIds` (and teachingContext anchors / loaded test packs) and MUST NOT require a «Якоря практики» section inside lesson `body` markdown. Author docs MAY note that duplicate practice lists in body are discouraged.

#### Scenario: Practice without body anchors

- **WHEN** a module lists `practiceQuestionIds` and lesson bodies contain no practice-anchor heading
- **THEN** the player still lists practice items and can offer practice handoff when a test pack matches
