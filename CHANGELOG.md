# Changelog

All notable changes to SDM are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
(before 1.0 the API may still change).

## [1.4.0] - 2026-09-13

### Changed

- **EN tagline** → **Spec-Driven Methodology** (was Methodology-as-Specs Framework): `ABOUT.md` / `about.tagline`, CLI banner `--version`, MCP `initialize` description, `package.json` description, VERSIONING, player/kit html, `agents/explain-sdm`. Update local player: `sdm player sync --force`
- Internal function `resolveSpecraHome` → `resolveSdmHome` (SDM naming, no Specra references in code)
- **ASCII art** in CLI `--version` — redrawn from figlet-standard lowercase `sdm` to uppercase **SDM** (`packages/cli/src/banner.ts`)
- **Question architecture:** removed duplicates q-testing-002, q-testing-003, q-testing-007 (exact copies), q-architecture-003 (near duplicate). Some `architecture` questions converted to `open` type (2 of 5), coverage diversified. Added glossary terms (9: JVM, Generics, IoC, DI, ACID, JUnit5, Microservices, CQRS, CI/CD)
- **Exports:** regenerated `test-java-developer-senior.json` (26 questions, current composition), removed stale `test-java-developer-senior-8.json`
- **`--version` label** — string `framework` replaced with `core` (now `core 1.4.0 / mcp 1.4.0`)
- **SDM Studio fully removed** (entire stack: UI `studio/`, templates, `studio-bridge`, `studio-sync`, `studio-coverage` in core, CLI commands, MCP tools, tests, openspec specs). Replaced by obsidian-sdm

## [1.3.0] - 2026-09-12

### Added

- **Obsidian integration (no custom plugin)** — combination of existing components:
  - **Cortex** (MCP server inside Obsidian, port 27182) — vault access for the agent
  - **OpenCode** (CLI agent inside Obsidian or external MCP client)
- **`scripts/obsidian-setup.sh`** — setup script: dependency check, vault discovery, SDM project scanning, `opencode.json` generation (SDM + Cortex) and `AGENTS.md` in vault. Supports `--dry-run` (preview) and `--undo` (rollback)
  - **`scripts/obsidian-cleanup.sh`** — safe rollback: removes `opencode.json` and `AGENTS.md` (created by setup) with backup by default (`--purge` — no backup). Does not touch SDM projects, Obsidian plugins, or global MCP configs (only warns)
  - **`docs/obsidian-integration.md`** — documentation: installation, multi-project, models, removal/rollback, troubleshooting
  - **`npm run obsidian:setup` / `npm run obsidian:cleanup`** — script aliases
- **`AGENTS.md` template (init.ts)** — blocks «Data model (vault ↔ SDM)», «Multi-project workflow», «Read vs. write routing»; link to Obsidian integration

### Changed

- **Methodology names** — `specra/sdm.yaml` renamed `my-methodology` → `sdm` (README, AGENTS.md); `reference/engineer-certification` → `qa-engineer` (README, AGENTS.md). `my-methodology` remains only as the default for `sdm init` and in examples/archives
- **`AGENTS.md` (repository)** — added data model, multi-project workflow, Obsidian integration blocks

## [1.2.0] - 2026-09-12

### Added

- **`--project` in MCP entry** — the `sdm-mcp` server accepts `--project <dir>` (and `-p`), sets `SDM_PROJECT_ROOT`. Avoids hardcoded paths in host config: `"args": ["dist/index.js", "--project", "/my/project"]`.
- **`locate_project` / `list_projects` MCP tools** — two new tools for multi-project mode. `locate_project` finds the nearest `sdm.yaml` from any directory; `list_projects` scans the workspace. The agent (harness) calls `locate_project` → gets `root` → passes `project` to all other tools. One MCP server for any number of methodology projects.
- **`locateProject`, `listMethodologyProjects` in core** — new exported functions; `locateProject` returns `null` instead of throwing.
- **`buildMcpConfig` now writes `--project` into args** — when `sdm mcp install --project <dir>` is used, the host config gets `--project <dir>` in `args` (plus env as fallback).
- **docs: multi-project mode** — updated `GETTING_STARTED.md` (section 6.2), `AGENTS.md`, skill `connect-mcp`, template `init.ts`.

### Changed

- **cert-write.ts: correct `noNormalizeWeights` handling** — when `true`, weights are not normalized (only zero-sum is checked). `weightsNormalized` flag is returned correctly.
- **Removed `--plan-only` from course export** — `export learning` (CLI) and `export_learning` (MCP) no longer accept `--plan-only`; `meta.planOnly` removed from the document. Guardrail `COURSE_ALL_EMPTY` is now unconditional: export with empty `lessons[].body` always fails. Skeletons and brief mode removed from public surfaces; the `export-course` skill updated: the agent generates lesson bodies first, then exports. In core the option remains marked `@internal` (for structure tests).

