import { translationsGenerated } from "@/i18n/translations.min.generated";

/**
 * Textos UI mínimos (landing, auth, chat, página GafCore).
 * Cuerpo por idioma: `translations.min.generated.ts` (regenerar: copia del monolito en `src/i18n/translations.monolith.backup.ts` y `node scripts/extract-i18n-minimal.mjs`, o `I18N_MONOLITH_SRC`).
 */
export const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
] as const;

export type LangCode = (typeof languages)[number]["code"];

export const translations = translationsGenerated as Record<
  LangCode,
  Record<string, string>
>;

export function t(key: string, lang: LangCode): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}
