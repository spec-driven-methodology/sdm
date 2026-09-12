## Context

`export test` selects library questions by required skills only. After type-mix seeding, packages often include `open` (“текст”). Authors want «экспорт без текстовых» as an intent; agents must not invent `jq` pipelines. Product boundary: Specra still does not run exams — this is a consumer package shaping option.

## Goals / Non-Goals

**Goals:**

- First-class include/exclude type filter on `export test` + MCP
- Deterministic filtering after skill selection (and after adaptive pick if enabled)
- Transparent `meta` for the applied filter
- Skill/intent mapping so humans never need flags

**Non-Goals:**

- Mutating the library; filtering topics/difficulty; new export schemaVersion
- jq as documented UX; player UI filter (player loads whatever JSON it gets)

## Decisions

### D1 — Two complementary flags (mutually exclusive modes)

| Mode | CLI | Semantics |
|---|---|---|
| Allowlist | `--include-type <type>` (repeatable) | Keep only listed types |
| Denylist | `--exclude-type <type>` (repeatable) | Drop listed types |

Passing both include and exclude in one invocation SHALL fail with `EXPORT_TYPE_FILTER_CONFLICT`.

Alternatives: single `--types a,b,c` CSV — worse for MCP/agents; exclude-only — awkward for «только choice».

### D2 — Canonical type names only

Accepted values: `single_choice` | `multi_choice` | `open` | `code` (schema enum). Unknown → `EXPORT_TYPE_INVALID`.

NL aliases live in **skills**, not CLI: «текст» / «текстовый» / «свободный ответ» → `open`; «выбор» → choice types, etc. CLI stays machine-stable.

### D3 — Filter order

1. Load questions for required skills (current behavior)
2. Adaptive sample if `--adaptive`
3. **Then** apply type filter
4. Recompute `meta.questionCount`, `meta.skillsMissingQuestions` (skill with zero questions **after** filter counts as missing for that export package — advisory, export still succeeds)

Empty `questions` after filter: success with `questionCount: 0` (agents can warn the human). Optional `meta.typeFilter` object.

### D4 — Meta shape (additive, same schemaVersion)

```json
"meta": {
  "questionCount": 12,
  "skillsMissingQuestions": ["…"],
  "typeFilter": {
    "mode": "exclude",
    "types": ["open"]
  }
}
```

When no filter: omit `typeFilter` (or `mode: "all"`) — prefer **omit** for backward-compatible consumers.

### D5 — MCP / agent contract

`export_test` args: `includeTypes?: string[]`, `excludeTypes?: string[]` (same mutual exclusion). Skills instruct: human «без текста» → `excludeTypes: ["open"]`.

### D6 — Adaptive + filter

Adaptive picks first, then filter may leave fewer than `--per-skill` — acceptable; document that for strict per-skill counts after filter, prefer library composition or larger `--per-skill`.

## Risks / Trade-offs

- [Export empty of questions surprises author] → Skill warns when `questionCount === 0`; suggest regenerating choice-only or clearing filter
- [Alias confusion text vs open] → Skills map NL; CLI rejects `text` / `text_answer` with hint to use `open`
- [skillsMissingQuestions meaning shifts when filter empties a skill] → Document as “missing in this package”, not “missing in library”

## Migration Plan

1. Core filter helper + tests
2. CLI/MCP wiring
3. Skills + CHANGELOG
4. No data migration; default path identical

## Open Questions

None blocking — prefer omit `typeFilter` when unset.
