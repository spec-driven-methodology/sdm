## Context

Patch after 0.1.1 for list/gaps/MCP already on master.

## Goals / Non-Goals

**Goals:** Changelog section, version bump, verify, local tag v0.1.2.

**Non-Goals:** New features; push without request.

## Decisions

1. Patch 0.1.1 → 0.1.2 across all workspace packages.
2. Keep planned items under empty Unreleased.
3. Tag locally on release commit.

## Risks / Trade-offs

- [Tag without push] → user pushes when ready

## Migration Plan

Rebuild/relink after pull.

## Open Questions

- None.
