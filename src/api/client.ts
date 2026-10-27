import axios from "axios"
import { ApiError } from "./errors"

export const api = axios.create({
  baseURL: "https://api.restcountries.com",
  headers: { Authorization: `Bearer ${import.meta.env.VITE_RC_API_KEY}` },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status: number | undefined = err.response?.status
    const apiMessage: string | undefined =
      err.response?.data?.errors?.[0]?.message
    const fallback = !err.response
      ? "Can't reach the server. Check your internet connection."
      : status === 401
        ? "Invalid or missing API key."
        : status === 403
          ? "Monthly request limit reached."
          : status === 429
            ? "Too many requests. Please slow down."
            : "Something went wrong reaching the countries API."
    return Promise.reject(new ApiError(apiMessage ?? fallback, status))
  }
)
