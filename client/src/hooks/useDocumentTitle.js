import { useEffect } from "react";

export function useDocumentTitle(title, suffix = "Im. Library") {
  useEffect(() => {
    document.title = title ? `${title} — ${suffix}` : suffix;
    return () => {
      document.title = suffix;
    };
  }, [title, suffix]);
}
