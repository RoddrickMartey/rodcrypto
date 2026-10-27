import { useQuery } from "@tanstack/react-query"
import { fetchAllCountries, fetchCountry } from "@/api/countries"

export const SIX_HOURS = 6 * 60 * 60 * 1000
export const ONE_DAY = 24 * 60 * 60 * 1000

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: fetchAllCountries,
    staleTime: SIX_HOURS, // fresh for 6h: reloads inside this window make no request
    gcTime: ONE_DAY, // must be >= the persister's maxAge
  })
}

export function useCountry(alpha3: string | undefined) {
  return useQuery({
    queryKey: ["country", alpha3?.toUpperCase()],
    queryFn: () => fetchCountry(alpha3!),
    enabled: !!alpha3,
    staleTime: SIX_HOURS,
  })
}
