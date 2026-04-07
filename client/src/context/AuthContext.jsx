import { createContext, useState, useEffect, useCallback } from "react";
import { request } from "../api/request.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const data = await request("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setUser(data.user);
  };

  const register = async (name, surname, email, password) => {
    const data = await request("/auth/register", {
      method: "POST",
      body: { name, surname, email, password },
    });
    setUser(null);
    return data;
  };

  const logout = async () => {
    try {
      await request("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, loading, login, register, logout, refreshUser: fetchMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };

