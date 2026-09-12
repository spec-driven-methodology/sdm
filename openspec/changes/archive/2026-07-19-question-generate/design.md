## Context

Gaps + question add exist; generate closes the AI drafting loop agent-first.

## Goals / Non-Goals

**Goals:** context + drafts JSON; no file writes; MCP + skill; tests.

**Non-Goals:** Embedded LLM provider.

## Decisions

1. Drafts are placeholders; agent fills; write via `addQuestion` only.
2. Optional `--role`/`--level` attach gap status from `runCertGaps`.
3. Count default 3, max 20; difficulty range defaults 0.3–0.6.

## Risks / Trade-offs

- [Agents may try to write YAML] → skill + nextStep insist on question add

## Migration Plan

New command only.

## Open Questions

- None.
