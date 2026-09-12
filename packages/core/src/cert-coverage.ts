import {
  assertProfileLevelMatch,
  loadQuestions,
  loadProfile,
  type LoadWarning,
} from "./loaders.js";
import { computeCoverage, type CoverageResult } from "./coverage.js";
import { findProjectRoot } from "./project-root.js";
import { loadQualityConfig } from "./quality-config.js";
import { loadAllSkills } from "./skills.js";
import { resolveLevelForTeam } from "./teams.js";

export interface CertCoverageOptions {
  startDir: string;
  profile: string;
  level: string;
  team?: string;
}

export interface CertCoverageRun {
  projectRoot: string;
  result: CoverageResult;
  warnings: LoadWarning[];
  team?: string;
}

/**
 * End-to-end coverage for a methodology project (used by CLI).
 */
export function runCertCoverage(options: CertCoverageOptions): CertCoverageRun {
  const projectRoot = findProjectRoot(options.startDir);
  const profile = loadProfile(projectRoot, options.profile);
  const { level } = resolveLevelForTeam(
    projectRoot,
    options.profile,
    options.level,
    options.team,
  );
  assertProfileLevelMatch(profile, level, options.profile);

  const { questions, warnings } = loadQuestions(projectRoot);
  const skillsById = new Map(loadAllSkills(projectRoot).map((s) => [s.id, s] as const));
  const quality = loadQualityConfig(projectRoot);
  const result = computeCoverage(level, questions, {
    profile: options.profile,
    skillsById,
    quality,
  });

  return { projectRoot, result, warnings, team: options.team };
}
