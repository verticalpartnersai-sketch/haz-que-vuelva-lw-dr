export type Locale = "es" | "pt" | "en";

export const localeCookieName = "hqv_locale";

export function isLocale(value: string | undefined): value is Locale {
  return value === "es" || value === "pt" || value === "en";
}

export function htmlLanguage(locale: Locale) {
  return locale === "pt" ? "pt-BR" : locale;
}
