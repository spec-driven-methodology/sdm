## Why

Local semantic search over methodology YAML is needed for gap-aware generation and duplicate detection without scanning every file by hand (idea.md §9.1).

## What Changes

- `search.provider: lancedb` enables PoC offline JSON index (deterministic token embeddings; no model download)
- `sdm index rebuild [--json]`, `sdm search "<query>" [--kind] [--json]`
- `SEARCH_DISABLED` / `INDEX_NOT_FOUND` error codes

## Non-goals

- Real LanceDB / Xenova in this PoC cut
- MCP HTTP

## Capabilities

### New Capabilities
- `semantic-index`: rebuild + search local methodology index

## Impact

- core semantic-index.ts, CLI index/search, tests
