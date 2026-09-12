import { existsSync } from "node:fs";
import {
  createCertification,
  type CreateCertificationInput,
} from "../../src/cert-write.js";
import { profilePath } from "../../src/loaders.js";
import { createProfile } from "../../src/profile-write.js";

/** Create a profile YAML before cert create in tests. */
export function seedProfile(
  root: string,
  profile = "platform-engineer",
  title = "Platform Engineer",
): void {
  if (existsSync(profilePath(root, profile))) {
    return;
  }
  createProfile(root, { profile, title });
}

/** Create profile (if needed) then certification level — default test helper. */
export function seedCertification(
  root: string,
  input: CreateCertificationInput & { profileTitle?: string },
) {
  const { profileTitle, ...certInput } = input;
  seedProfile(root, input.profile, profileTitle ?? input.profile);
  return createCertification(root, certInput);
}
