import { SdmError } from "./errors.js";
import { loadAllSkills } from "./skills.js";
/**
 * Build a directed dependency graph from ontology skills (or an explicit list).
 */
export function buildSkillGraph(skills) {
    const map = new Map();
    const dependsOn = new Map();
    for (const skill of skills) {
        map.set(skill.id, skill);
        dependsOn.set(skill.id, [...skill.depends_on]);
    }
    return { skills: map, dependsOn };
}
export function buildSkillGraphFromProject(projectRoot) {
    return buildSkillGraph(loadAllSkills(projectRoot));
}
/**
 * Return cycle paths (each path ends by repeating the start node).
 */
export function detectCycles(graph) {
    const cycles = [];
    const WHITE = 0;
    const GRAY = 1;
    const BLACK = 2;
    const color = new Map();
    const parent = new Map();
    for (const id of graph.skills.keys()) {
        color.set(id, WHITE);
        parent.set(id, null);
    }
    function extractCycle(start, end) {
        const path = [end];
        let cur = start;
        while (cur && cur !== end) {
            path.push(cur);
            cur = parent.get(cur) ?? null;
        }
        path.push(end);
        path.reverse();
        return path;
    }
    function dfs(u) {
        color.set(u, GRAY);
        for (const v of graph.dependsOn.get(u) ?? []) {
            if (!graph.skills.has(v)) {
                continue;
            }
            const c = color.get(v) ?? WHITE;
            if (c === WHITE) {
                parent.set(v, u);
                dfs(v);
            }
            else if (c === GRAY) {
                cycles.push(extractCycle(u, v));
            }
        }
        color.set(u, BLACK);
    }
    for (const id of graph.skills.keys()) {
        if ((color.get(id) ?? WHITE) === WHITE) {
            dfs(id);
        }
    }
    return cycles;
}
/**
 * Apply a proposed depends_on list for `skillId` onto a copy of the graph.
 */
export function withProposedDepends(graph, skillId, dependsOn) {
    const nextDepends = new Map(graph.dependsOn);
    nextDepends.set(skillId, [...dependsOn]);
    return { skills: graph.skills, dependsOn: nextDepends };
}
export function assertAcyclicDepends(graph) {
    const cycles = detectCycles(graph);
    if (cycles.length === 0) {
        return;
    }
    const path = cycles[0].join(" → ");
    throw new SdmError("CYCLE_DETECTED", `depends_on cycle detected: ${path}`);
}
//# sourceMappingURL=skill-graph.js.map