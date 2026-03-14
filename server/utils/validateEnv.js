
const REQUIRED = ["MONGO_URI", "JWT_SECRET"];

export function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    console.error("Ошибка: отсутствуют обязательные переменные окружения:");
    missing.forEach((key) => console.error(`  - ${key}`));
    console.error("\nСоздайте файл server/.env с указанными переменными.");
    process.exit(1);
  }
}
