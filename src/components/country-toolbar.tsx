import { useEffect, useRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { SORT_OPTIONS, type SortKey } from "@/lib/filter-countries"

type Props = {
  input: string
  onInput: (value: string) => void
  onClear: () => void
  sort: SortKey
  onSort: (value: SortKey) => void
}

export function CountryToolbar({
  input,
  onInput,
  onClear,
  sort,
  onSort,
}: Props) {
  const ref = useRef<HTMLInputElement>(null)

  // Press "/" anywhere to jump to search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (
        e.key === "/" &&
        tag !== "INPUT" &&
        tag !== "SELECT" &&
        tag !== "TEXTAREA"
      ) {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-60 flex-1">
        <HugeiconsIcon
          icon={Search01Icon}
          size={18}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={ref}
          type="text"
          inputMode="search"
          autoComplete="off"
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && onClear()}
          placeholder="Search by country or capital (press /)"
          aria-label="Search countries"
          className="h-10 w-full border bg-transparent pr-10 pl-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {input && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        )}
      </div>

      <select
        value={sort}
        onChange={(e) => onSort(e.target.value as SortKey)}
        aria-label="Sort countries"
        className="h-10 border bg-transparent px-3 text-sm hover:bg-muted"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
