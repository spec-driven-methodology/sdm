---
name: explore-ontology
description: >
  Inspect SDM skill graph and change impact via CLI/MCP
  (`skill graph`, `skill impact`). Use when the human asks what depends
  on a skill, how coverage looks as a tree, or blast radius of ontology edits
  (including questions and exports). For freshness after edits, use close-staleness.
---

# Explore ontology (skill graph / impact)

## When to use

- Visualize required skills for a profile/level (terminal tree + coverage bars)
- Find downstream skills, certifications, questions, and exports affected by changing a skill

## Tool contract

Prefer `--json` or MCP tools `skill_graph` / `skill_impact`. Do not hand-edit YAML.

```bash
sdm skill graph --profile "<role>" --level "<level>" --json
sdm skill impact --skill "<id>" --json
```

Impact schema: `sdm.skill.impact/v2` — `downstreamSkills`, `profiles`, `levels`, `questions`, `exports`.

## Steps

1. Confirm project: `sdm doctor`
2. For coverage tree: `skill graph --profile … --level … --json`
3. For blast radius: `skill impact --skill … --json`
4. Summarize for the human; if ontology will change, follow with `content stale` ([`../close-staleness/SKILL.md`](../close-staleness/SKILL.md))
5. Propose `skill link` / `cert patch` / `question add` next if gaps appear
