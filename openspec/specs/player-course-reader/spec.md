# player-course-reader

## Purpose

Author-preview course mode in the static player: load `sdm.export.course/v1`, Тесты/Курсы switch, lesson navigation with markdown preview, and optional practice handoff to a filtered test session — not an LMS.

## Requirements

### Requirement: Player loads sdm.export.course/v1 documents

The static player SHALL accept JSON documents with `schemaVersion` equal to `sdm.export.course/v1` via the same load surfaces as tests (file picker, drag-and-drop, and `exports/` discovery when available). A valid course document MUST be added to the course library. Documents that are neither `sdm.export.test/v1` nor `sdm.export.course/v1` MUST be rejected with an error that names the unsupported version and the two supported versions. The player MUST NOT require a network backend to read a loaded course pack. Author docs MAY refer to packs produced by `export learning` (alias `export course`).

#### Scenario: Load valid course JSON

- **WHEN** the author selects a valid learning-export JSON file (`sdm.export.course/v1`, from `export learning` or alias `export course`)
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

For a course module (or the whole course), the player SHALL list `practiceQuestionIds` with human-readable labels when metadata is available: prefer question `text` from `teachingContext.questionAnchors` (or a loaded test question), shown as a short numeric ref plus text (e.g. `005 — Какова типичная роль system prompt?`), with the full question id available in a tooltip for authors. When one or more loaded test packages contain questions whose ids intersect that list, the player SHALL offer an action to start a filtered test session using those resolved question objects from the test pack(s). When no loaded test package contains any of the ids, the player SHALL still list practice items (labels from course anchors when present) without starting a quiz from course JSON alone (course packs do not embed full question payloads for scoring).

#### Scenario: Practice starts when test pack has matching ids

- **WHEN** a course module lists practice question ids that exist in a loaded test package
- **AND** the author chooses to run practice
- **THEN** the player starts a test session whose questions are the intersection of those ids and the loaded test package questions

#### Scenario: Practice labels from course anchors

- **WHEN** a course lists practice question ids
- **AND** `teachingContext.questionAnchors` includes matching ids with question text
- **THEN** the practice list shows short ref + question text (not only the raw id string)

#### Scenario: Practice ids only without test pack

- **WHEN** a course lists practice question ids
- **AND** no loaded test package contains those ids
- **THEN** the player shows the practice items (labels from anchors when available, otherwise raw ids)
- **AND** does not invent question content for a scored session from the course document

### Requirement: Overview module appears first in course navigation

When a loaded course document contains a module with `kind` equal to `overview`, the player course reader SHALL list that module first in navigation order (document order MUST already place it first; the player MUST NOT hide overview lessons). Overview lessons SHALL use the same prev/next navigation as skill lessons.

#### Scenario: Author opens overview before skill lessons

- **WHEN** the author opens a course whose first module has `kind: overview` and at least one lesson
- **THEN** the first lesson shown in reader order is an overview lesson
- **AND** next navigation can reach subsequent skill-module lessons

### Requirement: Glossary and footnotes in course reader

When the course document includes a non-empty `glossary` with definitions, the player SHALL expose the full terms list once at course level (dedicated reader page or equivalent accessible section) and MUST NOT repeat that full list under every lesson. When the current lesson includes non-empty `footnotes`, the player SHALL render them below the lesson body as a footnotes block for that lesson. Inline glossary explanations (hover tooltips) replace the need for a derived per-lesson footnotes block: the player SHALL NOT synthesize a footnotes block from glossary matches alone when the lesson has no explicit `footnotes`, to avoid a «Сноски» block that merely restates the lesson topic. Empty definitions MAY be omitted or shown as stubs without blocking navigation.

Glossary terms that appear in the lesson body SHALL be wrapped in a clickable inline element (`data-term`, `data-definition`) with a custom-positioned tooltip (`#termTip`) on pointer-over — the tooltip SHALL position relative to the element, flip above when below overflows viewport, and use CSS `pointer-events: none` so it never captures input. A click on an annotated term SHALL navigate the reader to the «Термины курса» glossary page. The player MUST NOT use the native `title` attribute for glossary definitions.

#### Scenario: Full glossary once, not on every lesson

