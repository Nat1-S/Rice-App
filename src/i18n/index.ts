import { en } from "./dictionaries/en"
import { he } from "./dictionaries/he"
import type { Dictionary, Locale } from "./types"

export type { Dictionary, Locale, ScoreTierKey } from "./types"

const dictionaries: Record<Locale, Dictionary> = { he, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export const LOCALE_STORAGE_KEY = "priority-master-locale"

export function localeDir(locale: Locale): "rtl" | "ltr" {
  return locale === "he" ? "rtl" : "ltr"
}
