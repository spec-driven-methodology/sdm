/**
 * Command-line argument parsing for the SDM MCP stdio entry.
 * Kept in its own module so tests can cover it without starting the transport.
 */
export interface McpEntryArgs {
    /** Explicit default methodology project (SDM_PROJECT_ROOT). */
    project?: string;
}
export declare function parseArgs(argv: string[]): McpEntryArgs;
//# sourceMappingURL=args.d.ts.map