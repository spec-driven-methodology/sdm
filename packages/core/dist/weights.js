import { SdmError } from "./errors.js";
/** Allowed absolute deviation from 1.0 for level weight sums. */
export const WEIGHT_SUM_EPSILON = 1e-6;
/** Decimal places for persisted / normalized shares. */
export const WEIGHT_PRECISION = 6;
export function roundWeight(w) {
    const f = 10 ** WEIGHT_PRECISION;
    return Math.round(w * f) / f;
}
export function sumWeights(weights) {
    let sum = 0;
    for (const w of weights)
        sum += w;
    return sum;
}
export function weightSumIsValid(sum) {
    return Number.isFinite(sum) && Math.abs(sum - 1) <= WEIGHT_SUM_EPSILON;
}
export function assertWeightSum(weights, context) {
    const sum = sumWeights(weights);
    if (!weightSumIsValid(sum)) {
        const suffix = context ? ` (${context})` : "";
        throw new SdmError("WEIGHT_SUM_INVALID", `Requirement weights must sum to 1 within ${WEIGHT_SUM_EPSILON} (got ${sum})${suffix}`);
    }
}
/**
 * Proportionally normalize positive-total weights to shares summing to 1.
 * Returns `normalized: false` when input already satisfied the invariant.
 */
export function normalizeWeights(weights) {
    const sum = sumWeights(weights);
    if (!Number.isFinite(sum) || sum <= 0) {
        throw new SdmError("WEIGHT_SUM_INVALID", "Requirement weights must sum to a positive total to normalize");
    }
    if (weightSumIsValid(sum)) {
        return { weights: [...weights], normalized: false };
    }
    const scaled = weights.map((w) => roundWeight(w / sum));
    const scaledSum = sumWeights(scaled);
    if (!weightSumIsValid(scaledSum) && scaled.length > 0) {
        let lastIdx = scaled.length - 1;
        for (let i = scaled.length - 1; i >= 0; i--) {
            if ((scaled[i] ?? 0) > 0) {
                lastIdx = i;
                break;
            }
        }
        scaled[lastIdx] = roundWeight((scaled[lastIdx] ?? 0) + (1 - scaledSum));
    }
    assertWeightSum(scaled, "after normalize");
    return { weights: scaled, normalized: true };
}
/** Parse `skill:amount` transfer donor triple. */
export function parseWeightTransfer(raw) {
    const idx = raw.lastIndexOf(":");
    if (idx <= 0 || idx === raw.length - 1) {
        throw new SdmError("VALIDATION_FAILED", `Invalid --from "${raw}". Expected skill:amount`);
    }
    const skill = raw.slice(0, idx).trim();
    const amount = Number(raw.slice(idx + 1));
    if (!skill) {
        throw new SdmError("VALIDATION_FAILED", `Invalid --from "${raw}": empty skill id`);
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1) {
        throw new SdmError("VALIDATION_FAILED", `Invalid --from "${raw}": amount must be a number in (0, 1]`);
    }
    return { skill, amount };
}
/** Parse `skill=weight` for cert reweight --set. */
export function parseWeightSet(raw) {
    const idx = raw.indexOf("=");
    if (idx <= 0 || idx === raw.length - 1) {
        throw new SdmError("VALIDATION_FAILED", `Invalid --set "${raw}". Expected skill=weight`);
    }
    const skill = raw.slice(0, idx).trim();
    const weight = Number(raw.slice(idx + 1));
    if (!skill) {
        throw new SdmError("VALIDATION_FAILED", `Invalid --set "${raw}": empty skill id`);
    }
    if (!Number.isFinite(weight) || weight < 0 || weight > 1) {
        throw new SdmError("VALIDATION_FAILED", `Invalid --set "${raw}": weight must be a number in 0..1`);
    }
    return { skill, weight };
}
export function weightMap(requirements) {
    const map = {};
    for (const r of requirements)
        map[r.skill] = r.weight;
    return map;
}
//# sourceMappingURL=weights.js.map