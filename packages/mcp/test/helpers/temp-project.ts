import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initMethodologyProject } from "@spec-driven-methodology/core";

/**
 * Run `fn` with SDM_PROJECT_ROOT pointing at a fresh temp methodology project.
 */
export async function withTempProject<T>(
  fn: (projectRoot: string) => T | Promise<T>,
): Promise<T> {
  const projectRoot = mkdtempSync(join(tmpdir(), "sdm-mcp-"));
  const prev = process.env.SDM_PROJECT_ROOT;
  try {
    initMethodologyProject({
      targetDir: projectRoot,
      name: "mcp-test-methodology",
      withExamples: false,
    });
    process.env.SDM_PROJECT_ROOT = projectRoot;
    return await fn(projectRoot);
  } finally {
    if (prev === undefined) {
      delete process.env.SDM_PROJECT_ROOT;
    } else {
      process.env.SDM_PROJECT_ROOT = prev;
    }
    rmSync(projectRoot, { recursive: true, force: true });
  }
}
