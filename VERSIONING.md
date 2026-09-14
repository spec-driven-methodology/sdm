# SDM Versioning

Single source of truth — the `version` field in the root `package.json` (the `sdm` package).  
`sdm about` / MCP `about` and MCP initialize (`serverInfo.version` + description) read this string through `getProductVersion()`.

`sdm --version` prints:

```
 ____   ____   __  __
/ ___| |  _ \ |  \/  |
\___ \ | | | || |\/| |
 ___) || |_| || |  | |
|____/ |____/ |_|  |_|

Spec-Driven Methodology

core 0.8.0-alpha.3

(blank lines after the logo, after the tagline, and after versions). Same logo+tagline appears in `sdm` / `--help` on TTY (not on each `--json` call).

- `core` — product identity (SSOT / CLI);
- `mcp` — `version` from the **resolved** `@spec-driven-methodology/mcp/package.json` (the package that `mcp install` picks up).  
  If the lines diverge — CLI and MCP come from different installations; after `npm run build` / `link:cli`, restart MCP in the host.

## Format

```
MAJOR.MINOR.PATCH                 # stable, e.g. 0.9.0
MAJOR.MINOR.PATCH-<stage>.<build> # prerelease, e.g. 0.8.0-alpha.143
```

- `<stage>`: `alpha` | `beta` | `rc`
- `<build>`: integer ≥ 1 — build number **within stage** (date is not part of identity)

## Commands

```bash
npm run version              # show current identity
npm run version:build        # …-alpha.N → …-alpha.(N+1)
npm run version:prerelease   # same as version:build
npm run version:major|minor|patch
npm run version:alpha|beta|rc   # set stage, build = 1
npm run version:stable          # remove prerelease → X.Y.Z
npm run version:sync            # sync packages/* (+ lockfile)
npm run version:sync -- 0.8.0-alpha.10 --no-lock
npm run version:check           # drift / invalid identity (part of verify)
```

All bump-commands sync workspace packages. For `build` / `prerelease`, lockfile is not touched (faster); for semver/stage — it is updated.

## Auto-bump on build

`npm run build` first calls `bump-version.mjs auto`:

- if identity is **prerelease** — increments `<build>` and writes packages;
- if **stable** — no change;
- if `SDM_NO_BUMP_BUILD=1` — skip.

`npm run verify` uses `compile` (no auto-bump), so CI / local verify doesn't dirty git on each run.

`npm run compile` — only TypeScript build + completion, no version change.

After a local `npm run build` / `link:cli`, restart MCP in the host — the Installed MCP Servers should show `v0.8.0-alpha.N`.

To update the global `npm link` **without** auto-bump prerelease:

```bash
npm run link:refresh              # compile + link CLI/MCP + completion
npm run link:refresh -- --mcp     # + mcp install (cursor,gigacode; cursor-root = ..)
```

`link:cli` still goes through `build` (on prerelease bumps `…-alpha.N`).

## AI / agents

You can say: "bump the build", "move to beta", "make stable" — the agent calls the corresponding `npm run version:*`.