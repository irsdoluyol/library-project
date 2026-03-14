import { API_URL } from "../config.js";

export async function request(path, { method = "GET", body } = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const headers = { "Content-Type": "application/json" };

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      credentials: "include",
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error(
      "Сервер недоступен. Проверьте, что сервер запущен (npm run dev в папке server)."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Ошибка запроса");
  }

  return data;
}