### Added

- **MCP tools: `skill_suggest_links`, `question_deep_validate`, `topic_registry`, `topic_sync`, `course_heal`** — five new MCP tools with Zod schemas, descriptions, and tests; `ABOUT_MCP_TOOLS` (about.ts) synchronized with `TOOL_NAMES` (server.ts), the «exposes the full shipped tool set» test expanded. New tool-level description for each tool.
- **Player: term tooltips** — custom `#termTip` instead of native `title` (behavior: hover = short definition, click = navigate to «Course Terms» page; positioning with flip on overflow, `pointer-events: none`). Update local player: `sdm player sync --force`
- **Player: «Refinements» page** — warnings are no longer rendered under each lesson; in the header — a clickable badge «Refinements: N», full list on a separate page (module kind `warnings`) in navigation next to «Course Terms». Update local player: `sdm player sync --force`

### Planned

- MCP HTTP (beyond current stdio MCP)
- Export history per candidate
- RGB spectrum and external HR connectors
- Real LanceDB + Xenova embeddings (currently offline JSON PoC)
- Candidate analysis / comparison (outside methodology core)
- Additional MCP hosts in the registry (on request)
- Optional later: CMS `library/lessons/`, markdown consumer format for learning export
- Split `cli/index.ts` → `commands/` and `mcp/server.ts` → `tools/` (2800/2100 line monoliths)

## [1.0.0] - 2026-09-10

### Added

- **Refactor `export-course.ts` → `export-course/`** — 1077-line monolith split into modules: `types.ts` (schema + enums), `lessons.ts` (overview/stubs/glossary/topo-order), `warnings.ts` (quality warnings, locale, truncation), `scopes.ts` (resolve scope), `course-gate.ts` (readiness gate), `enrichment.ts` (reverse topic extraction + description suggest), `orchestrator.ts` (document assembly). Public API unchanged.
- **`quality.courseGate`** — new field `sdm.yaml → quality.courseGate: off|soft|strict`. With `strict`, course export is blocked on `SKILL_DESCRIPTION_THIN`, `SKILL_TOPICS_EMPTY`, `TOPIC_UNCOVERED_BY_QUESTIONS`, `GRAPH_ISOLATED_IN_SCOPE` (code `COURSE_GATE_BLOCKED`). `--strict-context` remains as a legacy flag (depth=detailed).
- **`quality.courseGate` auto-heal** — `course heal` (CLI) / `healCourseWarnings()` (core): back-fill topics + registry sync + suggest descriptions from lessons. Closes `SKILL_TOPICS_EMPTY` / `SKILL_DESCRIPTION_THIN` without LLM.
- **Topic labels** — `skill.topic_labels` (slug → human-readable name) in skill schema; `buildLessonStubs()` uses them for lesson titles; `seedGlossaryFromTopics()` adds labels as `aliases[]`.
- **`sdm question deep-validate`** / core `validateQuestionLibraryDeep()` — thorough question library check: `SINGLE_CHOICE_NO_OPTIONS` / `CHOICE_NO_CORRECT` (error), `OPEN_NO_EXPECTED` / `EXPLANATION_RESTATES_ANSWER` / `PROBE_RUBRIC_MISSING` (finding), `difficultySummary` (easy/medium/hard) + `rubricMissingCount`.
- **`sdm skill suggest-links`** / core `inferEdgesFromContent()` / `inferEdgesForProject()` — auto-suggest `related_to`/`depends_on` edges from skill descriptions and topics (dry-run; confirm via `skill link`).
- **`detectTruncation()`** — heuristic for truncated lesson text (unclosed quotes/brackets, break on conjunction/preposition) → warning `LESSON_TRUNCATED` in `collectProseLocaleWarnings`.
- **`GLOSSARY_TAUTOLOGY`** / **`GLOSSARY_MISSING_TERM`** / **`LESSON_DUPLICATE`** — quality warnings: tautological definition, term in lesson without glossary entry, near-duplicate lessons (jaccard ≥0.7).
- **`module.prerequisites`** — automatically from `skill.depends_on`; **`lesson.estimatedMinutes`** and **`module.learningObjectives`** — optional course schema fields.
- **`meta.generation`** — optional reproducibility block: `{ model, promptVersion, temperature, seed, generatedAt }`.
- **`meta.revisionByModule`** — `{ [skillId]: hash }` on top of global `meta.revision`; `hashModuleRevision()` / `buildRevisionByModule()`. Changing one lesson only updates its module hash.
- **Topic registry** — new domain `library/topics/*.yaml`: `TopicSchema`, `buildTopicRegistry()`, `syncTopicRegistryFromSkills()`, `addTopic()`, `mergeRegistryLabelsIntoSkills()`; CLI `topic registry` / `topic sync` / `topic apply` / `topic add`. Single topic dictionary closes the root `TOPIC_UNCOVERED_BY_QUESTIONS`.
- Tests: `course-enrichment` (5), `skill-edge-inference` (3), `question-validate-deep` (3), `detectTruncation` (4), topicLabels (4), `topic-registry` (4), `course-heal` (4), `warnings-glossary-dup` (5), `revisionByModule` (3).

