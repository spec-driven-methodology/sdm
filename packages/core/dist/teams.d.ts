import { z } from "zod";
import { type Level } from "./schemas.js";
export declare const TeamSchema: z.ZodObject<{
    id: z.ZodString;
    profile: z.ZodString;
    title: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    /** Per-level full requirement replacement when present. */
    level_overrides: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        requirements: z.ZodArray<z.ZodObject<{
            skill: z.ZodString;
            depth: z.ZodNumber;
            weight: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            skill: string;
            depth: number;
            weight: number;
        }, {
            skill: string;
            depth: number;
            weight: number;
        }>, "many">;
        threshold: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        requirements: {
            skill: string;
            depth: number;
            weight: number;
        }[];
        threshold?: number | undefined;
    }, {
        requirements: {
            skill: string;
            depth: number;
            weight: number;
        }[];
        threshold?: number | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    profile: string;
    title: string;
    level_overrides: Record<string, {
        requirements: {
            skill: string;
            depth: number;
            weight: number;
        }[];
        threshold?: number | undefined;
    }>;
}, {
    id: string;
    profile: string;
    title: string;
    description?: string | undefined;
    level_overrides?: Record<string, {
        requirements: {
            skill: string;
            depth: number;
            weight: number;
        }[];
        threshold?: number | undefined;
    }> | undefined;
}>;
export type Team = z.infer<typeof TeamSchema>;
export declare function teamFilePath(projectRoot: string, teamId: string): string;
export declare function loadTeam(projectRoot: string, teamId: string): Team;
/**
 * Resolve effective level for a profile, applying optional team overrides.
 */
export declare function resolveLevelForTeam(projectRoot: string, profileId: string, levelId: string, teamId?: string): {
    level: Level;
    team?: Team;
};
//# sourceMappingURL=teams.d.ts.map