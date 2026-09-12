import type { Level } from "./schemas.js";
export type ExportSkillFilterMode = "include" | "exclude";
export interface ExportSkillFilter {
    mode: ExportSkillFilterMode;
    skills: string[];
}
export interface ResolveExportSkillFilterInput {
    includeSkills?: string[];
    excludeSkills?: string[];
}
export interface ApplySkillFilterToRequirementsResult {
    requirements: Level["requirements"];
    weightsNormalized: boolean;
}
/**
 * Resolve include XOR exclude skill filter. Empty/undefined → no filter.
 * Skills must appear on the effective level requirements.
 */
export declare function resolveExportSkillFilter(input: ResolveExportSkillFilterInput, levelRequirements: readonly {
    skill: string;
}[]): ExportSkillFilter | undefined;
/**
 * Narrow level requirements by skill filter and renormalize weights to sum 1.
 */
export declare function applySkillFilterToRequirements(requirements: Level["requirements"], filter: ExportSkillFilter | undefined): ApplySkillFilterToRequirementsResult;
//# sourceMappingURL=export-skill-filter.d.ts.map