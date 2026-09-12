import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initMethodologyProject } from "../../src/init.js";

/**
 * Run `fn` against a fresh methodology project in OS temp.
 * Synthetic only — never uses workspace playground paths.
 */
export async function withTempProject<T>(
  fn: (projectRoot: string) => T | Promise<T>,
): Promise<T> {
  const projectRoot = mkdtempSync(join(tmpdir(), "sdm-core-"));
  try {
    initMethodologyProject({
      targetDir: projectRoot,
      name: "test-methodology",
      withExamples: false,
    });
    return await fn(projectRoot);
  } finally {
    rmSync(projectRoot, { recursive: true, force: true });
  }
}
