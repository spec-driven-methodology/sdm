## Context

`export test` / `export matrix` ship consumer packages. Idea.md §5.2 wants Mermaid for Confluence with coverage colors. Coverage statuses already exist (`missing` / `thin` / `ok`).

## Goals / Non-Goals

**Goals:**

- Deterministic Mermaid flowchart for role+level skills
- Default: wrap in Markdown fence; color nodes by coverage when `--coverage` (default true)
- `--json` envelope; MCP tool; tests + playground smoke

**Non-Goals:**

- Full Confluence page; % thresholds; editing ontology; HTTP MCP

## Decisions

1. **Command**
   ```bash
   sdm export mermaid --role <id> --level <id> [--coverage|--no-coverage] [--json]
   ```
   - Default stdout: Markdown (`# title` + ` ```mermaid ` … ` ``` `)
   - `--json`: `{ ok, format: "markdown", document }` where document is versioned object + `markdown` string

2. **Graph assembly**
   - Nodes: every `requirement.skill` on the level
   - Edges: `depends_on` from loaded skill YAML when **both** ends are in the node set (PoC; no orphan deps as gray nodes yet)
   - Layout: `flowchart LR` (or TB); node id = skill id (sanitize for Mermaid: replace `-` with `_` in ids if needed, keep label as skill id)

3. **Colors (`--coverage`, default on)**
   - Reuse `runCertCoverage` / `computeCoverage` statuses:
     - `ok` → green fill (`#90EE90` or classDef)
     - `thin` → yellow
     - `missing` → red/pink
   - Without coverage: unstyled nodes (or uniform)
   - Exit code: 0 on successful export even if `hasMissing` (delivery ≠ audit), same as export test

4. **Document shape**
   ```json
   {
     "schemaVersion": "sdm.export.mermaid/v1",
     "role", "level", "title",
     "coverage": true,
     "nodes": [{ "skill", "status?" }],
     "edges": [{ "from", "to" }],
     "mermaid": "flowchart LR\\n...",
     "markdown": "# ...\\n\\n```mermaid\\n...\\n```\\n"
   }
   ```
   Default stdout prints `markdown`.

5. **Errors**
   - Existing role/level/project codes; no new YAML writes

6. **MCP**
   - Tool `export_mermaid` → envelope with document

## Risks / Trade-offs

- [Mermaid id chars] → sanitize node ids; labels keep original skill ids
- [Incomplete graph without transitive deps] → Accept for PoC; document; follow-up gray nodes
- [Color contrast in Confluence] → simple classDef; tweak later

## Migration Plan

New command only. Smoke in playground with examples role/level.

## Open Questions

None blocking. Follow-up: `export confluence`, gray ontology-only nodes, % thresholds.
