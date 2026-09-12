/**
 * Resolve human-facing locale: explicit > SDM_LOCALE > default `ru`.
 */
export function resolveLocale(explicit) {
    const raw = (explicit ?? process.env.SDM_LOCALE ?? "ru").trim().toLowerCase();
    if (raw === "en" || raw.startsWith("en-"))
        return "en";
    return "ru";
}
//# sourceMappingURL=locale.js.map