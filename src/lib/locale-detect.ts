import { type LangCode, languages } from "@/i18n/translations";

const CODES = new Set(languages.map((l) => l.code));

export function isLangCode(value: string): value is LangCode {
  return CODES.has(value as LangCode);
}

/** BCP 47 para <html lang> y traductores del navegador */
export function langToBcp47(code: LangCode): string {
  switch (code) {
    case "pt":
      return "pt-BR";
    case "zh":
      return "zh-Hans";
    default:
      return code;
  }
}

/**
 * Idioma preferido del visitante según el navegador.
 * Solo códigos soportados por GafCore; si no hay coincidencia → inglés (UI internacional).
 */
export function detectBrowserPreferredLang(): LangCode {
  if (typeof navigator === "undefined") return "en";

  const candidates: string[] = [];
  if (navigator.languages?.length) {
    for (const l of navigator.languages) candidates.push(l);
  }
  if (navigator.language) candidates.push(navigator.language);

  for (const raw of candidates) {
    const normalized = raw.trim().toLowerCase();
    if (!normalized) continue;

    // Coincidencia exacta (p. ej. ya es "en")
    if (isLangCode(normalized)) return normalized;

    // Subetiqueta principal: en-US → en, es-MX → es
    const primary = normalized.split("-")[0];
    if (primary && isLangCode(primary)) return primary;

    // Chino tradicional → zh (único paquete zh en la app)
    if (normalized.startsWith("zh-hant") || normalized === "zh-tw" || normalized === "zh-hk") {
      return "zh";
    }
  }

  return "en";
}
