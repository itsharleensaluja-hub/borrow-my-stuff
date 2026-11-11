const getLegacyToken = () => {
  try {
    const savedUser = localStorage.getItem("borrowbox_user")
    return savedUser ? JSON.parse(savedUser).token : null
  } catch {
    return null
  }
}

const getCsrfToken = () => {
  const token = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("borrowbox_csrf="))
  return token ? decodeURIComponent(token.split("=")[1]) : null
}

export const request = async (path, options = {}) => {
  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json")
  const token = getLegacyToken()
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`)
  if (["POST", "PUT", "PATCH", "DELETE"].includes(options.method) && getCsrfToken()) {
    headers.set("X-CSRF-Token", getCsrfToken())
  }

  const res = await fetch(path, { ...options, headers, credentials: "include" })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { message: "Invalid server response" }
  }
  if (!res.ok) throw new Error(data?.message || "Request failed")
  return data
}
