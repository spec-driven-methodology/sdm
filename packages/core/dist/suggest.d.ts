import { z } from "zod";
export declare const SuggestLeverSchema: z.ZodObject<{
    phrase: z.ZodString;
    mapsTo: z.ZodString;
    category: z.ZodEnum<["export", "threshold", "volume", "types", "other"]>;
}, "strip", z.ZodTypeAny, {
    category: "threshold" | "types" | "export" | "volume" | "other";
    phrase: string;
    mapsTo: string;
}, {
    category: "threshold" | "types" | "export" | "volume" | "other";
    phrase: string;
    mapsTo: string;
}>;
export declare const SuggestItemSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    why: z.ZodString;
    skill: z.ZodOptional<z.ZodString>;
    commandHint: z.ZodOptional<z.ZodString>;
    requiresConfirm: z.ZodBoolean;
    levers: z.ZodArray<z.ZodObject<{
        phrase: z.ZodString;
        mapsTo: z.ZodString;
        category: z.ZodEnum<["export", "threshold", "volume", "types", "other"]>;
    }, "strip", z.ZodTypeAny, {
        category: "threshold" | "types" | "export" | "volume" | "other";
        phrase: string;
        mapsTo: string;
    }, {
        category: "threshold" | "types" | "export" | "volume" | "other";
        phrase: string;
        mapsTo: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
    why: string;
    requiresConfirm: boolean;
    levers: {
        category: "threshold" | "types" | "export" | "volume" | "other";
        phrase: string;
        mapsTo: string;
    }[];
    skill?: string | undefined;
    commandHint?: string | undefined;
}, {
    id: string;
    label: string;
    why: string;
    requiresConfirm: boolean;
    levers: {
        category: "threshold" | "types" | "export" | "volume" | "other";
        phrase: string;
        mapsTo: string;
    }[];
    skill?: string | undefined;
    commandHint?: string | undefined;
}>;
export declare const SuggestPayloadSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    projectRoot: z.ZodString;
    focus: z.ZodObject<{
        profile: z.ZodOptional<z.ZodString>;
        level: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        level?: string | undefined;
        profile?: string | undefined;
    }, {
        level?: string | undefined;
        profile?: string | undefined;
    }>;
    snapshot: z.ZodObject<{
        hasProfile: z.ZodBoolean;
        hasLevel: z.ZodBoolean;
        questionCount: z.ZodNumber;
        gapSummary: z.ZodOptional<z.ZodObject<{
            missing: z.ZodNumber;
            thin: z.ZodNumber;
            ok: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            ok: number;
            missing: number;
            thin: number;
        }, {
            ok: number;
            missing: number;
            thin: number;
        }>>;
        hasExport: z.ZodBoolean;
        hasPlayer: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        hasProfile: boolean;
        hasLevel: boolean;
        questionCount: number;
        hasExport: boolean;
        hasPlayer: boolean;
        gapSummary?: {
            ok: number;
            missing: number;
            thin: number;
        } | undefined;
    }, {
        hasProfile: boolean;
        hasLevel: boolean;
        questionCount: number;
        hasExport: boolean;
        hasPlayer: boolean;
        gapSummary?: {
            ok: number;
            missing: number;
            thin: number;
        } | undefined;
    }>;
    suggestions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        why: z.ZodString;
        skill: z.ZodOptional<z.ZodString>;
        commandHint: z.ZodOptional<z.ZodString>;
        requiresConfirm: z.ZodBoolean;
        levers: z.ZodArray<z.ZodObject<{
            phrase: z.ZodString;
            mapsTo: z.ZodString;
            category: z.ZodEnum<["export", "threshold", "volume", "types", "other"]>;
        }, "strip", z.ZodTypeAny, {
            category: "threshold" | "types" | "export" | "volume" | "other";
            phrase: string;
            mapsTo: string;
        }, {
            category: "threshold" | "types" | "export" | "volume" | "other";
            phrase: string;
            mapsTo: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        why: string;
        requiresConfirm: boolean;
        levers: {
            category: "threshold" | "types" | "export" | "volume" | "other";
            phrase: string;
            mapsTo: string;
        }[];
        skill?: string | undefined;
        commandHint?: string | undefined;
    }, {
        id: string;
        label: string;
        why: string;
        requiresConfirm: boolean;
        levers: {
            category: "threshold" | "types" | "export" | "volume" | "other";
            phrase: string;
            mapsTo: string;
        }[];
        skill?: string | undefined;
        commandHint?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    ok: true;
    projectRoot: string;
    focus: {
        level?: string | undefined;
        profile?: string | undefined;
    };
    snapshot: {
        hasProfile: boolean;
        hasLevel: boolean;
        questionCount: number;
        hasExport: boolean;
        hasPlayer: boolean;
        gapSummary?: {
            ok: number;
            missing: number;
            thin: number;
        } | undefined;
    };
    suggestions: {
        id: string;
        label: string;
        why: string;
        requiresConfirm: boolean;
        levers: {
            category: "threshold" | "types" | "export" | "volume" | "other";
            phrase: string;
            mapsTo: string;
        }[];
        skill?: string | undefined;
        commandHint?: string | undefined;
    }[];
}, {
    ok: true;
    projectRoot: string;
    focus: {
        level?: string | undefined;
        profile?: string | undefined;
    };
    snapshot: {
        hasProfile: boolean;
        hasLevel: boolean;
        questionCount: number;
        hasExport: boolean;
        hasPlayer: boolean;
        gapSummary?: {
            ok: number;
            missing: number;
            thin: number;
        } | undefined;
    };
    suggestions: {
        id: string;
        label: string;
        why: string;
        requiresConfirm: boolean;
        levers: {
            category: "threshold" | "types" | "export" | "volume" | "other";
            phrase: string;
            mapsTo: string;
        }[];
        skill?: string | undefined;
        commandHint?: string | undefined;
    }[];
}>;
export type SuggestPayload = z.infer<typeof SuggestPayloadSchema>;
export type SuggestItem = z.infer<typeof SuggestItemSchema>;
export type SuggestLever = z.infer<typeof SuggestLeverSchema>;
export type BuildSuggestOptions = {
    startDir: string;
    profile?: string;
    level?: string;
};
/**
 * State → next human actions + Russian levers. Requires methodology project.
 */
export declare function buildSuggest(options: BuildSuggestOptions): SuggestPayload;
/** Short human summary for CLI text mode. */
export declare function formatSuggestText(payload: SuggestPayload): string;
//# sourceMappingURL=suggest.d.ts.map