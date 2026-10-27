import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ONE_DAY } from "@/hooks/use-countries"
import { BrowserRouter } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { PreferencesProvider } from "@/context/preferences.tsx"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false, // protects your monthly request quota
      gcTime: ONE_DAY, // must be >= the persister's maxAge
    },
  },
})

const persister = createAsyncStoragePersister({
  storage: window.localStorage,
  key: "rodglobe:query-cache",
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: ONE_DAY,
        buster: "v1", // bump this whenever you change LIST_FIELDS or the types
        dehydrateOptions: {
          // only save the all-countries list; detail pages stay in memory
          shouldDehydrateQuery: (q) =>
            q.queryKey[0] === "countries" && q.state.status === "success",
        },
      }}
    >
      <BrowserRouter>
        <PreferencesProvider>
          <ThemeProvider>
            <TooltipProvider>
              <App />
            </TooltipProvider>
          </ThemeProvider>
        </PreferencesProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  </StrictMode>
)
