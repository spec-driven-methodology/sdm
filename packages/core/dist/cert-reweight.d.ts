import { type Level } from "./schemas.js";
export interface ReweightCertificationInput {
    level: string;
    profile?: string;
    /** Transfer: target skill already on level */
    skill?: string;
    delta?: number;
    /** Donor skills: skill:amount or just skill (uses full delta from one --from) */
    from?: string[];
    /** Full map replace: skill=weight */
    set?: string[];
}
export interface ReweightCertificationResult {
    level: Level;
    path: string;
    action: "reweight";
    before: Record<string, number>;
    after: Record<string, number>;
    transfers: Array<{
        from: string;
        to: string;
        amount: number;
    }>;
}
/**
 * Adjust requirement weights on an existing level (transfer or full map replace).
 * Does not change depths.
 */
export declare function reweightCertification(projectRoot: string, input: ReweightCertificationInput): ReweightCertificationResult;
//# sourceMappingURL=cert-reweight.d.ts.map