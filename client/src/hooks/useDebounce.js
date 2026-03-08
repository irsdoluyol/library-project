import { useState, useEffect } from "react";

/**
 * Возвращает значение с задержкой (debounce).
 * @param {string} value — исходное значение
 * @param {number} delay — задержка в мс
 * @returns {string} — значение после задержки
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
