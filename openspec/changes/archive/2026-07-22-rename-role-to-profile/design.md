## Context

Today Specra stores assessment tracks as **roles** (`certifications/roles/*.yaml`, CLI `--role`, MCP args `role`). End users are methodologists/managers; «роль» sounds like job title or ACL, while they mean a **competency / assessment profile**. Open changes (`split-role-create-from-cert`, `intent-driven-agent-loop`) still say Role — vocabulary must converge before those ship.

## Goals / Non-Goals

**Goals:**

- One public term: **Profile** (RU: профиль).
- Rename filesystem, YAML, Zod, CLI, MCP, agents, examples.
- Migration path for existing methodology trees.
- Align sibling OpenSpec changes to Profile (no `role create` ever released).

**Non-Goals:**

- Dual long-lived public API (`--role` and `--profile` both documented).
- Rewriting question bank texts that mention “role” in a domain sense.
- UI product.

## Decisions

1. **Eliminate Role from Specra domain language**  
   Do not keep «Role» as synonym in help/AGENTS. Only Profile.  
   *Why:* Dual terms recreate the confusion we are fixing.  
   *Alternative:* Profile in RU docs, Role in CLI → rejected.

2. **On-disk layout**  
   - Dir: `certifications/profiles/<id>.yaml`  
   - Profile YAML: `profile:`, `title:`, `levels: []`  
   - Level YAML: `profile:` (was `role:`)  
   - Team YAML: `profile:` (was `role:`)  
   Export JSON fields: `profile` instead of `role`.

3. **CLI / MCP naming**  
   - `sdm profile create <id> --title …`  
   - `--profile <id>` on cert/export/graph/audit/generate  
   - MCP: `profile_create`; tool args `profile` not `role`  
   - Types/functions: `Profile`, `createProfile`, `loadProfile`, …

4. **Compat (one transition window)**  
   Reader MAY accept legacy `certifications/roles/` + YAML key `role` and normalize to Profile in memory.  
   Writers MUST emit only `profiles/` + `profile`.  
   `sdm doctor` SHOULD report legacy layout and recommend migrate.  
   Optional later: `sdm migrate profiles` — out of scope unless cheap; document manual move.  
   **No** documenting `--role` as supported flag after change (hard BREAKING on CLI).

5. **Skill rename**  
   `agents/bootstrap-role-pack` → `agents/bootstrap-profile-pack` (update frontmatter name/description). Leave a one-line pointer file or AGENTS note that old name is retired (no forever duplicate skill body).

6. **Sibling changes**  
   - Rewrite `split-role-create-from-cert` artifacts: `profile create`, capability `profile-write` (not `role-write`).  
   - `intent-driven-agent-loop`: human copy uses «профиль».  
   Apply order preference: land vocabulary + loaders first, or land combined with split in one release so users never see `role create`.

7. **Where “role” may still appear**  
   - English word inside **user content** (questions).  
   - Non-Specra systems.  
   - Not in SDM CLI help, schemas, or agent skills as entity name.

## Risks / Trade-offs

- **[BREAKING all agents/scripts]** → CHANGELOG + skill updates in same release; bump appropriately.  
- **[Existing playground/methodology data]** → compat read + doctor warning.  
- **[Large diff surface]** → mechanical rename in core/cli/mcp/tests; keep behavior identical.  
- **[Partial apply with split change]** → amend split before apply to avoid shipping Role then renaming.

## Migration Plan

1. Schema + loaders (compat read) + writers (new paths).  
2. CLI/MCP flag/tool rename.  
3. Examples templates under `profiles/`.  
4. Agents/docs/CHANGELOG.  
5. Amend open changes to Profile.  
6. `npm run verify`; smoke empty project with `profile create`.  
7. Next release: remove compat reader (follow-up change) once adopters migrated.

## Open Questions

- None blocking: skip dedicated `migrate` command in v1 if doctor + docs suffice.
