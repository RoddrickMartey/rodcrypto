import { useMemo } from "react"
import { CountryCard } from "@/components/country-card"
import { CountryToolbar } from "@/components/country-toolbar"
import {
  CardGridSkeleton,
  EmptyState,
  QueryBoundary,
} from "@/components/states"
import { usePreferences } from "@/context/preferences"
import { useCountries } from "@/hooks/use-countries"
import { useCountryFilters } from "@/hooks/use-country-filters"
import { buildIndex, filterAndSort } from "@/lib/filter-countries"

export function HomePage() {
  const { fmt, locale } = usePreferences()
  const countries = useCountries()
  const filters = useCountryFilters()

  const index = useMemo(
    () => (countries.data ? buildIndex(countries.data) : []),
    [countries.data]
  )
  const results = useMemo(
    () => filterAndSort(index, filters.query, filters.sort, locale),
    [index, filters.query, filters.sort, locale]
  )

  const total = countries.data?.length ?? 0

  return (
    <main className="mx-auto min-h-[calc(100svh-4rem)] max-w-7xl space-y-6 p-6">
      <CountryToolbar
        input={filters.input}
        onInput={filters.setInput}
        onClear={filters.clear}
        sort={filters.sort}
        onSort={filters.setSort}
      />

      <p aria-live="polite" className="text-sm text-muted-foreground">
        {!countries.data
          ? "Loading countries…"
          : filters.isFiltering
            ? `${fmt.number(results.length)} of ${fmt.number(total)} countries`
            : `${fmt.number(total)} countries and territories`}
      </p>

      <QueryBoundary
        query={countries}
        loading={<CardGridSkeleton />}
        isEmpty={() => results.length === 0}
        empty={
          <EmptyState
            title={`No countries match "${filters.query}"`}
            description="Check the spelling, or try a capital city or a shorter name."
            actionLabel="Clear search"
            onAction={filters.clear}
          />
        }
      >
        {() => (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((c) => (
              <CountryCard
                key={c.codes.alpha_3 || c.names.common}
                country={c}
              />
            ))}
          </div>
        )}
      </QueryBoundary>
    </main>
  )
}
