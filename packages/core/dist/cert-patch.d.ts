import { type Level } from "./schemas.js";
export interface PatchCertificationInput {
    level: string;
    /** Optional consistency check against level.profile */
    profile?: string;
    addTriples?: string[];
    setTriples?: string[];
    removeSkills?: string[];
    /** Donor transfers for adds: skill:amount */
    fromTransfers?: string[];
    /** When removing, absorb removed weight into this skill */
    absorbInto?: string;
    title?: string;
    description?: string;
    threshold?: number;
}
export interface PatchCertificationResult {
    level: Level;
    path: string;
    action: "patch";
    added: string[];
    updated: string[];
    removed: string[];
}
/**
 * Patch an existing level: add/set/remove requirements and optional metadata.
 * Mutating requirements enforces sum(weights) ≈ 1; adds need explicit --from transfers.
 */
export declare function patchCertification(projectRoot: string, input: PatchCertificationInput): PatchCertificationResult;
//# sourceMappingURL=cert-patch.d.ts.map