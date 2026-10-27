import { Route, Routes } from "react-router-dom"
import NavHeader from "@/components/nav-header"
import { HomePage } from "@/pages/home"
import { CountryPage } from "@/pages/country"

export function App() {
  return (
    <>
      <NavHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/country/:code" element={<CountryPage />} />
      </Routes>
    </>
  )
}

export default App
