#!/usr/bin/env node
/**
 * SDM MCP server entry (stdio).
 * Tool registration lives in server.ts — importing that module does not start transport.
 *
 * Usage:
 *   node dist/index.js                          ← multi-project (project per tool call)
 *   node dist/index.js --project /path/to/proj  ← single-project default
 *   # or env SDM_PROJECT_ROOT=/path/to/proj
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { parseArgs } from "./args.js";

async function main(): Promise<void> {
  const { project } = parseArgs(process.argv.slice(2));
  if (project) {
    process.env.SDM_PROJECT_ROOT = project;
  }
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("sdm MCP server running on stdio");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});