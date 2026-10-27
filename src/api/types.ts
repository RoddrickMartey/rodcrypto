export type Capital = {
  name: string
  coordinates: { lat: number; lng: number }
  attributes: { primary: boolean }
}

// What the card grid and table need (loaded once for all countries)
export type Country = {
  names: { common: string }
  codes: { alpha_2: string; alpha_3: string; ccn3: string }
  flag: { emoji: string; url_svg: string; colors: { dominant: string } }
  region: string
  subregion: string
  continents: string[]
  capitals: Capital[]
  population: number
  area: { kilometers: number; miles: number }
  timezones: string[]
  classification: { sovereign: boolean; un_member: boolean }
}

export type Currency = { code: string; name: string; symbol: string }
export type Language = { bcp47: string; name: string; native_name: string }
export type PaletteColor = { hex: string; proportion: number }

// Full record for the detail page (loaded per country, on demand)
export type CountryDetail = Country & {
  names: Country["names"] & {
    official: string
    alternates: string[]
    native: Record<string, { common: string; official: string }>
  }
  flag: Country["flag"] & {
    url_png: string
    description: string
    colors: {
      dominant: string
      prominent: string
      palette: PaletteColor[]
    }
  }
  descriptions: { short: string; long: string }
  borders: string[]
  calling_codes: string[]
  tlds: string[]
  currencies: Currency[]
  languages: Language[]
  demonyms: Record<string, { m: string; f: string }>
  coordinates: { lat: number; lng: number }
  landlocked: boolean
  government_type: string
  cars: { driving_side: "left" | "right"; signs: string[] }
  date: { start_of_week: string }
  units: { measurement_system: string; temperature_scale: string }
  memberships: Record<string, boolean>
  links: {
    official: string
    wikipedia: string
    google_maps: string
    open_street_maps: string
  }
}

export type ApiMeta = {
  total: number
  count: number
  limit: number
  offset: number
  more: boolean
}
export type ApiList<T> = { data: { objects: T[]; meta: ApiMeta } }
