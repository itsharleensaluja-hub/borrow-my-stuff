import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContextValue";
import { getMeAPI, logoutAPI } from "../api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const revalidate = async () => {
      try {
        const currentUser = await getMeAPI();
        setUser(currentUser);
        localStorage.setItem("borrowbox_user", JSON.stringify(currentUser));
      } catch {
        setUser(null);
        localStorage.removeItem("borrowbox_user");
      } finally {
        setLoading(false);
      }
    };
    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem("borrowbox_user");
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    revalidate();
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("borrowbox_user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await logoutAPI();
    } catch {
      // Local logout still clears the session if the server is unavailable.
    }
    setUser(null);
    localStorage.removeItem("borrowbox_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
