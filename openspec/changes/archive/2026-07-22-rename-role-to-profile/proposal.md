## Why

Specra’s primary users are methodologists and managers, not developers. Domain term **Role** conflicts with everyday HR language («роль в команде», job title) and with unrelated «roles» in question content (e.g. Spring Security). **Profile** (профиль компетенций / профиль оценки) matches how these users think: «бэкенд-джавист со Spring» vs «низкоуровневый Java без Spring». We should use one term end-to-end so agents and docs do not teach a second vocabulary.

## What Changes

- **BREAKING:** Replace product term **Role** with **Profile** everywhere in Specra’s contract: YAML keys, directories, CLI flags, MCP tools, schemas, agent skills, user docs.
- Canonical entity: **Profile** + **Level** (+ optional **Team** overlay) = certification slice; skills/questions unchanged.
- Commands (agent tool surface): `sdm profile create|…`, flags `--profile` (not `--role`); MCP `profile_create`, etc.
- Paths: `certifications/roles/` → `certifications/profiles/`; YAML field `role:` → `profile:` (on profile docs, levels, teams).
- **Fully retire Role** as a Specra domain term (no dual `role`/`profile` in help text). Temporary **read migration** for old on-disk layouts may exist for one release; write path and public docs speak only Profile.
- Rename portable skill `bootstrap-role-pack` → `bootstrap-profile-pack` (or equivalent); update `AGENTS.md` / init template.
- Coordinate with open change `split-role-create-from-cert`: that change MUST ship as **`profile create`** + narrowed `cert create`, not `role create`.

## Non-goals

- Renaming Skills, Levels, Teams, Questions, Certification-as-export concepts.
- Changing meaning of «role» inside **question text** (candidate domain content).
- OpenSpec / core-dev vocabulary (unchanged).
- Building a GUI; still agent-first.
- Soft-forever aliases that keep teaching `--role` in docs (compat shim only if needed, then remove).

## Capabilities

### New Capabilities

- `profile-domain`: Canonical glossary and migration rules — Profile replaces Role; directory/YAML/CLI/MCP naming; doctor/audit hints for legacy paths.

### Modified Capabilities

- `cert-write`: Profile-aware cert create (existing profile required once split lands); no Role invent.
- `cert-coverage`, `cert-gaps`, `cert-patch`, `cert-teams`: `--profile` / profile field.
- `export-test`, `export-matrix`, `export-mermaid`, `export-confluence`: profile flags and document fields.
- `skill-graph-cli` / related graph ops: `--profile`.
- `question-generate`: optional profile context flag renamed.
- `bootstrap-methodology`, `bootstrap-role-pack`: profile terminology + skill rename.
- `mcp-server`: profile tools/args; drop role_* tool names from public list.
- `getting-started`, `core-tests`: examples and tests use profile.
- `methodology-audit`: profile-scoped audit flags/copy.

## Impact

- `@spec-driven-methodology/core` schemas, loaders, writers, exports, teams, coverage, tests, example templates.
- `@spec-driven-methodology/cli`, `@spec-driven-methodology/mcp`, agents/, README, CHANGELOG, GETTING_STARTED, idea.md pointers.
- Existing methodology projects: migrate `roles/` → `profiles/` and YAML keys (compat reader and/or `doctor` guidance).
- Sibling changes: amend `split-role-create-from-cert` and align `intent-driven-agent-loop` copy to Profile before apply.
- Agent-first: humans say «профиль Java Middle»; agents call `profile_*` / `--profile` with `--json`.
