import { useEffect, useState } from "react"

export function useTick(ms = 60_000) {
  const [, setTick] = useState(0)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    const schedule = () => {
      // Time left until the next boundary (e.g. 30s past the minute -> wait 30s)
      const wait = ms - (Date.now() % ms)
      timeout = setTimeout(() => {
        setTick((t) => t + 1)
        schedule() // recalculate each time so the timer can't drift
      }, wait)
    }

    // Browsers pause timers in background tabs, so refresh as soon as the tab is visible again
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timeout)
        setTick((t) => t + 1)
        schedule()
      }
    }

    schedule()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      clearTimeout(timeout)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [ms])
}
