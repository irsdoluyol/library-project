# Онлайн-библиотека

Веб-приложение для управления электронным библиотечным каталогом. Разработано на MERN (MongoDB, Express, React, Node.js) в рамках выпускной квалификационной работы.

## Функциональность

- **Пользователь:** регистрация, вход, просмотр каталога, поиск по названию/автору, фильтр по жанру, выдача и возврат книг, чтение PDF/TXT с настройками, создание обращений
- **Администратор:** управление каталогом (CRUD книг), загрузка файлов книг, обработка обращений пользователей

## Стек технологий

- **Frontend:** React 19, Vite, React Router
- **Backend:** Node.js, Express 5
- **База данных:** MongoDB (Atlas)
- **Аутентификация:** JWT, bcrypt

## Требования

- Node.js 18+
- MongoDB (локально или Atlas)

## Установка и запуск

### 1. Клонирование и установка зависимостей

```bash
git clone <url-репозитория>
cd online-library

# Сервер
cd server && npm install

# Клиент
cd ../client && npm install
```

### 2. Настройка окружения

**Обязательно:** создайте файл `server/.env`. Без `MONGO_URI` и `JWT_SECRET` сервер не запустится.

```
PORT=5050
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
JWT_SECRET=ваш-секретный-ключ
# Опционально для production:
# CORS_ORIGINS=https://your-domain.com
# NODE_ENV=production
```

### 3. Запуск

**Сервер** (в папке `server`):
```bash
npm run dev
```

**Клиент** (в папке `client`):
```bash
npm run dev
```

Приложение откроется на http://localhost:5173. API — http://localhost:5050.

### 4. Сборка для production

```bash
cd client && npm run build
```

Статические файлы появятся в `client/dist/`.

## Структура проекта

```
online-library/
├── client/          # React-приложение (Vite)
├── server/          # Express API
├── docs/            # Документация (архитектура, тесты, диаграммы, безопасность)
└── README.md
```

## Тестирование

```bash
cd client
npm test
```

## Документация

- `docs/ARCHITECTURE.md` — архитектура и структура
- `docs/TESTING.md` — план тестирования
- `docs/REQUIREMENTS.md` — чеклист требований
- `docs/SECURITY.md` — анализ угроз и меры защиты
- `docs/diagrams/` — ER, UML-диаграммы (Mermaid)

## Лицензия

Учебный проект.