### Changed

- `collectLearningWarnings()` accepts `glossary?` for tautology checks.
- `course-gate.ts` reads `quality.courseGate` from project config (replaces inline `--strict-context` logic).

### Planned (OpenSpec)

- MCP tool `intent_validate_plan` — deferred (CLI sufficient for v1)

## [0.9.0-alpha.3] - 2026-08-02

Prerelease: pitch-aligned product canon (canonical, system picture, harness boundary).

### Changed

- **Positioning** (`ABOUT.md` / `about` / MCP·CLI `about` descriptions, README, GETTING_STARTED, AGENTS, explain-sdm, player/studio leads, `openspec/config.yaml`): canonical / single source of truth next to skeleton; **specs · framework · agent** picture; value of «single-point control» and export to surfaces; university/bootcamp contexts without changing audience
- **`whatNot`:** not a full harness / agent orchestrator (CLI/MCP — access to canonical)
- Tests `about.test.ts` — assert on harness and canonical/SSOT in positioning

## [0.9.0-alpha.2] - 2026-08-01

Prerelease: Methodology Studio, content staleness, MCP schema hygiene, catch-up docs.

### Added

- **Content staleness / basis:** `meta.basis` (skill/level hash) on `question add`, `export test`, `export learning|course`; CLI **`content stale`** / MCP **`content_stale`** (`sdm.content.stale/v1`, `workItems`); `suggest` lever `review-stale-content`; portable skill `agents/close-staleness/`. Wire `schemaVersion` ≠ content freshness
- MCP **`studio_sync`**, **`studio_push_view`**, **`studio_push_coverage`**, **`studio_pull_action`** (parity with CLI; no `studio_serve`)
- **Studio coverage / gaps:** phase `coverage` (not covered / weakly covered / covered); **Close gap** → `close_gap`; chips suggest → `suggest_lever`; CLI **`studio push-coverage --profile --level [--json]`**. Update: `sdm studio sync --force`
- **Studio export-form + Player handoff:** phase `export-form` in view (dynamic fields/types), action `export_test` (Studio does not call `export test`); **Open Player**; `studio serve` serves `/player/` and `/exports/` (read-only). Update: `sdm studio sync --force`
- **Studio bridge:** `.sdm/studio/` (`current-view.json` / `last-action.json`); CLI **`studio push-view`**, **`pull-action [--consume]`**, **`serve`** (127.0.0.1 only, static `studio/` + `/bridge/*`); UI «Load from bridge» + POST action. Does not write YAML. Update UI: `sdm studio sync --force`
- **Methodology Studio** (`studio/`): static view/action shell alongside `player/` — renders `sdm.studio.view/v1`, emits `sdm.studio.action/v1` (confirm/reject); does not write YAML. `sdm init` + **`sdm studio sync [--force] [--json]`**. Demo: `studio/fixtures/demo-view.json`. Update: `sdm studio sync --force`
- Product identity with build number: `X.Y.Z-(alpha|beta|rc).N` (e.g. `0.8.0-alpha.1`); visible in `sdm --version`, `about`, and MCP initialize
- `sdm --version` — ASCII `SDM` + tagline + lines `framework <version>` / `mcp <version>` (resolved `@spec-driven-methodology/mcp`); same banner in TTY-help (`sdm` / `--help`)
- Scripts `npm run version` / `version:build` / `version:major|minor|patch` / `version:alpha|beta|rc|stable`; auto-bump build on `npm run build` (see `VERSIONING.md`); `verify` uses `compile` without bump
- `GETTING_STARTED` / `agents/connect-mcp`: freshness check via `--version` / `about`; MCP key remains `SDM` (no version in name)
- **`export learning`** / MCP **`export_learning`** — canonical educational material export; aliases `export course` / `export_course`
- Formats: `howto` \| `notes` \| `cheatsheet` \| `course`; `meta.layout` `single_doc` \| `modular_course`
- Soft warning `PROSE_LOCALE_MIXED` for mixed Cyrillic/Latin in non-empty `lessons[].body` (outside code fences)
- `suggest` levers: «topic notes», «course / module with lessons»; `commandHint` → `export learning`
- For **`format=course`** + profile/level: module `kind: overview` and seed `glossary[]` from topics; `lessons[].footnotes` fields

