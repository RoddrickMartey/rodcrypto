import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"
import { PreferencesSwitcher } from "@/components/PreferencesSwitcher"
import { useTheme } from "@/components/theme-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Theme = "dark" | "light" | "system"

const RESOURCES = [
  {
    name: "REST Countries API (v5)",
    use: "Country data and flags",
    href: "https://restcountries.com",
  },
  {
    name: "React + Vite",
    use: "UI and build tooling",
    href: "https://react.dev",
  },
  { name: "Tailwind CSS", use: "Styling", href: "https://tailwindcss.com" },
  {
    name: "shadcn/ui",
    use: "Component primitives",
    href: "https://ui.shadcn.com",
  },
  { name: "Hugeicons", use: "Icons", href: "https://hugeicons.com" },
  {
    name: "TanStack Query",
    use: "Fetching and caching",
    href: "https://tanstack.com/query",
  },
  { name: "React Router", use: "Routing", href: "https://reactrouter.com" },
  { name: "Axios", use: "HTTP client", href: "https://axios-http.com" },
  {
    name: "d3-geo + topojson + world-atlas",
    use: "Country outlines",
    href: "https://github.com/topojson/world-atlas",
  },
]

function NavHeader() {
  const [aboutOpen, setAboutOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">Rod Globe</h1>
          <ThemeSwitcher />
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm hover:bg-muted"
          >
            <HugeiconsIcon icon={InformationCircleIcon} size={16} />
            About
          </button>
        </div>
        <PreferencesSwitcher />
      </div>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="max-h-[85svh] overflow-y-auto rounded-none sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>About Rod Globe</DialogTitle>
            <DialogDescription>
              A country explorer built to show my frontend skills.
            </DialogDescription>
          </DialogHeader>

          <section className="space-y-2 text-sm">
            <h2 className="font-medium">The goal</h2>
            <p className="text-muted-foreground">
              Rod Globe is a portfolio project that puts real API consumption,
              caching, state management, responsive layout and locale-aware
              formatting into one small app. It loads every country once, caches
              it, and does the rest of the work in the browser.
            </p>
          </section>

          <section className="space-y-2 text-sm">
            <h2 className="font-medium">Built with</h2>
            <ul className="divide-y border">
              {RESOURCES.map((r) => (
                <li
                  key={r.name}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {r.name}
                  </a>
                  <span className="text-right text-muted-foreground">
                    {r.use}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-xs text-muted-foreground">
            Designed and built by Roddrick Martey Anum, Accra, Ghana.
          </p>
        </DialogContent>
      </Dialog>
    </header>
  )
}

export default NavHeader

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()
  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as Theme)}
      aria-label="Theme"
      className="border bg-transparent px-3 py-1.5 text-sm hover:bg-muted"
    >
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  )
}
