import { useEffect, useState } from "react"
import { geoArea, geoCentroid, geoDistance, geoEqualEarth, geoPath } from "d3-geo"
import { feature } from "topojson-client"
import type { Topology, GeometryCollection } from "topojson-specification"
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson"

type Shape = Feature<Polygon | MultiPolygon>

const SIZE = { w: 400, h: 300, pad: 14 }
// Islands further than this (in radians, ~2,200 km) from the main landmass are dropped
const MAX_DIST = 0.35

let cache: Promise<Shape[]> | null = null

// Parsed once, shared by every CountryShape on the page
function loadShapes(): Promise<Shape[]> {
  cache ??= import("world-atlas/countries-50m.json").then((mod) => {
    const topo = mod.default as unknown as Topology
    const fc = feature(
      topo,
      topo.objects.countries as GeometryCollection
    ) as FeatureCollection<Polygon | MultiPolygon>
    return fc.features as Shape[]
  })
  return cache
}

const toPolygon = (coordinates: Polygon["coordinates"]): Feature<Polygon> => ({
  type: "Feature",
  properties: {},
  geometry: { type: "Polygon", coordinates },
})

// Keep the biggest piece plus close neighbours (Hokkaido stays, Hawaii and French Guiana go)
function focusOnMainland(shape: Shape): Shape {
  if (shape.geometry.type === "Polygon") return shape

  const parts = shape.geometry.coordinates.map(toPolygon)
  const main = parts.reduce((a, b) => (geoArea(b) > geoArea(a) ? b : a))
  const mainCentre = geoCentroid(main)

  const kept = parts.filter(
    (p) => p === main || geoDistance(geoCentroid(p), mainCentre) < MAX_DIST
  )

  return {
    type: "Feature",
    properties: {},
    geometry: { type: "MultiPolygon", coordinates: kept.map((p) => p.geometry.coordinates) },
  }
}

type Props = {
  ccn3: string
  label?: string
  className?: string
}

export function CountryShape({ ccn3, label, className }: Props) {
  const [result, setResult] = useState<{ ccn3: string; path: string | null } | null>(null)

  useEffect(() => {
    let cancelled = false

    loadShapes().then((shapes) => {
      if (cancelled) return
      const id = ccn3.padStart(3, "0")
      const match = shapes.find((s) => String(s.id).padStart(3, "0") === id)
      if (!match) return setResult({ ccn3, path: null })

      const focused = focusOnMainland(match)
      const projection = geoEqualEarth().fitExtent(
        [[SIZE.pad, SIZE.pad], [SIZE.w - SIZE.pad, SIZE.h - SIZE.pad]],
        focused
      )
      setResult({ ccn3, path: geoPath(projection)(focused) })
    })

    return () => { cancelled = true }
  }, [ccn3])

  const path = result?.ccn3 === ccn3 ? result.path : undefined

  if (path === null) {
    return <div className={className}>No map available</div>
  }

  if (path === undefined) {
    return <div className={`aspect-4/3 animate-pulse rounded-lg bg-muted ${className ?? ""}`} />
  }

  return (
    <svg
      viewBox={`0 0 ${SIZE.w} ${SIZE.h}`}
      role="img"
      aria-label={label ? `Outline of ${label}` : "Country outline"}
      className={`aspect-4/3 w-full ${className ?? ""}`}
    >
      <path
        d={path}
        strokeLinejoin="round"
        strokeWidth={1.25}
        className="fill-primary/20 stroke-primary transition-colors group-hover:fill-primary/40"
      />
    </svg>
  )
}