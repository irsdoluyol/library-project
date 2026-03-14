import { useEffect } from "react";

export function useDocumentTitle(title, suffix = "Онлайн-библиотека") {
  useEffect(() => {
    document.title = title ? `${title} — ${suffix}` : suffix;
    return () => {
      document.title = suffix;
    };
  }, [title, suffix]);
}
