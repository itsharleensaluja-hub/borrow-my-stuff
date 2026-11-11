let csrfToken = null;

const getCsrfToken = () => {
  if (csrfToken) return csrfToken;
  const token = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("borrowbox_csrf="));
  return token ? decodeURIComponent(token.split("=")[1]) : null;
};

export const request = async (path, options = {}) => {
  const headers = new Headers(options.headers);
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  )
    headers.set("Content-Type", "application/json");
  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(options.method) &&
    getCsrfToken()
  ) {
    headers.set("X-CSRF-Token", getCsrfToken());
  }

  const res = await fetch(path, {
    ...options,
    headers,
    credentials: "include",
  });
  const responseToken = res.headers.get("X-CSRF-Token");
  if (responseToken) csrfToken = responseToken;
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: "Invalid server response" };
  }
  if (res.status === 401) window.dispatchEvent(new Event("auth:unauthorized"));
  if (!res.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = res.status;
    error.code = data?.code;
    throw error;
  }
  return data;
};
