## Context

The core already loads skills, levels, questions, graph edges, and coverage deterministically. Audit composes those loaders into a read-only report consumed by CLI and MCP.

## Goals / Non-Goals

**Goals:**
- Provide one stable audit document for text, JSON, and MCP consumers.
- Detect same-skill lexical near duplicates with Unicode-aware Jaccard token sets.
- Reuse existing coverage and `SdmError` behavior.

**Non-Goals:**
- Semantic embedding comparison, writes, candidate analytics, or network calls.

## Decisions

- Keep the audit implementation in `@spec-driven-methodology/core`, with thin CLI/MCP adapters, so all agent interfaces share identical results.
- Compare question text only within a skill: this limits noisy matches while preserving actionable library hygiene.
- Use an explicit JSON schema identifier and deterministic sorted collections. This supports CI snapshots and stable agent automation.

## Risks / Trade-offs

- [Lexical matching misses paraphrases] → Later semantic-index work augments rather than replaces this baseline.
- [Large libraries have quadratic comparison cost] → The PoC is local; comparisons are scoped per skill and can be indexed later.
