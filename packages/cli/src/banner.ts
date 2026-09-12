/**
 * Human-facing SDM wordmark (figlet standard). Not used on --json paths.
 */
export const SDM_ASCII = `
  ____
 / ___| _ __   ___  ___ _ __ __ _
 \\___ \\| '_ \\ / _ \\/ __| '__/ _\` |
  ___) | |_) |  __/ (__| | | (_| |
 |____/| .__/ \\___|\\___|_|  \\__,_|
       |_|
`.replace(/^\n/, "").trimEnd();

export const SDM_TAGLINE = "Methodology-as-Specs Framework";

/**
 * Logo + blank + tagline + blank + body + trailing blank.
 * Used by `--version` (body = framework/mcp lines).
 */
export function withSdmBanner(body: string): string {
  return `${SDM_ASCII}\n\n${SDM_TAGLINE}\n\n${body}\n`;
}

/**
 * Help preamble: banner only on interactive TTY so piped/`--help` in scripts stay clean.
 */
export function helpBannerText(): string {
  return process.stdout.isTTY
    ? `${SDM_ASCII}\n\n${SDM_TAGLINE}\n\n`
    : "";
}