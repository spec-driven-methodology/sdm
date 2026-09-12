import { type LoadWarning } from "../loaders.js";
import type { Level, Question } from "../schemas.js";
import type { CourseFormat, CourseScopeMeta, ExportCourseOptions } from "./types.js";
export interface ResolvedScope {
    skillIds: string[];
    profile?: string;
    level?: Level;
    requirementsBySkill: Map<string, {
        depth: number;
        weight: number;
    }>;
    forcedQuestionIds?: Set<string>;
    scopeMeta: CourseScopeMeta;
    loadWarnings: LoadWarning[];
}
export declare function resolveScope(projectRoot: string, options: ExportCourseOptions, allQuestions: Question[]): ResolvedScope;
export declare function loadSkillIdsWithTopic(projectRoot: string, topic: string): string[];
export declare function shouldIncludeOverviewModule(format: CourseFormat, scope: CourseScopeMeta): boolean;
//# sourceMappingURL=scopes.d.ts.map