import { type Level, type Profile, type Question, type Term } from "./schemas.js";
export interface LoadWarning {
    path: string;
    message: string;
}
/** Parse level YAML with legacy `role:` → `profile:` normalization. */
export declare function parseLevelDocument(raw: unknown): Level;
/** Parse profile YAML with legacy `role:` → `profile:` normalization. */
export declare function parseProfileDocument(raw: unknown): Profile;
export declare function profilePath(projectRoot: string, profileId: string): string;
export declare function legacyProfilePath(projectRoot: string, profileId: string): string;
export declare function loadLevel(projectRoot: string, levelId: string): Level;
export declare function loadProfile(projectRoot: string, profileId: string): Profile;
export declare function loadQuestions(projectRoot: string): {
    questions: Question[];
    warnings: LoadWarning[];
};
export declare function loadTerms(projectRoot: string): {
    terms: Term[];
    warnings: LoadWarning[];
};
/**
 * Ensure profile/level pair is consistent for PoC rules from design.md.
 */
export declare function assertProfileLevelMatch(profile: Profile, level: Level, profileId: string): void;
/** True when legacy certifications/roles/ directory exists. */
export declare function hasLegacyRolesDirectory(projectRoot: string): boolean;
//# sourceMappingURL=loaders.d.ts.map