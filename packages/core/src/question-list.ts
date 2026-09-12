import { findProjectRoot } from "./project-root.js";
import { loadQuestions, type LoadWarning } from "./loaders.js";
import type { Question } from "./schemas.js";

export interface ListQuestionsOptions {
  startDir: string;
  skill?: string;
}

export interface ListQuestionsRun {
  projectRoot: string;
  questions: Question[];
  warnings: LoadWarning[];
  skill?: string;
}

/**
 * List library questions, optionally filtered by skill id.
 */
export function listQuestions(options: ListQuestionsOptions): ListQuestionsRun {
  const projectRoot = findProjectRoot(options.startDir);
  const { questions: all, warnings } = loadQuestions(projectRoot);
  const skill = options.skill?.trim();
  const questions = skill
    ? all.filter((q) => q.skill === skill)
    : all;

  return {
    projectRoot,
    questions,
    warnings,
    skill: skill || undefined,
  };
}
