import { request } from "./http"

const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:5000/api"
export const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5000"

export const getItemsAPI = (filters = {}) =>
  request(`${BASE_URL}/items?${new URLSearchParams(filters).toString()}`)

export const getItemByIdAPI = (id) => request(`${BASE_URL}/items/${id}`)

export const createItemAPI = (itemData) =>
  request(`${BASE_URL}/items`, { method: "POST", body: itemData instanceof FormData ? itemData : JSON.stringify(itemData) })

export const getMyItemsAPI = () => request(`${BASE_URL}/items/mine`)
