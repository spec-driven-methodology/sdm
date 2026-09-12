## Context

`about` answers identity; `intent-loop` runs a confirmed plan; domain CLI/MCP execute writes. After `question generate` / `question add`, agents lack a machine-readable “what’s next” signal, so humans never hear about `export test`, `player/`, or levers (threshold vs per-skill vs type filter). MVP: read-only state → ranked suggestions with Russian phrase levers.

## Goals / Non-Goals

**Goals:**

- `buildSuggest(projectRoot, { profile?, level? })` → Zod payload, 1–5 suggestions.
- CLI `sdm suggest [--profile] [--level] [--json]` + MCP `suggest` (same JSON; `project` optional like other tools).
- Deterministic priority: gaps/generate → export (+ levers) → player → tighten/adjust levers.
- Skill + AGENTS + intent-loop: after write/generate or «что дальше?» → call suggest; do not list MCP tools.
- Keep threshold, question volume, and type filters as separate lever categories.

**Non-Goals:**

- Wizard / conversational tutor in core.
- Auto-export or auto-edit threshold without confirm.
- Replacing intent-loop execute path.
- Perfect “stale export” detection (mtime heuristics optional; MVP: export file exists for profile/level or any under `exports/`).

## Decisions

1. **Requires methodology project** (unlike `about`)
   - Fail `NOT_A_PROJECT` outside `sdm.yaml`.
   - Optional `--profile` / `--level`: if omitted, pick best effort (single profile/level, or first with most questions / coverage target); include `focus` in payload.

2. **Payload shape (stable for agents)**
   ```ts
   {
     ok: true,
     projectRoot,
     focus: { profile?: string, level?: string },
     snapshot: {
       hasProfile: boolean,
       hasLevel: boolean,
       questionCount: number,
       gapSummary?: { missing: number, thin: number, ok: number },
       hasExport: boolean,
       hasPlayer: boolean
     },
     suggestions: [{
       id: string,           // export-test | try-player | close-gaps | generate-questions | raise-threshold | …
       label: string,        // human RU/EN short
       why: string,
       skill?: string,       // portable skill id
       commandHint?: string, // e.g. "export test --profile … --level … --json"
       requiresConfirm: boolean,
       levers: [{ phrase: string, mapsTo: string, category: "export"|"threshold"|"volume"|"types"|"other" }]
     }]  // length 1..5
   }
   ```

3. **Priority rules (MVP, ordered; take top ≤5)**
   - No profile/level → suggest bootstrap via `intent-loop` / profile create (levers minimal).
   - Level exists + (missing|thin) gaps → `close-gaps` / `generate-questions` first; optional secondary `export-test` as “preview as-is”.
   - Level exists + questions > 0 + !hasExport (for focus) → **export-test** with levers:
     - «без текстовых» → `--exclude-type open`
     - «по 5 на навык» → `--per-skill 5` (or similar shipped flag)
     - «только single choice» → `--include-type single_choice` when shipped
   - hasExport + !hasPlayer → `player-sync` / try player (`player/index.html`).
   - hasExport + hasPlayer → optional «прогнать в player» + levers to re-export stricter:
     - «строже порог» → raise level `threshold` via cert patch / document mapsTo (confirm required)
     - «больше вопросов» → generate / higher per-skill
   - Always keep `threshold` levers out of the same category as `depth`/`weight`.

4. **Detection helpers**
   - Reuse `runCertGaps` / coverage counts when profile+level known.
   - `exports/`: look for `test-<profile>-<level>.json` or any `sdm.export.test` JSON if naming varies; document heuristic in code.
   - `player/`: `existsSync(join(projectRoot, "player", "index.html"))`.

5. **Skill `agents/guide-suggest/SKILL.md`**
   - WHEN: after successful generate/add/export writes; OR human asks «что дальше?», «что ещё можно?».
   - THEN: `suggest --json` → present 1–3 top labels + a few levers; on pick → hand off to intent-loop / export-methodology / close-coverage / player sync.
   - MUST NOT dump MCP tool list as the answer.

6. **intent-loop delta**
   - Extend “structured result handoff”: suggested next steps SHOULD come from `suggest` when available, not invented CLI flag lists.

7. **about registry**
   - Add `suggest` to `ABOUT_CLI_COMMANDS` / `ABOUT_MCP_TOOLS` when implementing (small follow-through in tasks).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Wrong focus when many profiles | Require `--profile/--level` when ambiguous; JSON error `SUGGEST_FOCUS_REQUIRED` |
| Export filename conventions drift | Prefer documented pattern + fallback scan; test with init examples |
| Agents ignore skill | AGENTS.md one-liner + intent-loop result phase |
| Lever mapsTo becomes stale | Only levers for shipped flags; unit-test phrases |

## Migration Plan

- No YAML migration. Rebuild/link CLI+MCP; `agent install` for new skill.

## Open Questions

None blocking. Default suggestion language: Russian labels/levers (match product docs); JSON keys English.
