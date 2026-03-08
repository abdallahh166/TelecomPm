import enUS from "./en-US.json";
import arEG from "./ar-EG.json";

export type Locale = "en-US" | "ar-EG";

const STORAGE_KEY = "towerops.lang";

const messages: Record<Locale, Record<string, string>> = {
  "en-US": enUS as Record<string, string>,
  "ar-EG": arEG as Record<string, string>,
};

let currentLocale: Locale = "en-US";

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en-US";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "ar-EG" || stored === "en-US") return stored;
  return "en-US";
}

export function setStoredLocale(locale: Locale): void {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar-EG" ? "rtl" : "ltr";
  }
}

export function t(key: string): string {
  const localeMessages = messages[currentLocale];
  return localeMessages[key] ?? messages["en-US"]?.[key] ?? key;
}

export function getCurrentLocale(): Locale {
  return currentLocale;
}

export function isRtl(): boolean {
  return currentLocale === "ar-EG";
}

export function initI18n(): void {
  currentLocale = getStoredLocale();
  if (typeof document !== "undefined") {
    document.documentElement.lang = currentLocale;
    document.documentElement.dir = currentLocale === "ar-EG" ? "rtl" : "ltr";
  }
}
