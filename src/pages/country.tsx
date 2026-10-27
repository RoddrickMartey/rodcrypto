import { useEffect, useMemo, type ReactNode } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import type { CountryDetail } from "@/api/types"
import { Button, buttonVariants } from "@/components/ui/button"
import { CountryShape } from "@/components/country-shape"
import { QueryBoundary } from "@/components/states"
import { usePreferences } from "@/context/preferences"
import { useCountries, useCountry } from "@/hooks/use-countries"
import { useTick } from "@/hooks/use-tick"
import { countryPath } from "@/lib/country-path"
import { cn } from "@/lib/utils"
import { flagGradients } from "@/lib/flag-gradient"

const MEMBERSHIP_LABELS: Record<string, string> = {
  un: "United Nations",
  eu: "European Union",
  eurozone: "Eurozone",
  schengen: "Schengen Area",
  nato: "NATO",
  commonwealth: "Commonwealth",
  oecd: "OECD",
  g7: "G7",
  g20: "G20",
  brics: "BRICS",
  opec: "OPEC",
  african_union: "African Union",
  asean: "ASEAN",
  arab_league: "Arab League",
}

const TEMP_SYMBOLS: Record<string, string> = {
  celsius: "°C",
  fahrenheit: "°F",
  kelvin: "K",
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/* ---------- Page ---------- */

export function CountryPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const country = useCountry(code)

  // Go back to the previous page (keeps your search and sort); fall back to home on a direct visit
  const goBack = () =>
    location.key !== "default" ? navigate(-1) : navigate("/")

  return (
    <main className="mx-auto min-h-[calc(100svh-4rem)] max-w-6xl space-y-6 p-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={goBack}
        className="-ml-2 rounded-none"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        Back to all countries
      </Button>

      <QueryBoundary query={country} loading={<DetailSkeleton />}>
        {(c) => <CountryView country={c} />}
      </QueryBoundary>
    </main>
  )
}

/* ---------- Main view ---------- */

