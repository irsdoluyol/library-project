import { createContext, useState } from "react";
import { request } from "../api/request.js";

const AuthContext = createContext(null);

function getStoredSession() {
  try {
    const saved = window.localStorage.getItem("online-library-auth");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { user: parsed.user || null, token: parsed.token || null };
    }
  } catch {
    window.localStorage.removeItem("online-library-auth");
  }
  return { user: null, token: null };
}

export function AuthProvider({ children }) {
  const initial = getStoredSession();
  const [user, setUser] = useState(initial.user);
  const [token, setToken] = useState(initial.token);
  const loading = false;

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
    const data = await request("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    saveSession(data.user, data.token);
  };

  const register = async (name, surname, email, password) => {
    await request("/auth/register", {
      method: "POST",
      body: { name, surname, email, password },
    });
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

export { AuthContext };

