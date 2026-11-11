import { request } from "./http";
import { BASE_URL } from "./config";

export const getGigsAPI = (filters = {}) =>
  request(`${BASE_URL}/gigs?${new URLSearchParams(filters).toString()}`);

export const createGigAPI = (gigData) =>
  request(`${BASE_URL}/gigs`, {
    method: "POST",
    body: JSON.stringify(gigData),
  });

export const acceptGigAPI = (id) =>
  request(`${BASE_URL}/gigs/${id}/accept`, { method: "PUT" });

export const getMyGigsAPI = () => request(`${BASE_URL}/gigs/mine`);
