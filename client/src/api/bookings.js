import { request } from "./http";
import { BASE_URL } from "./config";

export const createBookingAPI = (itemId, startDate, endDate) =>
  request(`${BASE_URL}/bookings`, {
    method: "POST",
    body: JSON.stringify({ itemId, startDate, endDate }),
  });

export const getMyBookingsAPI = () => request(`${BASE_URL}/bookings/mine`);
export const getIncomingBookingsAPI = (status = "all") =>
  request(`${BASE_URL}/bookings/incoming?status=${encodeURIComponent(status)}`);
export const updateBookingStatusAPI = (id, status) =>
  request(`${BASE_URL}/bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
