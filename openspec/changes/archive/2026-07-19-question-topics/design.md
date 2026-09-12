## Context

YAML schemas for Question/Skill lack topics. Gap reporting and generate need them.

## Goals / Non-Goals

**Goals:** Optional topics arrays; CLI/MCP write path; defaults to [].

**Non-Goals:** Required topics; NLP extraction.

## Decisions

1. Zod `.default([])` for topics on both schemas.
2. Commander: collect via multiple `--topic` using custom collect or comma-separated `--topics` plus repeatable `--topic`.
3. Skill topics = expected themes; question topics = covered themes.

## Risks / Trade-offs

- [Empty topics] → coverage-depth treats as no topic gaps.

## Migration Plan

Additive; old files parse with default [].
