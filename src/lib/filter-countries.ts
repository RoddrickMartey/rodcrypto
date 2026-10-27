import type { Country } from "@/api/types"

export type SortKey =
  | "name-asc"
  | "name-desc"
  | "population-desc"
  | "population-asc"
  | "area-desc"
  | "area-asc"

export const DEFAULT_SORT: SortKey = "name-asc"

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "population-desc", label: "Population (high to low)" },
  { value: "population-asc", label: "Population (low to high)" },
  { value: "area-desc", label: "Area (largest first)" },
  { value: "area-asc", label: "Area (smallest first)" },
]

export function parseSort(value: string | null): SortKey {
  return SORT_OPTIONS.some((o) => o.value === value)
    ? (value as SortKey)
    : DEFAULT_SORT
}

// "Côte d'Ivoire" -> "cote d'ivoire", so typing "cote" finds it
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()

export type IndexedCountry = { country: Country; haystack: string }

// Built once per data load, not on every keystroke
export function buildIndex(countries: Country[]): IndexedCountry[] {
  return countries.map((country) => ({
    country,
    haystack: normalize(
      [
        country.names.common,
        ...(country.capitals ?? []).map((c) => c.name),
      ].join(" | ")
    ),
  }))
}

export function filterAndSort(
  index: IndexedCountry[],
  query: string,
  sort: SortKey,
  locale: string
): Country[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  const matched = terms.length
    ? index.filter((i) => terms.every((t) => i.haystack.includes(t)))
    : index

  const collator = new Intl.Collator(locale)
  const byName = (a: Country, b: Country) =>
    collator.compare(a.names.common, b.names.common)
  const [field, dir] = sort.split("-") as [
    "name" | "population" | "area",
    "asc" | "desc",
  ]
  const sign = dir === "asc" ? 1 : -1

  return matched
    .map((i) => i.country)
    .sort((a, b) => {
      if (field === "name") return sign * byName(a, b)
      const av = field === "population" ? a.population : a.area.kilometers
      const bv = field === "population" ? b.population : b.area.kilometers
      return av === bv ? byName(a, b) : sign * (av - bv) // ties fall back to name
    })
}