### Changed

- **`skill impact` → `sdm.skill.impact/v2`:** plus `questions[]` and `exports[]` (scan `exports/`); MCP/CLI/about synchronized
- **MCP schema hygiene:** all tool parameters have Zod `.describe()` (hints in Cursor/host UI); tool-level descriptions enhanced; `AGENTS.md` Tools includes `player_sync` / studio bridge; test `ABOUT_MCP_TOOLS` ≡ `TOOL_NAMES`
- **EN tagline** → **Methodology-as-Specs Framework** (was Spec-based Methodology Framework): `ABOUT.md` / `about.tagline`, CLI banner `--version`, MCP `initialize` description, `package.json`, README, VERSIONING, `openspec/config.yaml`, player template. Update local player: `sdm player sync --force`
- **`suggest` / guide-suggest:** Russian coverage terms — **gaps** / not covered / weakly covered instead of «hole/holes»
- **EN tagline** → **Spec-based Methodology Framework** (was Resource Assessment): `ABOUT.md` / `about.tagline`, CLI banner `--version`, MCP `initialize` description, `package.json`, README, VERSIONING, `openspec/config.yaml`, **player** (`templates/.../player/index.html` tagline + lead). Historical Spec+RA is etymology only, not a living slogan. Update local player: `sdm player sync --force`
- **RU one-liner positioning:** «SDM — фреймворк methodology-as-specs: онтология навыков → библиотека контента → профили/пороги → аудит покрытия и экспорт» (`ABOUT.md` / `about.what`, README, player lead, `agents/explain-sdm`, `openspec/config.yaml` + main spec `about-sdm`). Anchor unchanged: one skeleton for **assessment** and **learning**. Update local player: `sdm player sync --force`
- **Positioning** (`ABOUT.md` / `about` / MCP `about`, README, `agents/explain-sdm`, `openspec/config.yaml`): methodology-as-specs pipeline above; audience — **competency owners** (HR, recruiters, methodologists, analysts, domain experts). Not LMS / not HR testing UI
- **`format=concept`** deprecated → normalizes to `notes` + warning `FORMAT_CONCEPT_DEPRECATED`
- Skill `agents/export-course/`: course ≠ howto (definition-first, no «Problem/Model/…» and no «Practice Anchors» in body); locale + glossary/footnotes
- Player **Courses**: overview first, footnotes/glossary, practice only from `practiceQuestionIds` — `player sync --force`

### Fixed

- Player **Courses**: full «Course Terms» block no longer repeats on every lesson — once in the «Reference» section; under each lesson — **Footnotes** (`lessons[].footnotes` or glossary terms related to the topic/text). Update local player: `sdm player sync --force`

## [0.9.0-alpha.1] - 2026-08-01

Minor (prerelease): summary `quality report` / corpus intake + portable skill index.

### Added

- **`quality report`** / MCP **`quality_report`** — summary quality report `sdm.quality.report/v1` (modes methodology | corpus | diff): verdict, score 1–5, density matrix ●○○, topActions, glossary, persist `.sdm/reports/quality/`, `--diff <id>`; human text `--locale ru|en` (default ru). Does not replace detailed `audit`
- Corpus scan → `sdm.corpus.manifest/v1` (heuristics on `.md`, no LLM in core)
- Portable skill **`agents/quality-report/`**; suggest lever «summary quality report»

### Changed

- **Agent index:** `AGENTS.md` (CLI/MCP `quality report` / `quality_report`), `ABOUT.md` workflow, `intent-loop` → corpus via `quality-report`, `about` nextSteps `quality-report`

## [0.8.0] - 2026-07-23

Minor: export course learning pack, agent quality loop, player course reader.

### Added

