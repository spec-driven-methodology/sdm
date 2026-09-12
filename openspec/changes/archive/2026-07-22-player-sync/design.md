## Context

After `export-test-player`, new projects get `player/` from init. Existing projects (e.g. `my-methodology`) need a safe sync. `init --force` is too broad.

## Goals / Non-Goals

**Goals:**

- `sdm player sync [--force] [--json]` in a methodology project
- Copy from `packages/core/templates/methodology/player/` → `<project>/player/`
- Default: absent-only; `--force`: overwrite player files only
- Agent-friendly JSON envelope

**Non-Goals:**

- Syncing other scaffolds (AGENTS.md, examples)
- Checksums / semver of player bundle
- HTTP serve command

## Decisions

1. **Command name:** `player sync` (not `init --scaffold player`) — clear domain op, no confusion with full re-init.
2. **Reuse `copyTreeDeep`** from init (extract shared helper or call a new `syncPlayerAssets(projectRoot, { force })`).
3. **Require methodology project** via `findProjectRoot` / `isMethodologyProject`; fail `NOT_A_PROJECT` outside.
4. **MCP:** add `player_sync` for parity with other domain ops (thin).
5. **Idempotent:** second sync without force reports skipped counts; with force refreshes from current Specra install templates.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Local player customizations lost on `--force` | Document; default is non-destructive |
| Template missing in broken install | Fail with clear `PLAYER_TEMPLATE_MISSING` |

## Migration Plan

No data migration. Existing projects run `sdm player sync` once.

## Open Questions

None.
