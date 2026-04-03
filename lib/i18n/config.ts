export const SUPPORTED_LANGUAGES = ["es", "en", "fr", "de"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  es: "Español",
  en: "English",
  fr: "Français",
  de: "Deutsch",
};

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  es: "🇪🇸",
  en: "🇬🇧",
  fr: "🇫🇷",
  de: "🇩🇪",
};

export function getLocalizedText(
  obj: Record<string, string> | null | undefined,
  lang: string,
  fallback = "es"
): string {
  if (!obj) return "";
  return obj[lang] || obj[fallback] || Object.values(obj)[0] || "";
}
