import { type CoverageResult, type SkillCoverage } from "./coverage.js";
import { type LoadWarning } from "./loaders.js";
import { type ExportArtifactRef } from "./export-artifacts.js";
import type { Level, Profile } from "./schemas.js";
export declare const SKILL_GRAPH_SCHEMA = "sdm.skill.graph/v1";
export declare const SKILL_IMPACT_SCHEMA = "sdm.skill.impact/v2";
export interface SkillGraphNodeView {
    skill: string;
    dependsOn: string[];
    coverage?: SkillCoverage;
    /** Indent depth for terminal tree (0 = root requirement). */
    depth: number;
}
export interface SkillGraphDocument {
    schemaVersion: typeof SKILL_GRAPH_SCHEMA;
    profile: string;
    level: string;
    title: string;
    coverage: boolean;
    minOkQuestions: number;
    nodes: SkillGraphNodeView[];
    text: string;
}
export interface SkillGraphRun {
    projectRoot: string;
    document: SkillGraphDocument;
    coverageResult?: CoverageResult;
    warnings: LoadWarning[];
}
export interface SkillImpactQuestionRef {
    id: string;
    skill: string;
}
export interface SkillImpactDocument {
    schemaVersion: typeof SKILL_IMPACT_SCHEMA;
    skill: string;
    downstreamSkills: string[];
    profiles: string[];
    levels: Array<{
        profile?: string;
        level: string;
        title: string;
    }>;
    questions: SkillImpactQuestionRef[];
    exports: ExportArtifactRef[];
}
export interface SkillImpactRun {
    projectRoot: string;
    document: SkillImpactDocument;
}
export declare function loadAllProfiles(projectRoot: string): Profile[];
export declare function loadAllLevels(projectRoot: string): Level[];
export interface RunSkillGraphOptions {
    startDir: string;
    profile: string;
    level: string;
    coverage?: boolean;
}
export declare function runSkillGraph(options: RunSkillGraphOptions): SkillGraphRun;
export interface RunSkillImpactOptions {
    startDir: string;
    skill: string;
}
export declare function runSkillImpact(options: RunSkillImpactOptions): SkillImpactRun;
//# sourceMappingURL=skill-graph-ops.d.ts.map