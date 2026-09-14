# ADR-000: SDM Naming (Spec-Driven Methodology)

Status: **Accepted** (2026-09-12)
Context: rebranding SDM → SDM ahead of PGConf.Academy 2026 (16.11.2026) and the talk deadline (24.09.2026).

## Decision

| Layer | Name | Notes |
|---|---|---|
| Methodology | **SDM (Spec-Driven Methodology)** | official practice name |
| GitHub org | `spec-driven-methodology` | https://github.com/spec-driven-methodology |
| npm scope | `@spec-driven-methodology` | registered (2026-09-12) |
| Packages (npm) | `@spec-driven-methodology/core`, `.../cli`, `.../mcp` | |
| Binaries | `sdm`, `sdm-mcp` | short, for terminal use |
| Repositories | `methodology`, `sdm-core`, `sdm-cli`, `sdm-mcp` | under `spec-driven-methodology` org |
| CHANGELOG | maintained without mentioning "sdm" | functionality preserved, git history is new |

## Motivation

- **SDM** is a descriptive name (practice), composes with others' prefixes: `postgrespro-sdm`, `hse-sdm`. SDM is a proper name (brand), does not compose (`postgrespro-sdm-kit` sounds odd).
- Single namespace everywhere (GitHub = npm = packages) — removes confusion of "two names for two levels".
- Short binary names — convenient in terminal; long org name lives in URL and namespace, not in commands.
- New git history in `sdm/` — clean start, no tech debt from the rebranding history.

## Rejected alternatives

- `sdm` / `@spec-driven-methodology/*` — brand, does not compose, confuses methodology and implementation
- `@sdm` — scope taken on npm
- `sdm-cli`/`sdm-mcp` without scope — taken/cluttered by other projects on npm
- `spec-driven-methodology-mcp` — too long for binary/repository name

## Consequences

- All SDM mentions in public texts (README, docs, talk submission) are replaced with SDM.
- Code from `specra/` is moved to `sdm/` with renaming: `@specra/*` → `@spec-driven-methodology/*`, binary `specra` → `sdm`.
- CHANGELOG retains functional records of past versions (historical artifact, contains SDM references).
- Git history in `sdm/` starts fresh (squashing/migration not needed — new directory).