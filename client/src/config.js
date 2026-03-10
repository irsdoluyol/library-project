// В dev Vite проксирует /api на localhost:5050 — CORS не нужен
export const API_URL =
  import.meta.env.VITE_API_URL || "/api";

