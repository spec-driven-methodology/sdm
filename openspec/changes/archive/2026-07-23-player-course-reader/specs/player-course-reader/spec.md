## ADDED Requirements

### Requirement: Player loads sdm.export.course/v1 documents

The static player SHALL accept JSON documents with `schemaVersion` equal to `sdm.export.course/v1` via the same load surfaces as tests (file picker, drag-and-drop, and `exports/` discovery when available). A valid course document MUST be added to the course library. Documents that are neither `sdm.export.test/v1` nor `sdm.export.course/v1` MUST be rejected with an error that names the unsupported version and the two supported versions. The player MUST NOT require a network backend to read a loaded course pack.

#### Scenario: Load valid course JSON

- **WHEN** the author selects a valid `export course` JSON file
- **THEN** the player adds it to the course library
- **AND** does not treat it as a test package

#### Scenario: Reject unknown schemaVersion

- **WHEN** the selected file is JSON with a `schemaVersion` that is not `sdm.export.test/v1` or `sdm.export.course/v1`
- **THEN** the player shows an error naming the unsupported version and the expected versions
- **AND** previously loaded library entries remain available

### Requirement: Home mode switch between tests and courses

The player load screen SHALL provide a clear mode switch (tabs or equivalent) between **Тесты** and **Курсы**. In Тесты mode the player SHALL show the test library and test session options. In Курсы mode the player SHALL show the course library and MUST NOT present test session options (auto-next, shuffle, timed) as if they applied to course reading.

#### Scenario: Switch to courses hides test session options

- **WHEN** the author opens the load screen on the Курсы tab
- **THEN** the course library is visible
- **AND** test-only session option controls are hidden or disabled

#### Scenario: Switch to tests keeps prior test library

- **WHEN** the author has loaded at least one test package
- **AND** switches to Курсы and back to Тесты
- **THEN** the test library still lists that package

### Requirement: Course reader with lesson navigation

When the author opens a course from the course library, the player SHALL present a reader view that lists modules and lessons and shows the current lesson title and body. The author SHALL be able to move to the previous and next lesson in document order (modules in order, lessons within each module in order). Progress SHALL indicate the current lesson index and total lesson count when lessons exist. Empty or whitespace-only lesson `body` MUST show a stub message that the lesson has no text, without blocking navigation.

#### Scenario: Page through lessons

- **WHEN** the author opens a course with at least two lessons
- **AND** presses next from the first lesson
- **THEN** the player shows the second lesson title and body

#### Scenario: Empty lesson body shows stub

- **WHEN** the current lesson has an empty or whitespace-only `body`
- **THEN** the reader shows a stub indicating there is no lesson text
- **AND** prev/next remain available when other lessons exist

### Requirement: Lesson body markdown preview

The player SHALL render lesson `body` as a lightweight markdown preview suitable for author review (at least headings, paragraphs, lists, emphasis, and code), after escaping raw HTML so untrusted JSON cannot inject scripts. Full CommonMark or an external markdown CDN MUST NOT be required.

#### Scenario: Heading and paragraph render

- **WHEN** a lesson body contains a markdown heading and a paragraph
- **THEN** the reader displays structured heading and paragraph content rather than raw markdown markers alone

### Requirement: Practice handoff from course to test session

For a course module (or the whole course), the player SHALL list `practiceQuestionIds`. When one or more loaded test packages contain questions whose ids intersect that list, the player SHALL offer an action to start a filtered test session using those resolved question objects from the test pack(s). When no loaded test package contains any of the ids, the player SHALL show the ids without starting a quiz from course JSON alone (course packs do not embed full question payloads).

#### Scenario: Practice starts when test pack has matching ids

- **WHEN** a course module lists practice question ids that exist in a loaded test package
- **AND** the author chooses to run practice
- **THEN** the player starts a test session whose questions are the intersection of those ids and the loaded test package questions

#### Scenario: Practice ids only without test pack

- **WHEN** a course lists practice question ids
- **AND** no loaded test package contains those ids
- **THEN** the player shows the practice ids
- **AND** does not invent question content from the course document
