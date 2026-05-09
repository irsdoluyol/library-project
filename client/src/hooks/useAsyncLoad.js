import { useEffect, useState, useRef, useCallback } from "react";

export function useAsyncLoad(loadFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadFnRef = useRef(loadFn);
  loadFnRef.current = loadFn;

  const runLoad = useCallback(async (cancelledRef) => {
    setLoading(true);
    setError("");
    try {
      const result = await loadFnRef.current();
      if (cancelledRef?.cancelled) return result;
      setData(result);
      return result;
    } catch (err) {
      if (!cancelledRef?.cancelled) setError(err.message || "Failed to load");
      throw err;
    } finally {
      if (!cancelledRef?.cancelled) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cancelledRef = { cancelled: false };
    runLoad(cancelledRef).catch(() => {});
    return () => {
      cancelledRef.cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reload = useCallback(() => runLoad(null), [runLoad]);

  return { data, setData, loading, error, reload };
}
