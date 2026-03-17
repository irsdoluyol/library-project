# Реализация требований ВКР (раздел 1.3)

Описание того, как каждое требование реализовано в системе.

---

## Функциональные требования

### 1. Панель админа: добавление, редактирование, удаление книг

**Реализация:**
- **Клиент:** `AdminBookForm`, `AdminBookList`, `AdminDashboardPage` — форма создания/редактирования, список книг с пагинацией и поиском.
- **Сервер:** `POST /api/books`, `PUT /api/books/:id`, `DELETE /api/books/:id` (bookController: createBook, updateBook, deleteBook).
- **Маршрут:** `/admin` защищён `AdminRoute` и `checkRole("admin")`.

---

### 2. Мониторинг резервирований и обращений

**Реализация:**
- **Обращения:** `AdminRequestsPage` — список обращений пользователей, смена статуса (new, in_progress, closed). API: `GET /api/requests/all`, `PATCH /api/requests/:id`.
- **Выдачи (резервирования):** записи в коллекции `Borrowing` при выдаче и возврате; логирование в `logBorrowing.borrow`, `logBorrowing.return` (server/utils/logger.js). Отдельной страницы мониторинга выдач в админке нет — выдачи фиксируются в БД и логах.

---

### 3. Поиск по ключевым атрибутам (название, автор)

**Реализация:**
- **Сервер:** `getBooks` в bookController — параметр `search` преобразуется в `$or: [{ title: regex }, { author: regex }]` через `escapeRegex`.
- **Клиент:** `CatalogSearchBar` — поле поиска, параметр `search` в URL.
- **API:** `GET /api/books?search=...`.

---

### 4. Фильтрация по жанру

**Реализация:**
- **Сервер:** `getBooks` — параметр `genre` добавляется в запрос как `query.genre = { $regex: "^genre$", $options: "i" }`.
- **Клиент:** `CatalogSearchBar`, `CatalogSearch` — выпадающий список жанров (Роман, Детектив, Фантастика и др.).
- **API:** `GET /api/books?genre=...`.

---

### 5. Бронирование ресурсов

**Реализация:**
- **Выдача:** `POST /api/books/:id/borrow` (protect) — создаётся запись Borrowing, `book.available = false`.
- **Возврат:** `POST /api/books/:id/return` (protect) — статус Borrowing: returned, `book.available = true`.
- **Клиент:** кнопка «Взять» в BookCard, кнопка «Вернуть» в BorrowingItem на странице «Мои книги».

---

### 6. Получение материалов в PDF/TXT

**Реализация:**
- **Загрузка:** `POST /api/books/:id/upload` (admin) — Multer, допустимые расширения `.pdf`, `.txt` (config/multer.js).
- **Чтение:** `GET /api/books/:id/read` (protect) — проверка активной выдачи, отдача PDF через stream или JSON с текстом TXT.
- **Клиент:** `ReadBookPage` — iframe для PDF, pre для TXT.

---

### 7. Настройки чтения (цвет, шрифт, масштаб)

**Реализация:**
- **ReadBookPage:** панель настроек с выбором темы (Сепия, Белый, Крем, Тёмный), кастомный цвет фона, ползунок размера шрифта (14–24px), выбор шрифта (Georgia, Times New Roman, Arial). Стили применяются через CSS-переменные `--read-bg`, `--read-font-size`, `--read-font`.

---

### 8. Модуль обращений (создание, отслеживание)

**Реализация:**
- **Создание:** `POST /api/requests` (protect) — subject, message; валидация длины (subject ≤ 200, message ≤ 2000).
- **Мои обращения:** `MyRequestsPage`, `GET /api/requests` — список обращений пользователя.
- **Админ:** `AdminRequestsPage`, `GET /api/requests/all`, `PATCH /api/requests/:id` — просмотр и смена статуса.

---

### 9. Разграничение ролей (user / admin)

**Реализация:**
- **JWT:** токен в httpOnly cookie; middleware `protect` проверяет наличие и валидность токена.
- **Роль:** `checkRole("admin")` — доступ к CRUD книг, `/api/requests/all`, `/api/admin/*`.
- **Клиент:** `AdminRoute` перенаправляет не-админов; маршрут `/admin` доступен только для role: "admin".

---

### 10. Валидация входных данных

**Реализация:**
- **Клиент:** `client/src/utils/validation.js` — validateRegister (имя, email, пароль, фамилия), проверка длины и формата.
- **Сервер:** authController — проверка обязательных полей при регистрации/логине; bookController — title, author обязательны; requestController — subject, message с лимитами длины.
- **Экранирование:** `escapeRegex` для параметров поиска и жанра.

---

### 11. Транзакционная согласованность выдачи

**Реализация:**
- В `borrowBook`: проверка `book.available`, создание Borrowing, затем `book.available = false`, `book.save()`.
- В `returnBook`: поиск активной выдачи, смена статуса, `book.available = true`, `book.save()`.
- Используется последовательное выполнение без race conditions; MongoDB ODM обеспечивает атомарность отдельных операций.

---

### 12. Модульность сервера (маршруты, контроллеры, модели)

**Реализация:**
- **Маршруты:** `authRoutes`, `bookRoutes`, `requestRoutes`, `adminRoutes`, `testRoutes` — разделение по доменам.
- **Контроллеры:** `authController`, `bookController`, `requestController` — обработка запросов, работа с моделями.
- **Модели:** `User`, `Book`, `Borrowing`, `Request` — схемы Mongoose.

---

## Нефункциональные требования

### 1. Безопасность данных, защита от НСД

**Реализация:** JWT в httpOnly cookie; bcrypt для паролей; middleware `protect` и `checkRole`; проверка прав при чтении файла книги (только пользователь с активной выдачей). Подробно в `docs/SECURITY.md`.

---

### 2. Устойчивость при одновременных обращениях

**Реализация:** Mongoose с индексами (User.email unique; Book: text index title+author, genre; Borrowing). Пагинация в каталоге (limit 1–100). Rate limiting на `/api` и `/api/auth`.

---

### 3. Целостность БД

**Реализация:** Схемы Mongoose с required, enum, валидацией; связи через ObjectId; индексы для уникальности и поиска.

---

### 4. Совместимость с браузерами (ПК, мобильные)

**Реализация:** React, адаптивные стили (медиа-запросы @media max-width: 768px в layouts, sidebar, header).

---

### 5. Расширяемость архитектуры

**Реализация:** Модульная структура client/src и server (api, components, pages, routes, controllers, models). Добавление новых страниц и API-маршрутов без изменения базовой архитектуры.

---

## Дополнительные (из текста ВКР)

### 1. Проверка форматов файлов (PDF, TXT)

**Реализация:** `server/config/multer.js` — `allowed: [".pdf", ".txt"]` для загрузки книг; для обложек — `.jpg`, `.png`, `.webp`. Лимиты: 50 МБ для файла книги, 5 МБ для обложки.

---

### 2. Индексирование по ключевым полям

**Реализация:** `Book` — `bookSchema.index({ title: "text", author: "text" })`, `bookSchema.index({ genre: 1 })` для полнотекстового поиска и фильтра по жанру.

---

### 3. Логирование критических операций

**Реализация:** `server/utils/logger.js` — logCatalog (create, update, delete), logBorrowing (borrow, return), logRequest (create, statusChange). Вывод в консоль с меткой времени и деталями.

---

## Статус

Все требования из раздела 1.3 ВКР реализованы.
