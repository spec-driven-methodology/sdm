import { z } from "zod";
import { SdmError } from "./errors.js";
/** Presets for question draft type diversity. */
export const TypeMixPresetSchema = z.enum(["single", "mixed", "full"]);
/**
 * Auto-checkable types assigned by `mixed` / `full` today.
 * Deferred (not assigned): matching, sorting, dropdown_answer, code auto-check.
 */
export const ACTIVE_MIX_TYPES = [
    "single_choice",
    "multi_choice",
    "open",
];
export function parseTypeMixPreset(raw) {
    const parsed = TypeMixPresetSchema.safeParse(raw);
    if (!parsed.success) {
        throw new SdmError("TYPE_MIX_INVALID", `Invalid type mix "${raw}". Use single | mixed | full.`);
    }
    return parsed.data;
}
/** Ordered active types for a preset (`full` matches `mixed` until deferred types join). */
export function activeTypesForMix(preset) {
    if (preset === "single") {
        return ["single_choice"];
    }
    return [...ACTIVE_MIX_TYPES];
}
/**
 * Deterministic per-draft type assignment: `active[i % len]`.
 */
export function assignTypesForMix(preset, count) {
    if (!Number.isInteger(count) || count < 1) {
        throw new SdmError("VALIDATION_FAILED", "count must be a positive integer for type-mix assignment");
    }
    const active = activeTypesForMix(preset);
    return Array.from({ length: count }, (_, i) => active[i % active.length]);
}
/** Homogeneous `--type` and `--mix` must not be combined. */
export function assertTypeAndMixExclusive(type, mix) {
    if (type !== undefined && mix !== undefined) {
        throw new SdmError("TYPE_MIX_CONFLICT", "Pass either --type (homogeneous) or --mix (preset), not both.");
    }
}
//# sourceMappingURL=question-type-mix.js.map