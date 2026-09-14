---
name: term-add
description: Add glossary terms to library/terms for kit and course glossary SSOT.
---

# Term add

Add **library/terms** entries — not skill descriptions.

## When to use

- Populating kit glossary from methodology concepts (MCP, LLM, prompt injection)
- Marking product adapters with `kind: product` (Cursor, IDE hooks)

## Commands

```bash
sdm term add mcp \
  --term "MCP" \
  --definition "Model Context Protocol — a standard for integrating tools with LLMs." \
  --alias "Model Context Protocol" \
  --skill ai-llm-basics \
  --kind concept

sdm term list [--skill <id>] [--json]
```

MCP: `term_add`, `term_list`.

## Rules

- Link terms to skills via `--skill` so kit level glossary filters correctly
- Do not hand-edit YAML when commands exist
- After terms change: re-export kit and check `KIT_GLOSSARY_FALLBACK_SKILL` cleared