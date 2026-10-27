import { api } from "./client"
import type { ApiList, Country, CountryDetail } from "./types"
import { ApiError } from "./errors"

const LIST_FIELDS = [
  "names.common",
  "codes.alpha_2",
  "codes.alpha_3",
  "codes.ccn3",
  "flag.emoji",
  "flag.url_svg",
  "flag.colors.dominant",
  "region",
  "subregion",
  "continents",
  "capitals",
  "population",
  "area",
  "timezones",
  "classification.sovereign",
  "classification.un_member",
].join(",")

const DETAIL_OMIT = [
  "names.translations",
  "leaders",
  "flag.colors.swatches",
  "flag.html_entity",
  "flag.unicode",
  "economy",
  "parent",
].join(",")

const PAGE = 100 // free-plan maximum

// All countries in 3 requests: the first page tells us the total, the rest run in parallel
export async function fetchAllCountries(): Promise<Country[]> {
  const get = (offset: number) =>
    api.get<ApiList<Country>>("/countries/v5", {
      params: { limit: PAGE, offset, response_fields: LIST_FIELDS },
    })

  const first = await get(0)
  const { objects, meta } = first.data.data
  const offsets: number[] = []
  for (let o = PAGE; o < meta.total; o += PAGE) offsets.push(o)

  const rest = await Promise.all(offsets.map(get))
  return [...objects, ...rest.flatMap((r) => r.data.data.objects)]
}

export async function fetchCountry(alpha3: string): Promise<CountryDetail> {
  const res = await api.get<ApiList<CountryDetail>>(
    `/countries/v5/codes.alpha_3/${encodeURIComponent(alpha3)}`,
    { params: { response_fields_omit: DETAIL_OMIT } }
  )
  const country = res.data.data.objects[0]
  if (!country)
    throw new ApiError(`We couldn't find a country matching "${alpha3}".`, 404)
  return country
}
