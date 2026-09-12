export declare const PROJECT_MANIFEST = "sdm.yaml";
/**
 * Walk upward from startDir until a directory containing sdm.yaml is found.
 */
export declare function findProjectRoot(startDir: string): string;
/**
 * Resolve (find or locate) a methodology project from a given start path.
 * Returns the project root and a friendly name. Does not throw — returns null
 * when the path is outside a SDM project.
 */
export declare function locateProject(startDir: string): {
    root: string;
    name: string;
} | null;
/**
 * Recursively search for sdm.yaml files under a given workspace directory
 * (one level deep by default). Returns project roots and names.
 */
export declare function listMethodologyProjects(workspaceDir: string, maxDepth?: number): {
    root: string;
    name: string;
}[];
//# sourceMappingURL=project-root.d.ts.map