- **`export course`** / MCP **`export_course`** — learning pack `sdm.export.course/v1`: TeachingContext (skills/topics/graph/question anchors), learning-readiness warnings, controls `depth` (`brief`|`standard`|`detailed`) + `format` (`howto`|`concept`|`cheatsheet`), scope profile/level / `--from-gaps` / `--skill` / `--topic` / `--from-questions`, `--plan-only`, `--strict-context`; practice ids from the same library as `export test`. Not LMS — lesson prose is written by the agent after HITL. Skill: `agents/export-course/`
- **`suggest`**: next-step `export-course` + levers («short instruction», «with details and examples», «gaps only», …); `agents/guide-suggest/` handoff to `export-course`
- **Agent quality loop:** `question validate` / MCP `question_validate` (dry-run `errors[]`/`findings[]`); shared validate pipeline on `question add`; `quality.writeGate` / `skillGate` / `coverageMode` (`legacy`|`blueprint`) in `sdm.yaml`; blueprint `workItems` in `cert gaps` / `cert coverage` `--json`; richer `question generate` briefs (`mustCoverTopic`, `avoidNearIds`); `suggest` → `harden-quality` before export; skills `generate-questions` / `close-coverage` / `guide-suggest` + `AGENTS.md` / `agents/README`
- **`guide-suggest`:** prioritize harden/gaps over export; levers «review draft» / topics / writeGate; handoff to validate→rewrite
- **Player course reader:** static player accepts `sdm.export.course/v1` alongside tests; tabs **Tests** | **Courses**; course library (separate scoped localStorage); reader with lesson paging (markdown preview, stub on empty body); practice handoff via `practiceQuestionIds` → filtered test session if paired `export test` is loaded. Not LMS. Update: `sdm player sync --force`
  - UX polish: title from module.title when top-level `title` missing; line-oriented markdown; less duplication in crumb/outline; practice in `<details>` with labels from `questionAnchors` (full id in tooltip)

## [0.7.0] - 2026-07-23

Minor: host wire (MCP + skills), product version SSOT, MCP sidebar key `SDM`.

### Added

- Unified SSOT for product version: root `package.json` + `getProductVersion()`; scripts `npm run version:sync` / `version:check` (in `verify`)
- `sdm mcp install` now installs portable skills by default (`--no-skills` for MCP-only); `--json` field `skills`
- `sdm init` templates (README / AGENTS) and console Next: host wire via `mcp install`, multi-project without `--project`

### Changed

- **BREAKING:** default MCP key in hosts — `SDM` (was `sdm`); Cursor/GigaCode sidebar shows the config key. `mcp install` migrates legacy `sdm` → `SDM`. Override: `--name`
- MCP `initialize`: `title` **SDM**, `description` «Spec-based Resource Assessment Framework · v…», `version` from SSOT
- README no longer hardcodes «current version X.Y.Z» — see CHANGELOG / `sdm --version`
- `GETTING_STARTED.md` / `connect-mcp` / README MCP: happy path without mandatory `--project`; skills included in `mcp install`
- `about` / `ABOUT.md`: tagline → «Spec-based Resource Assessment Framework»; `what` — unified methodology layer and export to consumers (without old «Assess skills…»)

### Fixed

- `sdm --version` / `about` / MCP version no longer diverge due to different `package.json` and stale dep pins

## [0.6.0] - 2026-07-23

Minor: export skill/question filters, option shuffle, distractor quality, player library scope.

### Added

- **`export test --include-skill` / `--exclude-skill`** (XOR) and **`--include-question`** — skill subset / exact question ids; `meta.skillFilter` / `meta.questionFilter` / `meta.weightsNormalized`; MCP `includeSkills` / `excludeSkills` / `includeQuestions`; codes `EXPORT_SKILL_*`, `EXPORT_QUESTION_NOT_FOUND`, `EXPORT_FILTER_EMPTY`
- **`export test --shuffle-options`** (+ `--seed` shared with adaptive) — choice `options` permutation with `correct` remap; `meta.optionShuffle`; MCP `shuffleOptions`
- Player: «Shuffle options» option (`localStorage` `sdm.player.shuffleOptions`), independent from question shuffle
- **`quality.distractorQuality`** in `sdm.yaml` (`off` | `soft` | `strict`): audit findings position bias / length outliers; `question add` rejects `DISTRACTOR_QUALITY` in `strict`
- Agent guidance: distractor length/plausibility in `agents/generate-questions/`

### Fixed

- Player: «Loaded tests» library isolated by project path (`localStorage` `sdm.player.lib.<scope>.*`) — new `init` / different directory doesn't show another project's tests; session options remain shared

## [0.5.0] - 2026-07-23

Minor: author-preview player, Profile domain, suggest/about, type-mix/type-filter export, cert reweight.

### Added

#### Product identity / guidance

- **`sdm about [--json]`** / MCP **`about`** — positioning canon (`ABOUT.md`); skill `agents/explain-sdm/`
- **`sdm suggest [--profile] [--level] [--json]`** / MCP **`suggest`** — next actions + levers; skill `agents/guide-suggest/`

#### Export test player

