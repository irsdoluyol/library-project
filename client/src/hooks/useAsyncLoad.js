import { useEffect, useState, useRef } from "react";

export function useAsyncLoad(loadFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadFnRef = useRef(loadFn);
  loadFnRef.current = loadFn;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await loadFnRef.current();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // Второй аргумент — явный список зависимостей от вызывающего кода; loadFn берётся из ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, error };
}
