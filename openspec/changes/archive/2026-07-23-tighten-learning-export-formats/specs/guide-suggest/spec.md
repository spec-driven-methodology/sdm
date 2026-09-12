## ADDED Requirements

### Requirement: Learning-export levers cover four formats

When suggest includes an export-course (learning pack) suggestion, levers SHALL include Russian phrases that map to the four learning formats: at least «короткая инструкция» → howto, «конспект темы» → notes, «шпаргалка» → cheatsheet, and a course-oriented phrase (e.g. «курс / модуль с занятиями») → course. The suggestion `commandHint` SHALL prefer `export learning` (the `export course` alias MAY still appear in help text).

#### Scenario: Notes and course levers present

- **WHEN** suggest returns an `export-course` suggestion for a focused level
- **THEN** levers include phrases mapping to `--format notes` and `--format course`
- **AND** `commandHint` contains `export learning`
