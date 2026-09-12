## 1. Align open sibling changes (before code)

- [x] 1.1 Amend `split-role-create-from-cert`: rename capability/commands to `profile create` / `profile-write`; remove `role create` from proposal/design/tasks/specs
- [x] 1.2 Amend `intent-driven-agent-loop`: human + skill copy uses «профиль» / `bootstrap-profile-pack`; plan kind `profile-pack` (not role-pack)
- [x] 1.3 Decide apply order: prefer this rename (+ split as profile) before or in same release as intent-loop docs ship

## 2. Core schemas and loaders

- [x] 2.1 Rename Zod/types: `Role` → `Profile`, YAML key `profile`, `levels` may be empty (coord. with split)
- [x] 2.2 Loaders: read `certifications/profiles/`; compat-read legacy `roles/` + key `role`; normalize in memory to Profile
- [x] 2.3 Writers: only `profiles/` + `profile:`; update level/team YAML writers
- [x] 2.4 Error codes: `PROFILE_EXISTS`, `PROFILE_NOT_FOUND` (retire ROLE_* from public surface)
- [x] 2.5 `doctor`: warn when `certifications/roles/` present
- [x] 2.6 Move example templates under `profiles/`; update init dirs (`.gitkeep`)

## 3. Domain ops (CLI surface for agents)

- [x] 3.1 CLI group `sdm profile create|…`; all `--role` → `--profile` (BREAKING, no documented alias)
- [x] 3.2 Update cert/coverage/gaps/patch/export/graph/audit/generate commands + help text
- [x] 3.3 If split not yet applied: ensure `cert create` still works with `--profile`; after split: require existing profile
- [x] 3.4 Export JSON documents: field `profile` not `role`

## 4. MCP

- [x] 4.1 Rename tools/args to `profile_*` / `profile`; update mcp-server tests and tool list
- [x] 4.2 Remove public `role_*` tool names

## 5. Agents and docs

- [x] 5.1 Rename skill `bootstrap-role-pack` → `bootstrap-profile-pack`; update frontmatter + AGENTS.md / agents/README
- [x] 5.2 Update all other skills + init `AGENTS.md` / README templates to Profile
- [x] 5.3 GETTING_STARTED, README, CHANGELOG (BREAKING), idea.md domain examples
- [x] 5.4 openspec main specs sync (`profile-domain`, `profile-write`); baseline list updated in config.yaml

## 6. Tests and verify

- [x] 6.1 Update/rename core+cli+mcp tests for Profile; add legacy roles/ read fixture
- [x] 6.2 `npm run verify`
- [x] 6.3 Smoke: empty project → `profile create` → skills → `cert create --profile` → coverage `--profile` --json
