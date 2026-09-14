---
name: sdm-export-course
description: >-
  Build SDM educational materials from methodology keys (profile/level/skill/topic/questions):
  TeachingContext brief → HITL → optional ontology enrichment → agent prose → export learning.
  Use when the human asks for study material, course, notes, howto for learners.
  For expert/HR interview cheat sheet (open probes, one HTML page) use ../export-kit/SKILL.md
  (export kit) — NOT export learning --format cheatsheet.
license: Apache-2.0
compatibility: Requires SDM CLI (`sdm`) on PATH; run inside a methodology project (sdm.yaml).
metadata:
  author: sdm
  version: "0.9.0"
---

# Export educational materials (not LMS)

Work in a **methodology project**. Prefer `--json` / MCP `export_learning` (alias `export_course`).

SDM builds **TeachingContext** + module stubs + practice question ids (+ optional overview/glossary for `course`). **You** (the agent) write lesson markdown after human confirm. SDM does **not** call an LLM and does **not** track learner progress.

Schema stays `sdm.export.course/v1`. CLI canon: `sdm export learning` (alias `export course`).

## Clarify controls

**Propose** `format` + `depth` if the human did not name them.

| Control | Values | Human examples |
|---------|--------|----------------|
| Scope | profile+level / `--from-gaps` / `--skill` / `--topic` / `--from-questions` | «by the AI QA Middle profile», «only the prompt», «by question q-…» |
| `depth` | `brief` \| `standard` \| `detailed` | «short…» → `brief`; «with details and examples» → `detailed` |
| `format` | see table below | «how to do it» → `howto`; «notes» → `notes`; «course» → `course` |
| Practice | default on | «no practice» → `--no-practice` |
| Locale | `--locale` or human language | prose must stay in **one** language |

### Format contracts (what you produce)

| `format` | RU label | On exit (`meta.layout`) | Prose contract |
|----------|----------|-------------------------|----------------|
| `howto` | Instruction | `single_doc` — one lesson stub per module | Short steps + example in the target language; **may** use a compact step skeleton. No long course narrative. |
| `notes` | Notes | `single_doc` | Lecture/topic notes: theses, definitions, key distinctions; not a full course |
| `cheatsheet` | Cheat sheet (study) | `single_doc` | Lists/tables for **learners**; agent fills prose — not expert interview kit |

**Expert interview kit** (open/code probes, glossary, HTML for interviewer): [`../export-kit/SKILL.md`](../export-kit/SKILL.md) — `export kit`, not this skill.
| `course` | Course | `modular_course` | See **Course contract** below — **not** a copy of howto headings |

Deprecated: `--format concept` → normalized to `notes` + warning `FORMAT_CONCEPT_DEPRECATED`. Prefer `notes`.

Same keys (skill/topic/question) + different `depth`/`format` → different prose volume/style; practice ids stay aligned with `export test` library.

### Course contract (`format=course`)

Level-scoped packs (`--profile` + `--level`) include a leading module `kind: overview` (`skill: course-overview`) with stubs: what this course is / how it is organized / who it is for / what is out of scope. **Fill overview lessons first** (or together with skill lessons) before calling the pack complete.

For each skill/topic lesson:

1. Start with a **plain-language definition** of the topic for a beginner (not an empty heading).
2. Then: why it matters → explanation with **content-specific** headings → concrete example/scenario → what to practice next.
3. Headings MUST reflect that lesson’s content. Do **not** reuse a fixed quartet («Problem / Model / Example / Pitfalls» or English equivalents) as the default skeleton for every lesson.
4. Do **not** add a «Practice anchors» (or similar) section that only repeats `modules[].practiceQuestionIds` — practice is shown by the player / consumer from those ids.
5. Fill `glossary[].definition` for seeded terms you use; add `lessons[].footnotes` on first use of opaque terms when helpful.

### Human-readable titles and labels (mandatory for learner-facing packs)

Learner-facing surfaces (player Courses, exported course) show **titles**, not raw slugs:

