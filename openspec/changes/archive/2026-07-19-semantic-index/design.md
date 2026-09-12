## Context

Config already has search.provider none|lancedb.

## Goals / Non-Goals

**Goals:** Offline searchable index; CI without network.

**Non-Goals:** Production LanceDB driver.

## Decisions

1. Store documents as JSON under `.sdm/index/methodology.json`
2. Cosine-like score via token overlap (bag-of-words)
3. provider name `lancedb` reserved for future swap; PoC uses same flag

## Risks / Trade-offs

- [Not true LanceDB] → documented as PoC surface
