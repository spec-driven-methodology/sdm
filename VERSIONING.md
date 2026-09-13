# Версионирование SDM

Единый источник правды — поле `version` в корневом `package.json` (пакет `sdm`).  
`sdm about` / MCP `about` и MCP initialize (`serverInfo.version` + description) читают эту строку через `getProductVersion()`.

`sdm --version` печатает:

```
 ____   ____   __  __
/ ___| |  _ \ |  \/  |
\___ \ | | | || |\/| |
 ___) || |_| || |  | |
|____/ |____/ |_|  |_|

Spec-Driven Methodology

core 0.8.0-alpha.3

(пустые строки после логотипа, после tagline и после версий). Тот же логотип+tagline — в `sdm` / `--help` на TTY (не на каждом `--json`-вызове).

- `core` — product identity (SSOT / CLI);
- `mcp` — `version` из **резолвнутого** `@spec-driven-methodology/mcp/package.json` (тот пакет, который подхватывает `mcp install`).  
  Если строки расходятся — CLI и MCP из разных установок; после `npm run build` / `link:cli` перезапустите MCP в Cursor.

## Формат

```
MAJOR.MINOR.PATCH                 # stable, например 0.9.0
MAJOR.MINOR.PATCH-<stage>.<build> # prerelease, например 0.8.0-alpha.143
```

- `<stage>`: `alpha` | `beta` | `rc`
- `<build>`: целое ≥ 1 — номер сборки **внутри стадии** (дата не входит в identity)

## Команды

```bash
npm run version              # показать текущую identity
npm run version:build        # …-alpha.N → …-alpha.(N+1)
npm run version:prerelease   # то же, что version:build
npm run version:major|minor|patch
npm run version:alpha|beta|rc   # поставить стадию, build = 1
npm run version:stable          # убрать prerelease → X.Y.Z
npm run version:sync            # выровнять packages/* (+ lockfile)
npm run version:sync -- 0.8.0-alpha.10 --no-lock
npm run version:check           # drift / invalid identity (входит в verify)
```

Все bump-команды синхронизируют workspace-пакеты. Для `build` / `prerelease` lockfile не трогается (быстрее); для semver/stage — обновляется.

## Auto-bump при сборке

`npm run build` сначала вызывает `bump-version.mjs auto`:

- если identity **prerelease** — увеличивает `<build>` и пишет packages;
- если **stable** — ничего не меняет;
- если `SDM_NO_BUMP_BUILD=1` — skip.

`npm run verify` использует `compile` (без auto-bump), чтобы CI/локальный verify не пачкал git на каждом прогоне.

`npm run compile` — только TypeScript build + completion, без смены версии.

После локального `npm run build` / `link:cli` перезапустите MCP в Cursor — в Installed MCP Servers должна смениться `v0.8.0-alpha.N`.

Чтобы обновить global `npm link` **без** auto-bump prerelease:

```bash
npm run link:refresh              # compile + link CLI/MCP + completion
npm run link:refresh -- --mcp     # + mcp install (cursor,gigacode; cursor-root = ..)
```

`link:cli` по-прежнему идёт через `build` (на prerelease поднимает `…-alpha.N`).

## AI / агенты

Можно сказать: «увеличь build», «переведи в beta», «сделай stable» — агент вызывает соответствующий `npm run version:*`.