- **Lesson stub titles** MUST be learner-facing. Rename a topic slug when you fill the lesson: keep the stub `id`/`topic` as the slug, but set `title` to a human label. Examples: `dockerfile` → «Dockerfile and building the image», `http-client` → «HTTP client for LLM», `transactions` → «Transactions in Spring», `domain-event` → «Domain events».
- **Prefer `topic_labels` at the ontology layer**: when a skill's topics are consistently English slugs, add `topic_labels` to the skill YAML (via `skill add --force` or a direct YAML edit through the engine) so every future export gets the label automatically and player/agents don't rely on guesswork. Example: `topic_labels: { "http-client": "HTTP client for LLM" }`.
- **Glossary entries** keep the slug as `term` (stable identity + matching), and the human label goes into `aliases`, e.g. `{ term: "http-client", aliases: ["HTTP client for LLM"], definition: "…" }`.
- Stub titles that are already plain labels are fine as-is. Do not invent fake humanization for code identifiers; identifiers stay Latin inside fenced code.

**Bad:** lesson stub titled `http-client`, glossary term `http-client` with no alias, body heading «domain-event».

**Good:** stub titled «HTTP client for LLM», glossary `{ term: "http-client", aliases: ["HTTP client for LLM"], definition: "…" }`.

**Bad (howto pasted into course):** every lesson = Problem / Model / Example / Pitfalls / Practice anchors.

### Grounding project examples (no unexplained project jargon)

Courses generated against a real codebase (like agentplatform) must be readable without the project in front of the reader. A learner does not know the project's classes, tables, or event names by heart.

