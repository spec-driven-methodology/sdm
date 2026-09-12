/** Allowed absolute deviation from 1.0 for level weight sums. */
export declare const WEIGHT_SUM_EPSILON = 0.000001;
/** Decimal places for persisted / normalized shares. */
export declare const WEIGHT_PRECISION = 6;
export declare function roundWeight(w: number): number;
export declare function sumWeights(weights: readonly number[]): number;
export declare function weightSumIsValid(sum: number): boolean;
export declare function assertWeightSum(weights: readonly number[], context?: string): void;
/**
 * Proportionally normalize positive-total weights to shares summing to 1.
 * Returns `normalized: false` when input already satisfied the invariant.
 */
export declare function normalizeWeights(weights: readonly number[]): {
    weights: number[];
    normalized: boolean;
};
/** Parse `skill:amount` transfer donor triple. */
export declare function parseWeightTransfer(raw: string): {
    skill: string;
    amount: number;
};
/** Parse `skill=weight` for cert reweight --set. */
export declare function parseWeightSet(raw: string): {
    skill: string;
    weight: number;
};
export declare function weightMap(requirements: readonly {
    skill: string;
    weight: number;
}[]): Record<string, number>;
//# sourceMappingURL=weights.d.ts.map