import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useDebounce } from "@/hooks/use-debounce"
import { DEFAULT_SORT, parseSort, type SortKey } from "@/lib/filter-countries"

export function useCountryFilters() {
  const [params, setParams] = useSearchParams()

  // The input is local so typing is instant; the URL follows after a short pause
  const [input, setInput] = useState(() => params.get("q") ?? "")
  const query = useDebounce(input, 250)
  const sort = parseSort(params.get("sort"))

  useEffect(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (query.trim()) next.set("q", query.trim())
        else next.delete("q")
        return next
      },
      { replace: true } // no history entry per keystroke
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const setSort = (value: SortKey) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === DEFAULT_SORT) next.delete("sort")
        else next.set("sort", value)
        return next
      },
      { replace: true }
    )

  return {
    input,
    setInput,
    query,
    sort,
    setSort,
    clear: () => setInput(""),
    isFiltering: query.trim().length > 0,
  }
}
