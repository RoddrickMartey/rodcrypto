import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { detectLocale } from "@/lib/locale"
import { createFormatters, type Formatters, type UnitsSetting } from "@/lib/format"

const KEY = "rodglobe:prefs"

type Stored = { locale: string; units: UnitsSetting } // locale "auto" = follow browser

type Ctx = {
  localeSetting: string
  setLocaleSetting: (v: string) => void
  unitsSetting: UnitsSetting
  setUnitsSetting: (v: UnitsSetting) => void
  detected: string
  locale: string
  fmt: Formatters
}

const PreferencesContext = createContext<Ctx | null>(null)

function load(): Stored {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Stored
  } catch { /* storage unavailable */ }
  return { locale: "auto", units: "auto" }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Stored>(load)
  const detected = useMemo(() => detectLocale(), [])
  const locale = prefs.locale === "auto" ? detected : prefs.locale
  const fmt = useMemo(() => createFormatters(locale, prefs.units), [locale, prefs.units])

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)) } catch { /* ignore */ }
  }, [prefs])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value: Ctx = {
    localeSetting: prefs.locale,
    setLocaleSetting: (v) => setPrefs((p) => ({ ...p, locale: v })),
    unitsSetting: prefs.units,
    setUnitsSetting: (v) => setPrefs((p) => ({ ...p, units: v })),
    detected,
    locale,
    fmt,
  }

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error("usePreferences must be used inside PreferencesProvider")
  return ctx
}