import { request } from "./http"

const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:5000/api"

export const registerAPI = (name, email, password, hostel) =>
  request(`${BASE_URL}/auth/register`, {
    method: "POST",
    body: JSON.stringify({ name, email, password, hostel }),
  })

export const loginAPI = (email, password) =>
  request(`${BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

export const logoutAPI = () => request(`${BASE_URL}/auth/logout`, { method: "POST" })
export const updateRolesAPI = (roles) =>
  request(`${BASE_URL}/auth/roles`, { method: "PUT", body: JSON.stringify({ roles }) })
