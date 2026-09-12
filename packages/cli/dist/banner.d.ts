/**
 * Human-facing SDM wordmark (figlet standard). Not used on --json paths.
 */
export declare const SDM_ASCII: string;
export declare const SDM_TAGLINE = "Methodology-as-Specs Framework";
/**
 * Logo + blank + tagline + blank + body + trailing blank.
 * Used by `--version` (body = framework/mcp lines).
 */
export declare function withSdmBanner(body: string): string;
/**
 * Help preamble: banner only on interactive TTY so piped/`--help` in scripts stay clean.
 */
export declare function helpBannerText(): string;
//# sourceMappingURL=banner.d.ts.map