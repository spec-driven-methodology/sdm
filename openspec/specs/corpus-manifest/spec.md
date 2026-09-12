## Purpose

Deterministic scan of markdown source folders into a corpus manifest for quality reports (no LLM in core).

## Requirements

### Requirement: Corpus manifest schema
The system SHALL define corpus manifest documents with `schemaVersion` equal to `sdm.corpus.manifest/v1` containing `generatedAt`, `sourcesRoot`, and `entries[]` where each entry has at least `path` (relative), `artifactType` (`matrix` | `question_bank` | `program` | `rubric` | `ops` | `stub` | `unknown`), `status` (`ssot` | `quarry` | `drop` | `rewrite` | `unknown`), `contentHash`, and optional `signals` (e.g. multi-correct MCQ, stub-short).

#### Scenario: Manifest from markdown folder
- **WHEN** corpus scan runs on a directory containing `.md` files
- **THEN** the manifest lists one entry per markdown file with non-empty `contentHash` and an `artifactType`

### Requirement: Deterministic corpus scan without LLM
Corpus scan SHALL walk the sources directory synchronously, read markdown files, classify with path/filename/content heuristics only, and MUST NOT call external embedding or LLM APIs. Scan results SHALL feed corpus-mode quality reports (matrix density from heading/topic heuristics and bank signals).

#### Scenario: Classification heuristic
- **WHEN** a file name or path contains `question` or `bank` and content has multiple-choice markers
- **THEN** `artifactType` is `question_bank` (or `unknown` only if heuristics cannot decide — prefer `question_bank` when bank markers present)

#### Scenario: Stub detection
- **WHEN** a markdown file has very few lines (below the stub threshold)
- **THEN** `artifactType` is `stub` or status/signals indicate stub-short
