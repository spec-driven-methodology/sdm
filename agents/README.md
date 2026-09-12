# Portable agent skills

Canonical instructions for **any** AI agent that operates SDM methodology projects.

- **Source of truth:** this directory (`agents/*/SKILL.md`)
- **Entry point:** [`../AGENTS.md`](../AGENTS.md)
- **Not Cursor-only:** do not treat `.cursor/skills` as the product surface

## Skills

| Skill | When to use |
|-------|-------------|
| [explain-sdm](./explain-sdm/SKILL.md) | «Что такое SDM?» → MCP `about` (эталон methodology-as-specs; specs·framework·agent; not LMS / not agent harness; competency owners) |
| [guide-suggest](./guide-suggest/SKILL.md) | «Что дальше?» → `suggest` (harden/validate, stale, gaps, export, player, levers) |
| [intent-loop](./intent-loop/SKILL.md) | **Primary methodology:** NL intent → clarify → plan → confirm → execute → result (**Profile**); raw `.md` corpus → quality-report first |
| [bootstrap-profile-pack](./bootstrap-profile-pack/SKILL.md) | HITL execute for profile/level foundation (via intent-loop or direct) |
| [bootstrap-role-pack](./bootstrap-role-pack/SKILL.md) | Stub → `bootstrap-profile-pack` |
| [bootstrap-methodology](./bootstrap-methodology/SKILL.md) | Low-level greenfield loop without plan gate |
| [close-coverage](./close-coverage/SKILL.md) | Close gaps / workItems on an existing profile/level |
| [explore-ontology](./explore-ontology/SKILL.md) | `skill graph` / `skill impact` for trees and blast radius |
| [close-staleness](./close-staleness/SKILL.md) | After ontology edits: `content stale` / `meta.basis` → review / regenerate |
| [generate-questions](./generate-questions/SKILL.md) | `question generate` → fill → `question validate` → `question add` |
| [audit-methodology](./audit-methodology/SKILL.md) | Ontology / duplicates / coverage audit (detailed) |
| [quality-report](./quality-report/SKILL.md) | Summary ●○○ (corpus/methodology/diff); not a substitute for audit-methodology |
| [connect-mcp](./connect-mcp/SKILL.md) | Wire MCP + skills via `mcp install --hosts` (skills by default; Cursor, GigaCode, …) |
| [export-methodology](./export-methodology/SKILL.md) | Hand off test / matrix / mermaid / confluence exports |
| [export-course](./export-course/SKILL.md) | Educational materials: brief → HITL → prose → `export learning` (howto/notes/cheatsheet/course; overview+glossary); author preview in player (Курсы), not LMS |
| [export-kit](./export-kit/SKILL.md) | Expert interview kit: `export kit` (JSON/HTML); open/code probes for interviewers; HTML is render only; player tab Шпаргалки |

## Notes

- Stdio MCP (`@spec-driven-methodology/mcp`) exposes the same domain ops as CLI; use `connect-mcp` to attach it to the host
- Primary wire: `sdm mcp install --hosts cursor,gigacode` (portable skills included; `--no-skills` / standalone `agent install` for edge cases)
- MCP is **one instance per host**; pass tool arg `project` for each methodology folder