- Static `player/` on `sdm init`; **`sdm player sync [--force] [--json]`** / MCP `player_sync`
- Session UX: `exports/` list (HTTP), **Start**, auto-advance, timer, crumbs / **SDM** click → main; RU UI
- Export library («Loaded tests»): multi JSON, `localStorage`, **Start**/**Delete** per row
- «Shuffle questions» option (default off); shuffle on each **Start**

#### Questions / export / weights

- **`question generate --mix single|mixed|full`**; intent plan `seed.typeMix`; audit hint on mono-type
- **`expected`** field for `open` type; `question add --expected`; forward to `export test`
- **`export test --include-type` / `--exclude-type`** (XOR); MCP `includeTypes` / `excludeTypes`
- Weight invariant: `sum(weight) ≈ 1`; **`sdm cert reweight`**; audit `weightSumInvalid`

#### Profile / agents / MCP

- Portable skill `agents/intent-loop/`; `sdm intent validate-plan`; **`sdm profile create`** / MCP `profile_create`
- Portable skill **`agents/bootstrap-profile-pack/`** (stub in `bootstrap-role-pack/`)
- **`sdm agent hosts` / `sdm agent install --hosts cursor,gigacode|all`**
- MCP tools: optional `project` arg; shell tab-completion (`sdm completion install`)

### Changed (BREAKING)

- **`cert patch --add-requirement`** requires explicit `--from skill:amount`; **`--remove-requirement`** requires `--absorb-into`
- Domain **Role → Profile**: YAML `profile:`, `certifications/profiles/`, `Profile` type, codes `PROFILE_*`
- CLI/MCP flags **`--role` → `--profile`** (no alias); JSON export — `profile` field
- **`cert create`** requires an existing profile (`PROFILE_NOT_FOUND`); removed `--role-title` and auto-profile creation
- Level/team YAML: `profile` field (compat-read legacy `role` / `roles/`)
- `profile create --force` updates title and **preserves** existing `levels`
- Docs/skills: human path = intent to agent; order **profile create → skills → cert create**

### Changed

- `mcp install`: does **not** write `SDM_PROJECT_ROOT` by default; `--project` is optional default
- `AGENTS.md`: `intent-loop` / `explain-sdm` / `guide-suggest` as entry points; **profile** terminology
- README: «what it does / does not», three ontology layers, about/suggest/player/reweight

## [0.4.3] - 2026-07-19

Patch: HITL pack for role foundation (plan → confirm → execute).

### Added

- Portable skill `agents/bootstrap-role-pack/` — role foundation plan → confirm → skills/cert/seed/verify (optional `export test`)
- Pointers in `AGENTS.md`, `GETTING_STARTED.md`, `agents/README.md`

## [0.4.2] - 2026-07-19

Patch: GigaCode onboarding + action log for pilot.

### Added

- [`GETTING_STARTED.md`](./GETTING_STARTED.md) — OSS onboarding focused on **GigaCode** + MCP (`doctor` smoke)
- README / `AGENTS.md` / `agents/connect-mcp`: GigaCode-first; Cursor as alternative
- Action log: `.sdm/logs/sdm.log` + `error.log` (NDJSON, rotation); CLI and MCP; `SDM_LOG=0` disables

## [0.4.1] - 2026-07-19

Patch: multi-host MCP install (not just Cursor).

### Added

- `sdm mcp hosts [--json]` — MCP host registry (`cursor`, `gigacode`)
- `sdm mcp install --hosts <csv>|all` — install to selected hosts; `--cursor` is an alias
- Host `gigacode` (experimental): merge into `~/.gigacode/settings.json` (`--gigacode-home` / `--config`)
- `sdm mcp config --host <id>` — preview path and payload without writing

## [0.4.0] - 2026-07-19

Minor: methodology core sufficient for pilot (graph → depth-aware coverage → audit/search → teams/export).

### Added

#### Ontology / coverage (0.2)

- Skill graph core + `skill graph` / `skill impact`; cycle protection in `skill link`
- Optional `topics`; depth-aware coverage/gaps; `question generate` considers depth/topic gaps

#### Audit / search (0.3)

- `sdm audit`; MCP `audit`; skill `agents/audit-methodology/`
- Offline semantic index PoC: `index rebuild` / `search` (`search.provider: lancedb`)

#### Teams / export (0.4)

- `certifications/teams/` overlays; `--team` in coverage/gaps/export
- `export confluence`; `export test --adaptive`
- MCP parity: `export_confluence`, `index_rebuild`, `search`; team/adaptive params in tools
- `cert coverage` / `gaps`: non-zero exit on `hasThin` (depth or question count)

### Not in 0.4.0

- Candidate analysis / comparison, RGB spectrum, external HR connectors
- Real LanceDB vector search + embeddings (offline JSON PoC exists under `lancedb` flag)
- MCP HTTP (stdio MCP exists)
- Interactive TTY wizards (intentionally — bet on agent-first)

## [0.3.0] - 2026-07-19

Minor: methodology audit and offline semantic index.

### Added

- `sdm audit [--role … --level …] [--json]`; MCP `audit`; skill `agents/audit-methodology/`
- Offline semantic index PoC: `sdm index rebuild`, `sdm search` with `search.provider: lancedb` (JSON index, no model download)
- Audit includes `semanticDuplicates` if the index is already built

## [0.2.0] - 2026-07-19

Minor after 0.1.7: skill graph and depth-aware coverage.

### Added

#### Ontology

- Skill graph in core: `buildSkillGraph` / `detectCycles` / `assertAcyclicDepends`
- `skill link` rejects `depends_on` edges that form a cycle (`CYCLE_DETECTED`)
- `sdm skill graph --role … --level … [--no-coverage] [--json]` — skill tree with coverage bars (`sdm.skill.graph/v1`)
- `sdm skill impact --skill … [--json]` — downstream skills / roles / levels (`sdm.skill.impact/v1`)
- MCP tools `skill_graph`, `skill_impact`; portable skill `agents/explore-ontology/`

#### Library / coverage

- Optional `topics` for skills and questions (`--topic` repeatable)
- **BREAKING** depth-aware `cert coverage` / `cert gaps`: `achievedDepth`, `depthRatio`, `uncoveredTopics`, `missingDifficultyBand`, `hasThin` (ok = count≥3 and depthRatio≥0.9)
- `question generate` considers depth/topic gaps in agent context

## [0.1.7] - 2026-07-19

Patch after 0.1.6: Mermaid coverage-graph export.

### Added

#### Export

- `sdm export mermaid --role … --level … [--no-coverage] [--json]` — Markdown + Mermaid skill graph with coverage coloring (`sdm.export.mermaid/v1`)
- MCP tool `export_mermaid`

## [0.1.6] - 2026-07-19

Patch after 0.1.5: MCP autotests and import-safe server.

### Added

#### Development / quality

- Autotests for `@spec-driven-methodology/mcp` (handlers on temp-project): `doctor`, `question_list`, `cert_gaps`, `export_test`
- `npm test` / `npm run verify` includes `@spec-driven-methodology/mcp` suite (after `@spec-driven-methodology/core`)
- MCP: tool registration extracted to `server.ts` (import without stdio start)

## [0.1.5] - 2026-07-19

Patch after 0.1.4: methodology export for consumers.

### Added

#### Export

- `sdm export test --role … --level … [--format json|csv] [--json]` — question pack + requirements for consumers (`sdm.export.test/v1`)
- `sdm export matrix --role … [--format csv|json] [--json]` — role×levels competency matrix (`sdm.export.matrix/v1`)
- MCP tools `export_test`, `export_matrix`; portable skill `agents/export-methodology/`

## [0.1.4] - 2026-07-19

Patch after 0.1.3: cert patch and automatic MCP wire.

### Added

#### Certifications

- `sdm cert patch --level … [--add-requirement] [--set-requirement] [--remove-requirement] [--title] [--desc] [--threshold] [--json]` — edit requirements without recreating level
- MCP tool `cert_patch`

#### MCP / agents

- `sdm mcp config [--json]` — Cursor MCP snippet with absolute paths (no manual editing)
- `sdm mcp install --cursor [--cursor-root] [--project] [--json]` — merge into `.cursor/mcp.json`
- Portable skill `agents/connect-mcp/`

## [0.1.3] - 2026-07-19

Patch after 0.1.2: agent-first question generate.

### Added

#### Library

- `sdm question generate --to-skill … [--count] [--difficulty-min/max] [--role] [--level] [--json]` — context + draft shells for the agent (no file writes, no LLM call in core)
- Portable skill `agents/generate-questions/`; MCP tool `question_generate`

## [0.1.2] - 2026-07-19

Patch after 0.1.1: agent read-ops and stdio MCP.

### Added

#### Library / certifications

- `sdm question list [--skill <id>] [--json]` — question inventory for agents
- `sdm cert gaps --role … --level … [--json]` — only `missing` / `thin` skills (subset of coverage)

#### MCP

- Package `@spec-driven-methodology/mcp` — stdio MCP server (`sdm-mcp`) with tools: `doctor`, `init`, `skill_add`, `skill_link`, `cert_create`, `cert_coverage`, `cert_gaps`, `question_add`, `question_list`
- Working directory = methodology project (or `SDM_PROJECT_ROOT`)

## [0.1.1] - 2026-07-19

Patch after 0.1.0: cert create, core autotests, portable bootstrap skill.

### Added

#### Agents

- Portable skill `agents/bootstrap-methodology/` — greenfield loop: `skill add` → `cert create` → `question add` → `cert coverage --json`
- `AGENTS.md` / `agents/README.md`: bootstrap vs close-coverage; close-coverage refers to bootstrap if structure doesn't exist yet

#### Development / quality

- Autotests for `@spec-driven-methodology/core` (temp-dir fixtures): `parseRequirementTriple`, `addSkill` / `linkSkill`, `addQuestion`, `createCertification`, `computeCoverage`
- `npm test` (workspace → `@spec-driven-methodology/core`) and unified `npm run verify` (build → typecheck → test)

#### Certifications

- `sdm cert create --role … --role-title … --level … --level-title … --requirement skill:depth:weight … [--threshold] [--force] [--json]`
- Upsert role (merge `levels`), write level YAML; skills in requirements must exist in ontology
- Level id is unique in project (PoC)

## [0.1.0] - 2026-07-19

First public PoC on GitVerse (`kotler/specra`). Agent-first CLI and portable skills.

### Added

#### Methodology project

- `sdm init` / `sdm init --with-examples` — skeleton for ontology, library, certifications, `.sdm/`, `AGENTS.md`
- `sdm doctor` — verify current directory is an SDM project

#### Ontology (skills)

- `sdm skill add <id> --name … [--category] [--desc] [--force] [--json]`
- `sdm skill link <id> --depends-on a,b [--related-to x,y] [--json]`
- YAML in `ontology/skills/` with Zod validation; link merging; self-dependency guard

#### Library (questions)

- `sdm question add --to-skill … --type … --difficulty … --text … [--option] [--correct] [--json]`
- Question schema validation; id generation; refuses overwrite without `--force`

#### Certifications

- `sdm cert coverage --role … --level … [--json]`
- Coverage heuristics by question count (`missing` / `thin` / `ok`, default threshold 3)
- Non-zero exit code if a required skill has 0 questions; `--json` for agents

#### Agents

- Portable skills in `agents/` (not Cursor-only): `agents/close-coverage`
- Root `AGENTS.md` — entry point for any coding agent

#### Platform

- TypeScript monorepo: `@spec-driven-methodology/cli`, `@spec-driven-methodology/core`
- Development via OpenSpec (`openspec/specs`: project-root, cert-coverage, question-add, skill-write)
- License: Apache-2.0

### Not in 0.1.0

Historical snapshot at first PoC (some items closed in 0.1.2–0.4.0; current «not yet» — in `[Unreleased]` and recent releases).

- MCP server, AI question generation (`question generate`), vector search → later: MCP in 0.1.2, generate in 0.1.3, search PoC in 0.3.0
- `skill graph` / cycle detection beyond self-dep → 0.2.0
- Mermaid / `export test` → 0.1.5–0.1.7
- Candidate analysis / comparison — still outside core
- Interactive TTY wizards (intentionally — bet on agent-first)

[Unreleased]: https://gitverse.ru/kotler/specra/compare/v0.9.0-alpha.2...HEAD
[0.9.0-alpha.2]: https://gitverse.ru/kotler/specra/compare/v0.9.0-alpha.1...v0.9.0-alpha.2
[0.9.0-alpha.1]: https://gitverse.ru/kotler/specra/compare/v0.8.0...v0.9.0-alpha.1
[0.8.0]: https://gitverse.ru/kotler/specra/compare/v0.7.0...v0.8.0
[0.7.0]: https://gitverse.ru/kotler/specra/compare/v0.6.0...v0.7.0
[0.6.0]: https://gitverse.ru/kotler/specra/compare/v0.5.0...v0.6.0
[0.5.0]: https://gitverse.ru/kotler/specra/compare/v0.4.3...v0.5.0
[0.4.3]: https://gitverse.ru/kotler/specra/compare/v0.4.2...v0.4.3
[0.4.2]: https://gitverse.ru/kotler/specra/compare/v0.4.1...v0.4.2
[0.4.1]: https://gitverse.ru/kotler/specra/compare/v0.4.0...v0.4.1
[0.4.0]: https://gitverse.ru/kotler/specra/compare/v0.3.0...v0.4.0
[0.3.0]: https://gitverse.ru/kotler/specra/compare/v0.2.0...v0.3.0
[0.2.0]: https://gitverse.ru/kotler/specra/compare/v0.1.7...v0.2.0
[0.1.7]: https://gitverse.ru/kotler/specra/compare/v0.1.6...v0.1.7
[0.1.6]: https://gitverse.ru/kotler/specra/compare/v0.1.5...v0.1.6
[0.1.5]: https://gitverse.ru/kotler/specra/compare/v0.1.4...v0.1.5
[0.1.4]: https://gitverse.ru/kotler/specra/compare/v0.1.3...v0.1.4
[0.1.3]: https://gitverse.ru/kotler/specra/compare/v0.1.2...v0.1.3
[0.1.2]: https://gitverse.ru/kotler/specra/compare/v0.1.1...v0.1.2
[0.1.1]: https://gitverse.ru/kotler/specra/compare/v0.1.0...v0.1.1
[0.1.0]: https://gitverse.ru/kotler/specra/releases/tag/v0.1.0