- **Introduce every project artifact on first use**: say what it is and its role before referencing it. Not «The read model is updated from events», but «The read model (a dedicated read table `task_view`, built for queries) is updated from domain events: when `AgentTaskCreated` is published, the projection inserts a row into the read model».
- **Command vs fact**: if you reference a code class (`AgentTask`, `TaskRepository`, `JpaTaskRepository`), give one line on what it is (task aggregate / repository port / JPA adapter). Use `glossary` or a `footnote` for the first mention when a term is opaque.
- **Cut the «In the project» section when it teaches nothing**: if the project example does not add a distinction a learner couldn't get from a general example, replace it with a generic concrete example (request/response, SQL, code snippet) and drop the project reference.
- **Keep project examples pointed**: prefer one small end-to-end walkthrough per lesson (create task → outbox → relay → Kafka → consumer → read model) over scattered mentions of many classes. A single repeated canonical example is easier to follow than five disconnected ones.
- **The big picture**: when topics are shuffled, each lesson should anchor back to the same mental model (the course's canonical architecture) — one sentence «this technique lives in the infrastructure layer, next to the outbox relay we covered in the lesson on Kafka» helps the reader assemble the picture.

**Bad:** «The read model is updated from events: AgentTaskCreated → the projection updates the read table» (unclear what a read model is and where the table comes from).

**Good:** «A read model is a separate read model tuned for queries (in the project — the `task_view` table). It holds no business rules and is rebuilt from events: when the aggregate creates a task, the domain event `AgentTaskCreated` is published; a listener projection catches it and inserts a row into `task_view`».

**Good (course lesson sketch):**

```markdown
# Non-determinism of answers

Non-determinism is a property of a generative model that produces **different wordings**
for the same question on repeated runs.

## Why this matters to a tester

One «lucky» answer does not prove stable quality. You need acceptance
criteria and repeated runs of key cases.

## How to check in practice

1. Fix the rubric (facts and refusals — strictly; wordings — flexibly).
2. Run the case 2–3 times.
3. A discrepancy in facts or policy is a defect; a different wording with the same meaning usually is not.

## Example

Ask three times about a forbidden topic: each time there must be a refusal under the product policy.
```

### Locale and terms (mandatory)

- Prose language = `--locale` if set, else the human's language / methodology language.
- Do **not** leave unexplained foreign jargon as the only teaching of a concept (*primer*, *acceptable use*, *grounding* without a local-language definition).
- On first use: inline definition and/or `glossary` / `footnotes`. Latin **identifiers** OK: skill/question ids, CLI flags, API names, fenced code.
- Soft SDM warning `PROSE_LOCALE_MIXED` if filled bodies mix scripts outside fences — fix before delivery.
- Speak to the methodologist in their language too.

## Steps

1. **Confirm project** — `sdm doctor`
2. **Propose** format + depth (+ scope) → **wait for human confirm**.
3. **Generate lesson bodies** outside SDM based on the methodology keys:
   - Review skill descriptions, topics, questions (via `skill list`, `cert coverage`, individual skill/queston reads)
   - Write markdown bodies matching `controls.depth` / `controls.format` / locale. Neutral expert tone (no «hi / well done / you» unless asked).
   - Fill overview module first (if `format=course` and level-scoped).
   - Fill `glossary[].definition` for terms you use; add `lessons[].footnotes` on first use of opaque terms.
   - **Hint**: use `sdm list skills --json`, `sdm cert coverage --profile P --level L --json`, and read individual skill/question YAMLs to gather TeachingContext without an export call.
4. **Export** (fails with `COURSE_ALL_EMPTY` if all lesson bodies are empty — that is the guardrail; fill at least one body first):
   ```bash
   sdm export learning --profile "<profile>" --level "<level>" --depth standard --format course --locale ru --json
   # or:
   sdm export learning --skill prompt-engineering --topic testing --depth brief --format notes --json
   ```
   MCP: `export_learning` (alias `export_course`).
5. **Write final JSON** to `exports/` for the consumer. The document includes `schemaVersion: sdm.export.course/v1`, `id`, `meta.revision`.
6. Optional next: same scope → `export test`; author preview in `player/` (**Courses**, after `player sync --force`); `suggest` for levers.

## Guardrails

- Not an LMS / progress store — static player is author preview only
- **Consumer upsert:** external systems use `id` as slot key; replace when `meta.revision` changes (content fingerprint from basis, not `capturedAt`)
- Do not invent practice question content — only library ids
- Do not hand-edit ontology YAML when `skill` / `question` commands exist
- Schema: `sdm.export.course/v1` (separate from `sdm.export.test/v1`)

## Healing levers (post-export, in core 1.0)

Beyond the warnings, the core now ships deterministic helpers an agent can call to
close learning-readiness gaps without an LLM:

| Lever | Function (core) | What it does |
|---|---|---|
| **Back-fill topics** | `extractTopicsFromModules(modules)` → `mergeTopicsIntoSkill(declared, courseTopics)` | Closes `SKILL_TOPICS_EMPTY`: collect `lesson.topic` from a filled pack and union into `skill.topics` via `skill add --force`. |
| **Autofill description** | `suggestDescriptionFromModules(modules, skillId)` | Closes `SKILL_DESCRIPTION_THIN`: summary sentence from lesson titles + first paragraphs. |
| **Truncation check** | `detectTruncation(body)` | `LESSON_TRUNCATED` warning; regenerate the lesson body when the body ends mid-sentence/unclosed. |
| **Glossary tautology** | `collectLearningWarnings({ glossary })` | `GLOSSARY_TAUTOLOGY` when a definition starts with its own term; rewrite the definition. |
| **Edge suggestion** | `inferEdgesFromContent(skills)` | Proposes `related_to` when one skill's description/topics mention another; confirm via `skill link`. |
| **Course gate** | `quality.courseGate: strict` in `sdm.yaml` | Blocks export on `SKILL_DESCRIPTION_THIN`, `SKILL_TOPICS_EMPTY`, `TOPIC_UNCOVERED_BY_QUESTIONS`, `GRAPH_ISOLATED_IN_SCOPE` — instead of soft warning. |
| **Deep validate** | `validateQuestionLibraryDeep(root)` | Catches `single_choice` without options, `open` without expected, explanations that restate the answer. |

Before re-exporting a thin pack, heal warnings first:
```bash
# 1. review warnings (courseGate strict blocks the worst)
sdm export learning --profile P --level L --format course --json
# 2. back-fill topics + description from the filled pack (agent calls core helpers),
#    then skill add --force with the enriched fields
# 3. re-export
```