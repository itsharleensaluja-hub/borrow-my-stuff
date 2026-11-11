export const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");
export const BASE_URL = `${API_ORIGIN}/api`;
