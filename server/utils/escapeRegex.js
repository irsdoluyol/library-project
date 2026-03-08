/**
 * Экранирует спецсимволы для безопасного использования в MongoDB $regex.
 * Защита от ReDoS и неожиданного поведения при поиске.
 * @param {string} str — строка поиска от пользователя
 * @returns {string} — экранированная строка
 */
export function escapeRegex(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
