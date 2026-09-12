## Context

Today product identity is bare semver `0.8.0` from root `package.json`, read at runtime by `getProductVersion()`. CLI `--version`, `about.version`, and MCP `serverInfo.version` / description already agree — but they only change when someone bumps semver. Local rebuilds and MCP restarts look identical in Cursor’s Installed MCP Servers list.

TraitBuddy separates semver bump scripts from a dated `build YYYYMMDD-NNN`. For Specra the preferred shape is a **single npm-compatible identity string** with the build as the prerelease number: `0.8.0-alpha.143` (no date required).

## Goals / Non-Goals

**Goals:**

- One SSOT string humans/agents can compare after rebuild: CLI, about, MCP initialize.
- Cheap local signal: each meaningful compile under a prerelease stage gets a new `N`.
- Agent-friendly bump commands (`npm run version`, `version:build`, stage/major/minor/patch) that sync all workspace packages.
- Preserve existing sync/check and “no hardcoded version in CLI/MCP src” rules.

**Non-Goals:**

- Separate dated `build.json` SSOT (optional later).
- npm publish workflow.
- Methodology / skill metadata versions.
- Showing build only in Cursor UI if the host ignores `serverInfo.version` (we still advertise it; host UI is out of our control).

## Decisions

### 1. Identity format = semver with optional prerelease stage + build

**Choice:** `MAJOR.MINOR.PATCH` (stable) or `MAJOR.MINOR.PATCH-<stage>.<build>` where `<stage>` ∈ `alpha` | `beta` | `rc` and `<build>` is a positive integer.

**Why over `+build` metadata:** User asked for TraitBuddy-like `10.0.0-alpha.143`. Prerelease is visible in npm/`package.json` and in MCP `version` without a second field. Semver `+meta` is often stripped by tools and sorts as equal to the base version.

**Why over separate `build` in about JSON only:** Cursor Settings shows MCP `serverInfo.version` / description, not custom about fields — the identity must be in initialize.

### 2. SSOT remains root `package.json` `version`

**Choice:** Full identity string lives only in root `version`; `version:sync` / `version:check` keep workspaces aligned. Runtime still uses `getProductVersion()`.

**Alternative rejected:** Generated `dist/build-info.json` only — would diverge from package.json and complicate sync/check.

### 3. Auto-increment build on compile when prerelease is present

**Choice:** Root `build` script (or a first step it calls) runs a small `version:build` that:

1. Parses root version.
2. If prerelease matches `^(alpha|beta|rc)\.(\d+)$`, increments the integer and syncs workspaces.
3. If stable (no prerelease), does nothing.
4. If `SPECRA_NO_BUMP_BUILD=1`, skips (for CI/`verify` when a clean tree is required).

**Why:** Solves “I rebuilt but still see the same Specra” without remembering a manual bump. Stable releases stay pinned until an intentional cut.

**Trade-off:** Local prerelease builds dirty git. Acceptable for PoC; document “commit when you care” or use `SPECRA_NO_BUMP_BUILD` in CI.

### 4. Bump script family (agent / AI callable)

**Choice:** Extend scripts (new `scripts/bump-version.mjs` or grow sync) with npm scripts:

| Script | Effect |
|--------|--------|
| `version` | Print current identity |
| `version:build` / `version:prerelease` | `…-alpha.N` → `…-alpha.(N+1)` |
| `version:major` / `minor` / `patch` | Bump core semver; keep stage, reset build to `1` if stage present |
| `version:alpha` / `beta` / `rc` | Set/switch stage, reset build to `1` |
| `version:stable` | Strip prerelease → `X.Y.Z` |
| `version:sync` | Existing align (regex widened for prerelease) |

All write via sync so lockfile/workspace pins stay correct.

### 5. Migration of current `0.8.0`

**Choice:** On apply, move product to `0.8.0-alpha.1` (or next unused N) so auto-build bumps start working immediately. CHANGELOG notes the identity format; no methodology impact.

### 6. Display surfaces (no new MCP tools)

- `sdm --version` → full identity
- `about` / MCP `about` → `version` full identity
- MCP `createServer`: `version` + `description` `… · v${version}` unchanged mechanically, richer string

Optional later: `about` JSON field `build` parsed from prerelease — not required if string is enough.

## Risks / Trade-offs

- **[Risk] Git noise from every local build** → Mitigation: `SPECRA_NO_BUMP_BUILD=1` for CI; document that bump commits are optional for WIP.
- **[Risk] Treating build as prerelease confuses “real” alpha/beta product stages** → Mitigation: Specra PoC is already pre-1.0; document that `N` is build counter within stage, not a marketing train.
- **[Risk] Host UI hides `serverInfo.version`** → Mitigation: Still put identity in `description` (`· v…`); agents use `about` / `--version`.
- **[Risk] sync-version regex currently allows only light prerelease** → Mitigation: tighten parser to `X.Y.Z` or `X.Y.Z-(alpha|beta|rc).N` only (reject arbitrary junk).

## Migration Plan

1. Implement bump/build scripts + widen sync/check.
2. Set root to `0.8.0-alpha.1`, sync workspaces.
3. Wire build auto-bump; add tests for helper/parity.
4. Smoke: `npm run build` → `sdm --version` / MCP initialize show `0.8.0-alpha.2` (etc.); restart MCP in Cursor.
5. Docs: short VERSIONING section or README pointer; CHANGELOG Unreleased.

Rollback: set version back to `0.8.0` via sync; remove auto-bump step.

## Open Questions

- None blocking: date in identity deferred; Cursor UI completeness depends on host.
