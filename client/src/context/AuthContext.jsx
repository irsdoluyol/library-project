import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("online-library-auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
      } catch {
        window.localStorage.removeItem("online-library-auth");
      }
    }
    setLoading(false);
  }, []);

  const saveSession = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    window.localStorage.setItem(
      "online-library-auth",
      JSON.stringify({ user: nextUser, token: nextToken })
    );
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem("online-library-auth");
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    saveSession(data.user, data.token);
  };

  const register = async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    // после успешной регистрации сразу залогиним пользователя
    await login(email, password);
  };

  const logout = () => {
    clearSession();
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, token, isAdmin, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

