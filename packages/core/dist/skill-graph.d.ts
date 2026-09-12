import type { Skill } from "./schemas.js";
export interface SkillGraph {
    skills: Map<string, Skill>;
    /** Directed depends_on edges: from skill id → dependency ids */
    dependsOn: Map<string, string[]>;
}
/**
 * Build a directed dependency graph from ontology skills (or an explicit list).
 */
export declare function buildSkillGraph(skills: Skill[]): SkillGraph;
export declare function buildSkillGraphFromProject(projectRoot: string): SkillGraph;
/**
 * Return cycle paths (each path ends by repeating the start node).
 */
export declare function detectCycles(graph: SkillGraph): string[][];
/**
 * Apply a proposed depends_on list for `skillId` onto a copy of the graph.
 */
export declare function withProposedDepends(graph: SkillGraph, skillId: string, dependsOn: string[]): SkillGraph;
export declare function assertAcyclicDepends(graph: SkillGraph): void;
//# sourceMappingURL=skill-graph.d.ts.map