/**
 * Command-line argument parsing for the SDM MCP stdio entry.
 * Kept in its own module so tests can cover it without starting the transport.
 */
export interface McpEntryArgs {
  /** Explicit default methodology project (SDM_PROJECT_ROOT). */
  project?: string;
}

export function parseArgs(argv: string[]): McpEntryArgs {
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--project" || a === "-p") {
      const v = argv[i + 1]?.trim();
      if (v) return { project: v };
    }
    if (a?.startsWith("--project=")) {
      const v = a.slice("--project=".length).trim();
      if (v) return { project: v };
    }
  }
  return {};
}