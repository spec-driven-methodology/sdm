import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { ZodError } from "zod";
import { SdmError } from "./errors.js";
import {
  LevelSchema,
  ProfileSchema,
  QuestionSchema,
  TermSchema,
  type Level,
  type Profile,
  type Question,
  type Term,
} from "./schemas.js";
import { readYamlFile } from "./yaml.js";

export interface LoadWarning {
  path: string;
  message: string;
}

function listYamlFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }

  const results: string[] = [];

  function walk(current: string): void {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        walk(full);
      } else if (entry.endsWith(".yaml") || entry.endsWith(".yml")) {
        results.push(full);
      }
    }
  }

  walk(dir);
  return results;
}

function normalizeLevelRaw(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) return raw;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.role === "string" && obj.profile === undefined) {
    const { role, ...rest } = obj;
    return { ...rest, profile: role };
  }
  return raw;
}

function normalizeProfileRaw(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) return raw;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.role === "string" && obj.profile === undefined) {
    const { role, ...rest } = obj;
    return { ...rest, profile: role };
  }
  return raw;
}

/** Parse level YAML with legacy `role:` → `profile:` normalization. */
export function parseLevelDocument(raw: unknown): Level {
  try {
    return LevelSchema.parse(normalizeLevelRaw(raw));
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

/** Parse profile YAML with legacy `role:` → `profile:` normalization. */
export function parseProfileDocument(raw: unknown): Profile {
  try {
    return ProfileSchema.parse(normalizeProfileRaw(raw));
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

export function profilePath(projectRoot: string, profileId: string): string {
  return join(projectRoot, "certifications", "profiles", `${profileId}.yaml`);
}

export function legacyProfilePath(projectRoot: string, profileId: string): string {
  return join(projectRoot, "certifications", "roles", `${profileId}.yaml`);
}

export function loadLevel(projectRoot: string, levelId: string): Level {
  const preferred = join(projectRoot, "certifications", "levels", `${levelId}.yaml`);
  if (existsSync(preferred)) {
    return parseLevelDocument(readYamlFile(preferred));
  }

  const levelsDir = join(projectRoot, "certifications", "levels");
  for (const file of listYamlFiles(levelsDir)) {
    try {
      const parsed = parseLevelDocument(readYamlFile(file));
      if (parsed.level === levelId) {
        return parsed;
      }
    } catch {
      // continue scanning
    }
  }

  throw new SdmError(
    "LEVEL_NOT_FOUND",
    `Level "${levelId}" not found under certifications/levels/`,
  );
}

export function loadProfile(projectRoot: string, profileId: string): Profile {
  const preferred = profilePath(projectRoot, profileId);
  if (existsSync(preferred)) {
    return parseProfileDocument(readYamlFile(preferred));
  }

  const legacy = legacyProfilePath(projectRoot, profileId);
  if (existsSync(legacy)) {
    return parseProfileDocument(readYamlFile(legacy));
  }

  for (const dir of [
    join(projectRoot, "certifications", "profiles"),
    join(projectRoot, "certifications", "roles"),
  ]) {
    for (const file of listYamlFiles(dir)) {
      try {
        const parsed = parseProfileDocument(readYamlFile(file));
        if (parsed.profile === profileId) {
          return parsed;
        }
      } catch {
        // continue
      }
    }
  }

  throw new SdmError(
    "PROFILE_NOT_FOUND",
    `Profile "${profileId}" not found under certifications/profiles/`,
  );
}

export function loadQuestions(
  projectRoot: string,
): { questions: Question[]; warnings: LoadWarning[] } {
  const questionsDir = join(projectRoot, "library", "questions");
  const questions: Question[] = [];
  const warnings: LoadWarning[] = [];

  for (const file of listYamlFiles(questionsDir)) {
    try {
      const parsed = QuestionSchema.parse(readYamlFile(file));
      questions.push(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      warnings.push({ path: file, message });
    }
  }

  return { questions, warnings };
}

export function loadTerms(
  projectRoot: string,
): { terms: Term[]; warnings: LoadWarning[] } {
  const termsDir = join(projectRoot, "library", "terms");
  const terms: Term[] = [];
  const warnings: LoadWarning[] = [];

  for (const file of listYamlFiles(termsDir)) {
    try {
      const parsed = TermSchema.parse(readYamlFile(file));
      terms.push(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      warnings.push({ path: file, message });
    }
  }

  terms.sort((a, b) => a.id.localeCompare(b.id));
  return { terms, warnings };
}

/**
 * Ensure profile/level pair is consistent for PoC rules from design.md.
 */
export function assertProfileLevelMatch(
  profile: Profile,
  level: Level,
  profileId: string,
): void {
  if (level.profile && level.profile !== profileId) {
    throw new SdmError(
      "PROFILE_LEVEL_MISMATCH",
      `Level "${level.level}" belongs to profile "${level.profile}", not "${profileId}"`,
    );
  }

  if (!profile.levels.includes(level.level)) {
    throw new SdmError(
      "PROFILE_LEVEL_MISMATCH",
      `Profile "${profileId}" does not list level "${level.level}"`,
    );
  }
}

/** True when legacy certifications/roles/ directory exists. */
export function hasLegacyRolesDirectory(projectRoot: string): boolean {
  return existsSync(join(projectRoot, "certifications", "roles"));
}
