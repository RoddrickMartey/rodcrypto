import type { PaletteColor } from "@/api/types"

function parse(hex: string) {
  const h = hex.replace("#", "")
  const full =
    h.length === 3
      ? h
          .split("")
          .map((x) => x + x)
          .join("")
      : h
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

const rgba = (hex: string, alpha: number) => {
  const { r, g, b } = parse(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// 0 (black) to 1 (white)
const luminance = (hex: string) => {
  const { r, g, b } = parse(hex)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

export function flagGradients(palette: PaletteColor[] = [], dominant?: string) {
  let colors = [...palette]
    .filter((p) => p.proportion >= 0.05)
    .sort((a, b) => b.proportion - a.proportion)
    .map((p) => p.hex)
    .filter((hex) => luminance(hex) > 0.1 && luminance(hex) < 0.9)
    .slice(0, 3)

  if (colors.length === 0 && dominant) colors = [dominant]
  if (colors.length === 0) return null

  const [a, b = a, c = b] = colors

  return {
    // full-page backdrop: a large glow near the top, fading out before the edges, over a faint diagonal wash
    page: [
      `radial-gradient(ellipse 80% 70% at 50% 28%, ${rgba(a, 0.38)} 0%, ${rgba(b, 0.24)} 40%, ${rgba(c, 0.12)} 68%, transparent 96%)`,
      `linear-gradient(135deg, ${rgba(a, 0.12)} 0%, ${rgba(b, 0.08)} 50%, ${rgba(c, 0.12)} 100%)`,
    ].join(", "),
    radial: `radial-gradient(circle farthest-side at 50% 50%, ${rgba(a, 0.5)} 0%, ${rgba(b, 0.3)} 45%, ${rgba(c, 0.14)} 72%, transparent 96%)`,
    linear: `linear-gradient(135deg, ${rgba(a, 0.16)} 0%, ${rgba(b, 0.1)} 50%, ${rgba(c, 0.16)} 100%)`,
  }
}
