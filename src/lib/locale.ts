export const LOCALE_OPTIONS = [
  "en-GH", "en-NG", "en-GB", "en-US", "en-IN", "fr-FR", "de-DE", "es-ES",
]

export function detectLocale(): string {
  if (typeof navigator === "undefined") return "en-GH"
  return navigator.languages?.[0] || navigator.language || "en-GH"
}

export function localeLabel(code: string, inLocale: string): string {
  try {
    return new Intl.DisplayNames([inLocale], { type: "language" }).of(code) ?? code
  } catch {
    return code
  }
}