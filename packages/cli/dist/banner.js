/**
 * Human-facing SDM wordmark (figlet standard). Not used on --json paths.
 */
export const SDM_ASCII = `
 ____   ____   __  __
/ ___| |  _ \\ |  \\/  |
\\___ \\ | | | || |\\/| |
 ___) || |_| || |  | |
|____/ |____/ |_|  |_|
`.replace(/^\n/, "").trimEnd();
export const SDM_TAGLINE = "Spec-Driven Methodology";
/**
 * Logo + blank + tagline + blank + body + trailing blank.
 * Used by `--version` (body = core/mcp lines).
 */
export function withSdmBanner(body) {
    return `${SDM_ASCII}\n\n${SDM_TAGLINE}\n\n${body}\n`;
}
/**
 * Help preamble: banner only on interactive TTY so piped/`--help` in scripts stay clean.
 */
export function helpBannerText() {
    return process.stdout.isTTY
        ? `${SDM_ASCII}\n\n${SDM_TAGLINE}\n\n`
        : "";
}
//# sourceMappingURL=banner.js.map