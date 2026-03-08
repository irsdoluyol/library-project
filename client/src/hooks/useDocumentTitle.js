import { useEffect } from "react";

/**
 * Устанавливает document.title для страницы.
 * @param {string} title - Заголовок (например, "Каталог")
 * @param {string} [suffix="Онлайн-библиотека"] - Суффикс после тире
 */
export function useDocumentTitle(title, suffix = "Онлайн-библиотека") {
  useEffect(() => {
    document.title = title ? `${title} — ${suffix}` : suffix;
    return () => {
      document.title = suffix;
    };
  }, [title, suffix]);
}
