import { findProjectRoot } from "./project-root.js";
import { loadTerms, type LoadWarning } from "./loaders.js";
import type { Term } from "./schemas.js";

export interface ListTermsOptions {
  startDir: string;
  skill?: string;
}

export interface ListTermsRun {
  projectRoot: string;
  terms: Term[];
  warnings: LoadWarning[];
  skill?: string;
}

export function listTerms(options: ListTermsOptions): ListTermsRun {
  const projectRoot = findProjectRoot(options.startDir);
  const { terms: all, warnings } = loadTerms(projectRoot);
  const skill = options.skill?.trim();
  const terms = skill
    ? all.filter(
        (t) => t.skills.length === 0 || t.skills.includes(skill),
      )
    : all;

  return {
    projectRoot,
    terms,
    warnings,
    skill: skill || undefined,
  };
}
