import { useNavigate } from "react-router-dom"
import type { Country } from "@/api/types"
import { usePreferences } from "@/context/preferences"

export function CountryCard({ country }: { country: Country }) {
  const navigate = useNavigate()
  const { fmt } = usePreferences()
  const capitals = country.capitals ?? []
  const capital = capitals.find((c) => c.attributes?.primary) ?? capitals[0]
  const code = country.codes.alpha_3

  return (
    <button
      type="button"
      disabled={!code}
      onClick={() => code && navigate(`/country/${code}`)}
      style={{ borderTopColor: country.flag.colors?.dominant }}
      className="flex flex-col overflow-hidden border border-t-4 bg-card text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      <div className="flex h-44 items-center justify-center bg-muted/40 p-3">
        {country.flag.url_svg ? (
          <img
            src={country.flag.url_svg}
            alt={`Flag of ${country.names.common}`}
            loading="lazy"
            className="h-full w-full object-contain drop-shadow-md"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <span
              role="img"
              aria-label={`Flag of ${country.names.common}`}
              className="text-6xl"
            >
              {country.flag.emoji || "🏳️"}
            </span>
            <span className="text-xs text-muted-foreground">
              Flag image unavailable
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <div>
          <p className="leading-tight font-medium">{country.names.common}</p>
          <p className="text-sm text-muted-foreground">{country.region}</p>
          {!country.codes.alpha_3 && (
            <span
              title="This entry has no ISO country code in the API data, so some details may be missing."
              className="mt-1.5 inline-block border px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              Limited data
            </span>
          )}
        </div>

        <dl className="space-y-1 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Capital</dt>
            <dd className="truncate">{capital?.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Population</dt>
            <dd>{fmt.number(country.population)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Area</dt>
            <dd>{fmt.area(country.area.kilometers)}</dd>
          </div>
        </dl>
      </div>
    </button>
  )
}
