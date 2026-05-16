"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  getDictionary,
  LOCALE_STORAGE_KEY,
  localeDir,
  type Dictionary,
  type Locale,
} from "@/i18n"

type LanguageContextValue = {
  locale: Locale
  dir: "rtl" | "ltr"
  dictionary: Dictionary
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "he"
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  return stored === "en" ? "en" : "he"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("he")
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLocaleState(readStoredLocale())
    setHydrated(true)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(LOCALE_STORAGE_KEY, next)
  }, [])

  const dir = localeDir(locale)
  const dictionary = useMemo(() => getDictionary(locale), [locale])

  useEffect(() => {
    if (!hydrated) return
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [locale, dir, hydrated])

  const value = useMemo(
    () => ({ locale, dir, dictionary, setLocale }),
    [locale, dir, dictionary, setLocale]
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return ctx
}

/** מילון תרגומים + locale נוכחי */
export function useTranslation() {
  const { dictionary, locale, dir, setLocale } = useLanguage()
  return { t: dictionary, locale, dir, setLocale }
}
