import { existsSync } from "node:fs";
import { ZodError } from "zod";
import { SdmError } from "./errors.js";
import { profilePath } from "./loaders.js";
import { ProfileSchema, type Profile } from "./schemas.js";
import { readYamlFile, writeYamlFile } from "./yaml.js";

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

function parseProfile(payload: unknown): Profile {
  try {
    return ProfileSchema.parse(payload);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new SdmError(
        "VALIDATION_FAILED",
        err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
      );
    }
    throw err;
  }
}

/**
 * Create a profile YAML with empty levels[].
 */
export function createProfile(
  projectRoot: string,
  input: CreateProfileInput,
): CreateProfileResult {
  const profileId = input.profile.trim();
  const title = input.title.trim();
  if (!profileId || !title) {
    throw new SdmError("VALIDATION_FAILED", "Profile id and title must not be empty");
  }

  const pPath = profilePath(projectRoot, profileId);
  if (existsSync(pPath) && !input.force) {
    throw new SdmError(
      "PROFILE_EXISTS",
      `Profile file already exists: ${pPath}. Use --force to overwrite.`,
    );
  }

  let levels: string[] = [];
  if (existsSync(pPath) && input.force) {
    try {
      const existing = parseProfile(readYamlFile(pPath));
      levels = existing.levels;
    } catch {
      levels = [];
    }
  }

  const profile = parseProfile({
    profile: profileId,
    title,
    levels,
  });

  writeYamlFile(pPath, profile);

  return { profile, path: pPath, action: "create" };
}
