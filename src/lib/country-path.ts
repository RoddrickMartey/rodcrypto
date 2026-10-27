import type { Country } from "@/api/types"

// Prefer the ISO codes; fall back to the common name for entries without one
export const countryId = (c: Country) =>
  c.codes.alpha_3 || c.codes.alpha_2 || c.names.common

export const countryPath = (c: Country) =>
  `/country/${encodeURIComponent(countryId(c))}`
