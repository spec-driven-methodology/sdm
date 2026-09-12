## 1. Core graph

- [x] 1.1 Add `loadAllSkills` + `skill-graph.ts` (`buildSkillGraph`, `detectCycles`, `assertAcyclicDepends`)
- [x] 1.2 Hook `linkSkill` to assert acyclic after proposed `depends_on` merge
- [x] 1.3 Export APIs from `@spec-driven-methodology/core` index
- [x] 1.4 Unit tests: DAG, cycle detect, link rejects cycle, link accepts DAG
- [x] 1.5 `npm run verify`
- [x] 1.6 CHANGELOG Unreleased note (cycle guard on link); archive change
