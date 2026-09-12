## Architecture

```
ontology/ + library/ + certifications/
        ↓ runExportKit (deterministic)
sdm.export.kit/v1  ──→  renderKitHtml  ──→  exports/*.html
        ↓
   player tab «Шпаргалки» (author preview)
```

SSOT остаётся YAML. HTML и player — read-only consumers. Актуальность: `meta.basis` + `content stale` → regenerate.

## Schema highlights

| Section | Source |
|---------|--------|
| modules | level requirements skills, topo order |
| probes | library questions `type ∈ {open, code}` per skill |
| glossary | skill id, name, description |
| checklist | requirements depth/weight |

Probes carry `explanation`, optional `expected`, `validation.criteria` — эталон для интервьюера, не для автопроверки кандидата.

## Package identity

`id`: `kit-{profile}-{level}` (default scope). `meta.revision` from `hashContentRevision(basis)`.

## Warnings

- `KIT_NO_PROBE_QUESTION` — required skill has no open/code probe
- `KIT_EXPLANATION_MISSING` — probe without explanation
- `KIT_SKILL_DESCRIPTION_EMPTY` — empty skill description

`--strict`: throw `KIT_EXPORT_BLOCKED` if any of above.

## HTML render

Core function `renderKitHtml(document)` — no npm deps, escaped text, minimal CSS (sections, qbox, glossary table). Footer shows `meta.revision`.

## Player

Third home mode `kits` alongside tests/courses. Separate localStorage library key. Kit reader: single-page scroll (TOC + modules + checklist + glossary).

## Boundaries

Specra is not an HR testing platform. Kit is for competency owners / interviewers — same positioning as Confluence export.
