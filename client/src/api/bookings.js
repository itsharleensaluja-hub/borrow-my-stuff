import { request } from "./http"

const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:5000/api"

export const createBookingAPI = (itemId, startDate, endDate) =>
  request(`${BASE_URL}/bookings`, {
    method: "POST",
    body: JSON.stringify({ itemId, startDate, endDate }),
  })

export const getMyBookingsAPI = () => request(`${BASE_URL}/bookings/mine`)
export const getIncomingBookingsAPI = (status = "all") =>
  request(`${BASE_URL}/bookings/incoming?status=${encodeURIComponent(status)}`)
export const updateBookingStatusAPI = (id, status) =>
  request(`${BASE_URL}/bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  })
