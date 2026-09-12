import { SdmError } from "../errors.js";
import type { CourseWarning } from "./types.js";
export type CourseGateMode = "off" | "soft" | "strict";
/**
 * Codes that become blocking errors under `courseGate: strict`.
 * Others remain warnings. Includes readiness (thin/empty), coverage
 * (uncovered topics), structure (isolated skill), and quality (truncated
 * lessons, tautological glossary).
 */
export declare const COURSE_GATE_ERROR_CODES: Set<string>;
export interface CourseGateBlockedError extends SdmError {
    code: "COURSE_GATE_BLOCKED";
    /** Machine-readable warning details for the agent/auto-heal loop. */
    details: Array<{
        code: string;
        skill?: string;
        topic?: string;
        message: string;
    }>;
}
/**
 * Apply the course readiness gate based on quality config.
 *
 * - `strictContext` CLI flag: fail when depth=detailed and critical warnings exist
 *   (thin description / empty topics) — legacy PoC path.
 * - `courseGate` in sdm.yaml quality section extends the same concept to
 *   all COURSE_GATE_ERROR_CODES, regardless of depth.
 *
 * When the gate fires, the export is rejected with a SdmError carrying
 * machine-readable `details` so the agent/author can auto-heal (course heal).
 */
export declare function assertCourseContextReady(input: {
    projectRoot: string;
    strictContext: boolean;
    depth: string;
    warnings: CourseWarning[];
}): void;
//# sourceMappingURL=course-gate.d.ts.map