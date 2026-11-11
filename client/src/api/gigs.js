import { request } from "./http"

const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:5000/api"

export const getGigsAPI = (filters = {}) =>
  request(`${BASE_URL}/gigs?${new URLSearchParams(filters).toString()}`)

export const createGigAPI = (gigData) =>
  request(`${BASE_URL}/gigs`, { method: "POST", body: JSON.stringify(gigData) })

export const acceptGigAPI = (id) =>
  request(`${BASE_URL}/gigs/${id}/accept`, { method: "PUT" })

export const getMyGigsAPI = () => request(`${BASE_URL}/gigs/mine`)
