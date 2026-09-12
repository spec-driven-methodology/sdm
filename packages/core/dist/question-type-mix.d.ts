import { z } from "zod";
import type { Question } from "./schemas.js";
/** Presets for question draft type diversity. */
export declare const TypeMixPresetSchema: z.ZodEnum<["single", "mixed", "full"]>;
export type TypeMixPreset = z.infer<typeof TypeMixPresetSchema>;
/**
 * Auto-checkable types assigned by `mixed` / `full` today.
 * Deferred (not assigned): matching, sorting, dropdown_answer, code auto-check.
 */
export declare const ACTIVE_MIX_TYPES: readonly Question["type"][];
export declare function parseTypeMixPreset(raw: string): TypeMixPreset;
/** Ordered active types for a preset (`full` matches `mixed` until deferred types join). */
export declare function activeTypesForMix(preset: TypeMixPreset): Question["type"][];
/**
 * Deterministic per-draft type assignment: `active[i % len]`.
 */
export declare function assignTypesForMix(preset: TypeMixPreset, count: number): Question["type"][];
/** Homogeneous `--type` and `--mix` must not be combined. */
export declare function assertTypeAndMixExclusive(type: string | undefined, mix: string | undefined): void;
//# sourceMappingURL=question-type-mix.d.ts.map