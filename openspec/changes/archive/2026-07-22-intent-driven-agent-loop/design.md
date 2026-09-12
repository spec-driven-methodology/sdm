## Context

**Vision** (`docs/idea.md` §1.1): human states methodology intent; agent executes Specra tools; CLI is agent/CI contract, not the human UI.

**Current state**

| Layer | Exists | Gap |
|-------|--------|-----|
| Domain CLI + `--json` + MCP tools | Yes | Humans still steered to type flags |
| HITL profile pack (plan → confirm → write) | Yes | One pack only; weak clarify; still says Role until rename; not framed as primary UX |
| Portable skills / `AGENTS.md` | Yes | Methodology `AGENTS.md` after `init` still shows CLI recipes first |
| OpenSpec-like multi-turn clarify | Partial | Pack stops once for confirm; no structured clarify Q&A |
| Result handoff (coverage/export summary) | Informal | No stable result schema |

**Analogy to keep**

```
OpenSpec (core dev)          Specra (methodology user)
─────────────────────        ─────────────────────────────
/opsx:explore · propose      intent → clarify questions
proposal / design / tasks    plan JSON (role-pack / close-coverage…)
confirm → apply              confirm → agent runs CLI/MCP
archive / result             result summary (gaps, exports)
```

Stakeholders: методолог (no CLI), agent host (GigaCode/Cursor/Claude ± MCP), Specra core (Zod + commands).

## Goals / Non-Goals

**Goals:**

1. Make **intent → clarify → plan → confirm → execute → result** the documented and skill-enforced primary loop.
2. Keep CLI/MCP as the only write path for agents; humans never need flags.
3. Stable schemas: plan (`sdm.intent.plan/v1` compatible with role-pack) + result (`sdm.intent.result/v1`).
4. Works **with MCP or with shell CLI** the same way (skill instructions dual-path).

**Non-Goals:**

- Chat UI product, LMS, candidate scoring.
- Auto-apply writes without confirm.
- Replacing OpenSpec for Specra-core development.
- New MCP transport/hosts in this change.

## Decisions

### D1 — Skill-first, thin core helpers

- **Choice:** Primary delivery = portable skill `agents/intent-loop/SKILL.md` that routes intents to existing packs (`bootstrap-role-pack`, `close-coverage`, `export-methodology`, …).
- **Optional v1 helper in core:** `intent validate-plan` (Zod validate plan JSON) and later `intent summarize-result` from coverage/gaps JSON — agent-facing `--json` only.
- **Why not** a TTY wizard: contradicts agent-first; humans talk to the agent.
- **Why not** only docs: agents need an executable skill contract.

### D2 — Profile pack stays; intent-loop wraps it

- **Choice:** Do not delete the greenfield pack. `intent-loop` **delegates** greenfield profile foundation to plan kind `profile-pack` (schema evolves from `sdm.bootstrap.role-pack/v1` → `sdm.bootstrap.profile-pack/v1` with `rename-role-to-profile`).
- Skill path: `bootstrap-profile-pack` after rename; until rename ships, code may still live at `bootstrap-role-pack` but **human/agent copy says Profile only**.
- **Alternative considered:** Merge into one mega-skill → rejected.

### D3 — Clarify phase is mandatory when slots missing

- **Choice:** Agent MUST ask short clarifying questions (**profile**, level, direction/category, seed depth, export?) when intent is incomplete — OpenSpec-explore style, then freeze a plan.
- **Schema:** plan includes `clarifications[]` (answered Q&A); not persisted under `.sdm/sessions/` in v1.

### D4 — Transport: MCP preferred, CLI equivalent required

- Skill documents: prefer MCP tools when available; else `sdm … --json`.
- No new MCP tools required for v1 if existing tools cover execute; optional MCP `intent_validate_plan` only if core helper lands.

### D5 — Docs split: human vs agent

- Human path in `GETTING_STARTED`: install → open agent → paste intent example → confirm plan → see result.
- Agent appendix / `AGENTS.md`: command table.
- Methodology `AGENTS.md` template after `init`: lead with intent examples + “load `intent-loop`”, not `question add --option`.

### D6 — Phased delivery

| Phase | Ship |
|-------|------|
| **P0** | Skill `intent-loop` + docs + AGENTS; plan kind `profile-pack` (Profile language) |
| **P1** | Zod plan validate + `sdm intent validate-plan --json` |
| **P2** (later) | Session log; more plan kinds |

Implements **P0 + P1**. Wire CLI flags as `--profile` when `rename-role-to-profile` is applied; until then agents may still call legacy `--role` only inside the pack skill, never in human-facing copy.

### D7 — Role term excluded from product copy

- Human/docs/skills: **Profile** only.  
- Table column «Роль» meaning *actor* in agent-first docs (методолог vs агент) is unrelated and may stay.  
- Specra entity Role is retired (`rename-role-to-profile`).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Agents ignore skill / jump to raw CLI | AGENTS.md + init template + GETTING_STARTED |
| Clarify loops forever | Cap N questions; defaults in plan `notes` |
| Plan schema drift vs pack | Shared Zod; `kind: profile-pack` |
| Flag rename race with Profile change | Apply rename before or with this; skills say Profile |
| PATH / MCP missing | `link:cli` + doctor first |

## Migration Plan

1. Land skill + docs (no breaking CLI).
2. Point `bootstrap-role-pack` “when to use” → also reachable via `intent-loop`.
3. Update `init` AGENTS template (new projects); existing projects: user can re-init AGENTS with `--force` or manual copy — document.
4. Rollback: remove skill entry from AGENTS; old packs still work.

## Open Questions

1. Persist clarify/plan under `.sdm/sessions/` in P1 or defer? **Default: defer.**
2. Russian-only human copy vs bilingual skill? **Default: skill EN (agent), human GETTING_STARTED RU (existing).**
3. Should `intent-loop` become the only listed greenfield entry in AGENTS? **Default: yes as primary; role-pack listed as underlying pack.**
