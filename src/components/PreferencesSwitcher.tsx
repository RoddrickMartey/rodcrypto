import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { usePreferences } from "@/context/preferences"
import { LOCALE_OPTIONS, localeLabel } from "@/lib/locale"
import type { UnitsSetting } from "@/lib/format"

export function PreferencesSwitcher() {
  const { localeSetting, setLocaleSetting, unitsSetting, setUnitsSetting, detected, locale } =
    usePreferences()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={localeSetting} onValueChange={(value) => value !== null && setLocaleSetting(value)}>
        <SelectTrigger className="w-56" aria-label="Formatting locale">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">Auto ({localeLabel(detected, locale)})</SelectItem>
          {LOCALE_OPTIONS.map((code) => (
            <SelectItem key={code} value={code}>
              {localeLabel(code, locale)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ToggleGroup
        variant="outline"
        value={unitsSetting as unknown as readonly string[]}
        onValueChange={(v) => {
          const value = Array.isArray(v) ? v[0] : v
          if (value === "auto" || value === "metric" || value === "imperial") {
            setUnitsSetting(value satisfies UnitsSetting)
          }
        }}
        aria-label="Units"
      >
        <ToggleGroupItem value="auto">Auto</ToggleGroupItem>
        <ToggleGroupItem value="metric">km</ToggleGroupItem>
        <ToggleGroupItem value="imperial">mi</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}