- **WHEN** a loaded course has `glossary` entries with non-empty `definition`
- **AND** the author views an ordinary skill/overview lesson
- **THEN** the player does not show the full «Термины курса» list under that lesson body
- **AND** the full glossary remains reachable from the reader (e.g. a dedicated outline page)

#### Scenario: Lesson footnotes render under body

- **WHEN** the current lesson has `footnotes` with term and definition
- **THEN** the reader shows those footnotes in association with the lesson body
- **AND** practice controls remain driven by `practiceQuestionIds`, not footnotes

#### Scenario: Derived lesson footnotes from glossary

- **WHEN** the current lesson has empty `footnotes`
- **AND** a glossary term matches the lesson `topic` or appears in the lesson body
- **THEN** the reader annotates that term inline with a hover tooltip (custom `#termTip`, not native `title`) and clicking the term navigates to the full glossary page
- **AND** the full course glossary is still not duplicated on that page

#### Scenario: Lesson without explicit footnotes omits the block

- **WHEN** the current lesson has empty `footnotes`
- **AND** no glossary term matches the lesson topic or body
- **THEN** the reader does not render a footnotes block for that lesson

#### Scenario: Hover tooltip positions correctly

- **WHEN** the author hovers a `.glossary-term` element near the bottom of the viewport
- **THEN** the tooltip flips above the element instead of clipping below

#### Scenario: Glossary term click opens the glossary page

- **WHEN** the author clicks on an inline `.glossary-term` span
- **THEN** the reader navigates to the «Термины курса» lesson

### Requirement: Course quality warnings are author-only — badge + dedicted page

The player SHALL treat the course document's `warnings` array as author-only diagnostics and MUST NOT place a full warning list inline under every lesson. When warnings exist, the player SHALL render a **counter badge** in the course header area (e.g. «Доработки: N») that is visible from any lesson and styled to catch the author's attention. The badge SHALL be clickable and navigate to a **dedicated «Доработки» reader page** (module kind `warnings`, separate entry in the outline alongside «О курсе» and «Термины курса») that shows the full list grouped by warning code. The player MUST NOT repeat the full warning list under ordinary lesson pages.

#### Scenario: Warning badge in header on every page

- **WHEN** a loaded course has non-empty `warnings`
- **AND** the author reads an ordinary lesson
- **THEN** the header shows a clickable badge «Доработки: N»
- **AND** the lesson body, footnotes, and practice remain the primary content — no warning list is shown inline

#### Scenario: Warnings page shows the full list

- **WHEN** the author clicks the badge or navigates to the «Доработки» page via outline
- **THEN** the full warning list (code + message + skill) is visible
- **AND** the warning block label reads «Доработки курса»

### Requirement: Glossary terms explain on hover in lesson body

When the course document includes a non-empty `glossary` with definitions, the player SHALL wrap the first occurrence of each glossary term inside the rendered lesson body in an inline element with `data-term` and `data-definition` attributes. On pointer-over, the player SHALL show a custom-positioned tooltip (`#termTip`, fixed position, `pointer-events: none`) with the humanized term and its definition — MUST NOT use the native `title` attribute. On click, the player SHALL navigate to the «Термины курса» page. The player MUST NOT apply annotations inside fenced code blocks.

#### Scenario: Term in body gets custom hover tooltip

- **WHEN** the current lesson body contains a glossary term (e.g. `Event Sourcing`)
- **THEN** the rendered body wraps that occurrence in a `.glossary-term` span with `data-term` and `data-definition`
- **AND** on pointer-over a custom `#termTip` tooltip appears near the element
- **AND** on click the reader navigates to the «Термины курса» page
- **AND** the native `title` attribute is NOT used

#### Scenario: No term in body leaves text unchanged

- **WHEN** the current lesson body contains no glossary terms
- **THEN** the rendered body is unchanged apart from standard markdown rendering

### Requirement: Practice UI is the sole practice list

The player SHALL present practice for a module from `practiceQuestionIds` (and teachingContext anchors / loaded test packs) and MUST NOT require a «Якоря практики» section inside lesson `body` markdown. Author docs MAY note that duplicate practice lists in body are discouraged.

#### Scenario: Practice without body anchors

- **WHEN** a module lists `practiceQuestionIds` and lesson bodies contain no practice-anchor heading
- **THEN** the player still lists practice items and can offer practice handoff when a test pack matches
