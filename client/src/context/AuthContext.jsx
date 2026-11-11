import { useState } from "react"
import { AuthContext } from "./AuthContextValue"
import { logoutAPI } from "../api/auth"

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem("borrowbox_user")
    return savedUser ? JSON.parse(savedUser) : null
  } catch {
    localStorage.removeItem("borrowbox_user")
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser)

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem("borrowbox_user", JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      await logoutAPI()
    } catch {
      // Local logout still clears the session if the server is unavailable.
    }
    setUser(null)
    localStorage.removeItem("borrowbox_user")
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}