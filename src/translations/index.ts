import { en } from "./en";
import { es } from "./es";
import { ar } from "./ar";

export type Language = "en" | "es" | "ar";

export const translations = {
  en,
  es,
  ar,
};

export const languageNames: Record<Language, string> = {
  en: "English",
  es: "Español",
  ar: "العربية",
};

export const isRTL = (lang: Language): boolean => {
  return lang === "ar";
};
