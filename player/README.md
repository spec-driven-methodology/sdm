# SDM export player

Author preview for packages:

- `sdm export test` → `sdm.export.test/v1`
- `sdm export learning` (alias `export course`) → `sdm.export.course/v1`
- `sdm export kit` → `sdm.export.kit/v1`

**Not a secure exam and not an LMS** — author preview of canonical artifacts. Answers/prose are in JSON. Learning progress is not saved.

## Install / update

```bash
sdm player sync          # only missing files
sdm player sync --force  # update player/ from SDM templates
```

Does not touch `ontology/`, `library/`, `certifications/`, `sdm.yaml`.

## Modes: Tests | Courses | Cheat Sheets

The main page has a tab switcher:

| Tab | Document | Action |
|---|---|---|
| **Tests** | `sdm.export.test/v1` | library → **Start** → session with checking |
| **Courses** | `sdm.export.course/v1` | library → **Open** → page-through lessons |
| **Cheat Sheets** | `sdm.export.kit/v1` | library → **Open** → modules, expert questions, checklist |

HTML kit (`export kit --format html`) — separate file for interviewers; upload **JSON** kit to the **Cheat Sheets** tab.

Empty "No interviewer questions" block means: the library only contains test questions with options — add **open-ended questions with explanations** to the SDM Library and rebuild the cheat sheet.

Libraries are separate (different `localStorage` keys, same project scope via `player/` path). Session options (shuffle / timer) are only visible on the Tests tab.

The list of `exports/*.json` (HTTP) is classified by `schemaVersion` and filtered by the current tab.

## Tests

Volume N is set by the **author** at export time, not the player:

```bash
sdm export test --profile <profile> --level <level> > exports/test.json
# sampling:
sdm export test --profile <profile> --level <level> --adaptive --seed 42 --per-skill 3
```

1. Open `player/index.html` (easier via a local static server — the list of `exports/*.json` is visible).
2. **Tests** tab → load JSON (list / drag-drop / picker) → **Loaded tests**.
3. On a pack: **Start** (next to **Delete**). Re-uploading the same name updates the record.
4. Session options (global in `localStorage` of the origin): auto-advance, shuffle questions/options, time limit.
5. Statistics at the end (including weighted vs threshold).
6. Back to main — **SDM** or the "Main" breadcrumb.

## Courses

```bash
sdm export learning --profile <profile> --level <level> --depth standard --format course \
  --locale ru --json > exports/course.json
# formats: howto|notes|cheatsheet|course
# level + format=course → leading module kind=overview + glossary term candidates
```

1. **Courses** tab → load course JSON → **Open**.
2. Module outline on the left (module **About the Course** first, if `kind: overview`); lesson on the right. **Back** / **Next** navigate lessons in order.
3. Empty `body` → stub "No lesson text"; structure still navigable.
4. Meta: depth / format / locale; warnings block from export, if any.
5. **Footnotes** — under the **current** lesson's text: explicit `lessons[].footnotes`, otherwise terms from `glossary` related to the topic/lesson text. The full **Course Glossary** (`glossary`) block — once at the end of the table of contents (section "Reference"), not on every page.
6. **Module practice:** only from `practiceQuestionIds` (the "Practice Anchors" section in body is not needed and not used by the UI). Course JSON does **not** contain full questions — only ids.
   - If the **Tests** tab already has a paired `export test` with these ids → the **Take Practice** button starts a filtered test session.
   - Otherwise ids are shown as text; load a test pack and re-open the course.

## Answer quality (methodology)

Bias "first correct / longest option" is addressed by:

- runtime: player option and/or `sdm export test --shuffle-options --seed <n>`
- library: `quality.distractorQuality: soft|strict` in `sdm.yaml` + `sdm audit --json`