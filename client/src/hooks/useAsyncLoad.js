import { useEffect, useState } from "react";

/**
 * Загружает данные асинхронно при изменении deps. Учитывает размонтирование (cancelled).
 * @param {() => Promise<any>} loadFn — функция, возвращающая Promise с данными
 * @param {Array} deps — зависимости для перезапуска загрузки
 * @returns {{ data: any, setData: Function, loading: boolean, error: string }}
 */
export function useAsyncLoad(loadFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await loadFn();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, error };
}
