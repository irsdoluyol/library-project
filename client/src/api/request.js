import { API_URL } from "../config.js";

/**
 * Выполняет запрос к API. Добавляет base URL, при необходимости — Authorization.
 * Парсит JSON, при ошибке бросает Error с message из ответа.
 * @param {string} path — путь относительно API (например "/books")
 * @param {{ method?: string, body?: object, token?: string }} options
 * @returns {Promise<object>} — распарсенный JSON
 */
export async function request(path, { method = "GET", body, token } = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
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
