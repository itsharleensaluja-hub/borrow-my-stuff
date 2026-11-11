import { request } from "./http";
import { BASE_URL } from "./config";

export const registerAPI = (name, email, password, hostel) =>
  request(`${BASE_URL}/auth/register`, {
    method: "POST",
    body: JSON.stringify({ name, email, password, hostel }),
  });

export const loginAPI = (email, password) =>
  request(`${BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logoutAPI = () =>
  request(`${BASE_URL}/auth/logout`, { method: "POST" });
export const getMeAPI = () => request(`${BASE_URL}/auth/me`);
export const updateRolesAPI = (roles) =>
  request(`${BASE_URL}/auth/roles`, {
    method: "PUT",
    body: JSON.stringify({ roles }),
  });
