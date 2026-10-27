export type UnitsSetting = "auto" | "metric" | "imperial"

const IMPERIAL_REGIONS = ["US", "LR", "MM"]

export function resolveUnits(locale: string, setting: UnitsSetting): "metric" | "imperial" {
  if (setting !== "auto") return setting
  try {
    const region = new Intl.Locale(locale).maximize().region
    return region && IMPERIAL_REGIONS.includes(region) ? "imperial" : "metric"
  } catch {
    return "metric"
  }
}

// The API gives timezones like "UTC+05:30" or "UTC-03:30"
function offsetMinutes(tz: string): number {
  const m = tz.match(/^UTC([+-])(\d{2}):(\d{2})$/)
  if (!m) return 0
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]))
}

export function createFormatters(locale: string, setting: UnitsSetting) {
  const units = resolveUnits(locale, setting)
  const num = new Intl.NumberFormat(locale)
  const compact = new Intl.NumberFormat(locale, { notation: "compact" })
  const list = new Intl.ListFormat(locale, { style: "long", type: "conjunction" })
  const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 })
  const regions = new Intl.DisplayNames([locale], { type: "region" })

  const dateLong = new Intl.DateTimeFormat(locale, { dateStyle: "long" })
  const dateMedium = new Intl.DateTimeFormat(locale, { dateStyle: "medium" })
  const time = new Intl.DateTimeFormat(locale, { timeStyle: "short", timeZone: "UTC" })
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" })
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  // Shift "now" by a country's UTC offset, then format it as UTC
  const shifted = (tz: string) => new Date(Date.now() + offsetMinutes(tz) * 60_000)

  return {
    units,
    number: (n: number) => num.format(n),
    compact: (n: number) => compact.format(n),
    percent: (n: number) => percent.format(n),
    list: (items: string[]) => list.format(items),
    regionName: (code: string) => regions.of(code) ?? code,
    area: (km2: number) =>
      units === "imperial"
        ? `${num.format(Math.round(km2 * 0.386102))} mi²`
        : `${num.format(Math.round(km2))} km²`,

    // Dates and time
    date: (d: Date | string | number) => dateLong.format(new Date(d)),
    dateShort: (d: Date | string | number) => dateMedium.format(new Date(d)),
    timeIn: (tz: string) => time.format(shifted(tz)),
    weekdayIn: (tz: string) => weekday.format(shifted(tz)),
    ago: (d: Date | string | number) => {
      const mins = Math.round((new Date(d).getTime() - Date.now()) / 60_000)
      if (Math.abs(mins) < 60) return relative.format(mins, "minute")
      if (Math.abs(mins) < 1440) return relative.format(Math.round(mins / 60), "hour")
      return relative.format(Math.round(mins / 1440), "day")
    },
  }
}

export type Formatters = ReturnType<typeof createFormatters>