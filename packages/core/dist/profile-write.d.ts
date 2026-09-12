import { type Profile } from "./schemas.js";
export interface CreateProfileInput {
    profile: string;
    title: string;
    force?: boolean;
}
export interface CreateProfileResult {
    profile: Profile;
    path: string;
    action: "create";
}
/**
 * Create a profile YAML with empty levels[].
 */
export declare function createProfile(projectRoot: string, input: CreateProfileInput): CreateProfileResult;
//# sourceMappingURL=profile-write.d.ts.map