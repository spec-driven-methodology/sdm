## Context

PoC line was `0.1.0`. Unreleased accumulated user-visible work that should ship as a patch release before new agent DX commands.

## Goals / Non-Goals

**Goals:** SemVer bump, CHANGELOG section, README, local git tag `v0.1.1`.

**Non-Goals:** Feature work; remote push unless user asks.

## Decisions

1. Patch bump `0.1.0` → `0.1.1` (additive CLI/docs/tests, no breaking API).
2. Align all workspace package versions + `@spec-driven-methodology/cli` dependency on `@spec-driven-methodology/core` to `0.1.1`.
3. Empty `[Unreleased]` after cut; keep «Запланировано» under Unreleased or move planned items under Unreleased empty section.
4. Tag locally; do not push unless requested.

## Risks / Trade-offs

- [Uncommitted WIP mixed into release] → include all already-implemented Unreleased items; list/gaps/MCP stay out
- [Tag without push] → document; user pushes to GitVerse

## Migration Plan

Consumers rebuild/relink CLI after pull; no methodology YAML migration.

## Open Questions

- None.
