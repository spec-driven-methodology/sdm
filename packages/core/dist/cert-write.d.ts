import { RequirementSchema, type Level, type Profile } from "./schemas.js";
import type { z } from "zod";
type Requirement = z.infer<typeof RequirementSchema>;
export interface CreateCertificationInput {
    profile: string;
    level: string;
    levelTitle: string;
    description?: string;
    /** Raw triples from CLI: skill:depth:weight */
    requirementTriples: string[];
    threshold?: number;
    force?: boolean;
    /**
     * When true, fail if weights do not already sum to ~1.
     * When false (default), proportionally normalize shares on create.
     */
    noNormalizeWeights?: boolean;
}
export interface CreateCertificationResult {
    profile: Profile;
    level: Level;
    paths: {
        profile: string;
        level: string;
    };
    action: "create";
    /** True when input weights were proportionally normalized before persist. */
    weightsNormalized: boolean;
}
export declare function parseRequirementTriple(raw: string): Requirement;
/**
 * Create a certification level for an existing profile. All validation runs before any write.
 */
export declare function createCertification(projectRoot: string, input: CreateCertificationInput): CreateCertificationResult;
export {};
//# sourceMappingURL=cert-write.d.ts.map