function CountryView({ country: c }: { country: CountryDetail }) {
  const { fmt } = usePreferences()
  const navigate = useNavigate()
  const all = useCountries()

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `${c.names.common} · Rod Globe`
    return () => {
      document.title = "Rod Globe"
    }
  }, [c.names.common])

  // alpha_3 -> country, from the cached list, so borders show names instead of codes
  const byCode = useMemo(
    () => new Map((all.data ?? []).map((x) => [x.codes.alpha_3, x])),
    [all.data]
  )

  const capitals = (c.capitals ?? []).map((x) => x.name)
  const imperial = fmt.units === "imperial"
  const density =
    c.area.kilometers > 0
      ? c.population / (imperial ? c.area.miles : c.area.kilometers)
      : null
  const memberships = Object.entries(c.memberships ?? {})
    .filter(([, member]) => member)
    .map(([key]) => MEMBERSHIP_LABELS[key] ?? key)
  const palette = (c.flag.colors?.palette ?? []).filter(
    (p) => p.proportion >= 0.02
  )
  const gradients = flagGradients(
    c.flag.colors?.palette,
    c.flag.colors?.dominant
  )
  const timezones = c.timezones ?? []
  const languages = (c.languages ?? []).map((l) =>
    l.native_name && l.native_name !== l.name
      ? `${l.name} (${l.native_name})`
      : l.name
  )
  const links = [
    { label: "Official website", href: c.links?.official },
    { label: "Wikipedia", href: c.links?.wikipedia },
    { label: "Google Maps", href: c.links?.google_maps },
    { label: "OpenStreetMap", href: c.links?.open_street_maps },
  ].filter((l) => l.href)

  return (
    <>
      {/* Page backdrop: fixed behind everything, tinted by the flag colours */}
      {gradients && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10"
          style={{ backgroundImage: gradients.page }}
        />
      )}

      <div className="space-y-6">
        {/* Hero */}
        <section
          style={{ borderTopColor: c.flag.colors?.dominant }}
          className="grid border border-t-4 bg-card/70 backdrop-blur-sm md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
        >
          <div className="space-y-4 bg-background/20 p-6">
            <div className="flex h-56 items-center justify-center">
              {c.flag.url_svg ? (
                <img
                  src={c.flag.url_svg}
                  alt={c.flag.description || `Flag of ${c.names.common}`}
                  className="h-full w-full object-contain drop-shadow-lg"
                />
              ) : (
                <span
                  role="img"
                  aria-label={`Flag of ${c.names.common}`}
                  className="text-8xl"
                >
                  {c.flag.emoji || "🏳️"}
                </span>
              )}
            </div>
            {palette.length > 0 && (
              <div className="flex h-2 overflow-hidden" aria-hidden="true">
                {palette.map((p) => (
                  <div
                    key={p.hex}
                    style={{ backgroundColor: p.hex, flexGrow: p.proportion }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 p-6">
            <div>
              <h1 className="text-3xl font-semibold">{c.names.common}</h1>
              {c.names.official && c.names.official !== c.names.common && (
                <p className="text-muted-foreground">{c.names.official}</p>
              )}
            </div>

            {c.descriptions?.short && <p>{c.descriptions.short}</p>}

            <div className="flex flex-wrap gap-2">
              <Tag>{c.region}</Tag>
              {c.subregion && <Tag>{c.subregion}</Tag>}
              <Tag>
                {c.classification?.sovereign ? "Sovereign state" : "Territory"}
              </Tag>
              {c.classification?.un_member && <Tag>UN member</Tag>}
              <Tag>{c.landlocked ? "Landlocked" : "Has a coastline"}</Tag>
            </div>

            {c.flag.description && (
              <p className="text-sm text-muted-foreground">
                {c.flag.description}
              </p>
            )}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid gap-6 md:grid-cols-2">
            <Section title="At a glance">
              <dl className="divide-y">
                <Fact
                  label={capitals.length > 1 ? "Capitals" : "Capital"}
                  value={fmt.list(capitals) || undefined}
                />
                <Fact label="Population" value={fmt.number(c.population)} />
                <Fact label="Area" value={fmt.area(c.area.kilometers)} />
                <Fact
                  label="Density"
                  value={
                    density !== null
                      ? `${fmt.number(Number(density.toFixed(1)))} / ${imperial ? "mi²" : "km²"}`
                      : undefined
                  }
                />
                <Fact
                  label="Continents"
                  value={fmt.list(c.continents ?? []) || undefined}
                />
                <Fact
                  label="Government"
                  value={c.government_type || undefined}
                />
              </dl>
            </Section>

            <Section title="People and language">
              <dl className="divide-y">
                <Fact label="Demonym" value={c.demonyms?.eng?.m} />
                <Fact
                  label={languages.length > 1 ? "Languages" : "Language"}
                  value={fmt.list(languages) || undefined}
                />
                <Fact
                  label={
                    (c.currencies ?? []).length > 1 ? "Currencies" : "Currency"
                  }
                  value={
                    (c.currencies ?? []).length > 0 ? (
                      <ul className="space-y-0.5">
                        {c.currencies.map((cur) => (
                          <li key={cur.code}>
                            {cur.name} ({cur.symbol} · {cur.code})
                          </li>
                        ))}
                      </ul>
                    ) : undefined
                  }
                />
                <Fact
                  label="Calling code"
                  value={
                    (c.calling_codes ?? []).map((x) => `+${x}`).join(", ") ||
                    undefined
                  }
                />
                <Fact
                  label="Internet domain"
                  value={(c.tlds ?? []).join(", ") || undefined}
                />
              </dl>
            </Section>

            <Section title="Time and daily life" className="md:col-span-2">
              <div className="grid gap-x-8 md:grid-cols-2">
                <dl className="divide-y">
                  <Fact
                    label="Local time (approx.)"
                    value={
                      timezones.length > 0 ? (
                        <LocalTimes timezones={timezones} />
                      ) : undefined
                    }
                  />
                  <Fact
                    label="Week starts on"
                    value={
                      c.date?.start_of_week
                        ? capitalise(c.date.start_of_week)
                        : undefined
                    }
                  />
                </dl>
                <dl className="divide-y">
                  <Fact
                    label="Drives on the"
                    value={
                      c.cars?.driving_side
                        ? capitalise(c.cars.driving_side)
                        : undefined
                    }
                  />
                  <Fact
                    label="Units"
                    value={
                      c.units?.measurement_system
                        ? [
                            capitalise(c.units.measurement_system),
                            c.units.temperature_scale
                              ? `${c.units.temperature_scale} (${TEMP_SYMBOLS[c.units.temperature_scale.toLowerCase()] ?? "°"})`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")
                        : undefined
                    }
                  />
                </dl>
              </div>
            </Section>

            {c.descriptions?.long && (
              <Section title="About" className="md:col-span-2">
                <p className="text-sm leading-relaxed">{c.descriptions.long}</p>
              </Section>
            )}
          </div>

          <aside className="space-y-6">
            <Section title="Outline">
              {c.codes.ccn3 ? (
                <CountryShape ccn3={c.codes.ccn3} label={c.names.common} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No outline available.
                </p>
              )}
            </Section>

            {links.length > 0 && (
              <Section title="Learn more">
                <div className="flex flex-col gap-2">
                  {links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "justify-between rounded-none"
                      )}
                    >
                      {l.label}
                      <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
                    </a>
                  ))}
                </div>
              </Section>
            )}
          </aside>
        </div>

        <Section title="Neighbours">
          {(c.borders ?? []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {c.borders.map((code) => {
                const neighbour = byCode.get(code)
                return (
                  <Button
                    key={code}
                    variant="outline"
                    size="sm"
                    className="rounded-none"
                    onClick={() =>
                      navigate(
                        neighbour ? countryPath(neighbour) : `/country/${code}`
                      )
                    }
                  >
                    {neighbour?.flag.emoji} {neighbour?.names.common ?? code}
                  </Button>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No land borders.</p>
          )}
        </Section>

        {memberships.length > 0 && (
          <Section title="Memberships">
            <div className="flex flex-wrap gap-2">
              {memberships.map((m) => (
                <Tag key={m}>{m}</Tag>
              ))}
            </div>
          </Section>
        )}
      </div>
    </>
  )
}

/* ---------- Small building blocks ---------- */

function Section({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn("border bg-card/70 p-5 backdrop-blur-sm", className)}
    >
      <h2 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Fact({ label, value }: { label: string; value?: ReactNode }) {
  if (value === undefined || value === null || value === "") return null
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="border px-2 py-0.5 text-xs">{children}</span>
}

function DetailSkeleton() {
  const pulse = "animate-pulse bg-muted motion-reduce:animate-none"
  return (
    <div role="status" aria-label="Loading country" className="space-y-6">
      <div className={cn("h-72", pulse)} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-6 md:grid-cols-2">
          <div className={cn("h-56", pulse)} />
          <div className={cn("h-56", pulse)} />
          <div className={cn("h-40 md:col-span-2", pulse)} />
        </div>
        <div className={cn("h-72", pulse)} />
      </div>
    </div>
  )
}

function LocalTimes({ timezones }: { timezones: string[] }) {
  const { fmt } = usePreferences()
  useTick() // only this component re-renders each minute

  return (
    <ul className="space-y-0.5">
      {timezones.slice(0, 4).map((tz) => (
        <li key={tz}>
          {fmt.weekdayIn(tz)}, {fmt.timeIn(tz)}{" "}
          <span className="text-muted-foreground">({tz})</span>
        </li>
      ))}
      {timezones.length > 4 && (
        <li className="text-muted-foreground">
          +{timezones.length - 4} more time zones
        </li>
      )}
    </ul>
  )
}
