import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth.js";
import { fetchFavorites } from "../api/booksApi.js";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) {
      setBooks([]);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await fetchFavorites();
      setBooks(data?.books ?? []);
    } catch (err) {
      setError(err.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return (
    <FavoritesContext.Provider value={{ books, loading, error, refresh }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
