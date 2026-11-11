import { request } from "./http";
import { API_ORIGIN, BASE_URL } from "./config";

export const getItemsAPI = (filters = {}, options = {}) =>
  request(
    `${BASE_URL}/items?${new URLSearchParams(filters).toString()}`,
    options,
  );

export const getItemByIdAPI = (id) => request(`${BASE_URL}/items/${id}`);

export const createItemAPI = (itemData) =>
  request(`${BASE_URL}/items`, {
    method: "POST",
    body: itemData instanceof FormData ? itemData : JSON.stringify(itemData),
  });

export const getMyItemsAPI = () => request(`${BASE_URL}/items/mine`);
