export type SdmLocale = "ru" | "en";

/**
 * Resolve human-facing locale: explicit > SDM_LOCALE > default `ru`.
 */
export function resolveLocale(explicit?: string | null): SdmLocale {
  const raw = (explicit ?? process.env.SDM_LOCALE ?? "ru").trim().toLowerCase();
  if (raw === "en" || raw.startsWith("en-")) return "en";
  return "ru";
}
