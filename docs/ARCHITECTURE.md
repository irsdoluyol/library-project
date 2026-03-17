# Архитектура проекта «Онлайн-библиотека»

Документ соответствует разделам 2.2 и 2.3 ВКР — проектирование архитектуры и REST API.

## REST API (раздел 2.2)

Базовый URL: `/api`

| Метод | Путь | Описание | Защита |
|-------|------|----------|--------|
| GET | /books | Список книг (search, genre, page, limit, sort) | — |
| GET | /books/my | Мои выданные книги | JWT |
| GET | /books/favorites | Сохранённые книги | JWT |
| POST | /books/:id/favorite | Добавить/убрать из сохранённых | JWT |
| GET | /books/:id/cover | Обложка книги | — |
| POST | /books/:id/borrow | Выдать книгу | JWT |
| POST | /books/:id/return | Вернуть книгу | JWT |
| GET | /books/:id/read | Чтение файла (PDF/TXT) | JWT |
| POST | /books | Создать книгу | admin |
| PUT | /books/:id | Обновить книгу | admin |
| DELETE | /books/:id | Удалить книгу | admin |
| POST | /books/:id/upload | Загрузить файл книги | admin |
| POST | /books/:id/cover | Загрузить обложку | admin |
| POST | /auth/register | Регистрация | — |
| POST | /auth/login | Вход | — |
| POST | /auth/logout | Выход | — |
| GET | /auth/me | Текущий пользователь | опционально |
| POST | /requests | Создать обращение | JWT |
| GET | /requests | Мои обращения | JWT |
| GET | /requests/all | Все обращения | admin |
| PATCH | /requests/:id | Обновить статус обращения | admin |
| GET | /admin/dashboard | Сводка админа | admin |
| GET | /health | Проверка доступности API | — |

## Структура клиента (React)

```
client/src/
├── api/              # API-клиенты (booksApi, requestsApi)
├── components/       # Переиспользуемые компоненты
│   ├── auth/        # AuthCard — карточка входа/регистрации
│   └── admin/       # AdminBookForm, AdminBookList
├── context/         # React Context (AuthContext)
├── hooks/           # Кастомные хуки (useAsyncLoad, useAdminBooks)
├── layouts/         # MainLayout, AdminLayout
├── pages/           # Страницы по доменам
│   ├── admin/       # AdminDashboardPage, AdminRequestsPage
│   ├── auth/        # LoginPage, RegisterPage
│   ├── books/       # MyBooksPage, ReadBookPage
│   ├── catalog/     # CatalogPage
│   └── requests/    # MyRequestsPage
├── routes/          # PrivateRoute, AdminRoute
├── styles/          # Стили по слоям
│   ├── base/        # reset.css
│   ├── common/      # buttons, forms, layout
│   ├── components/  # auth, admin
│   ├── layouts/     # MainLayout, AdminLayout
│   └── pages/       # catalog, books, requests, admin
└── utils/           # validation.js
```

## Структура стилей

- **base/** — сброс стилей браузера
- **common/** — общие компоненты (кнопки, формы, layout)
- **layouts/** — стили шаблонов
- **components/** — стили компонентов (auth, admin)
- **pages/** — стили страниц по доменам (catalog, books, requests, admin)

## Agile и методология

Проект разработан в рамках ВКР по программной инженерии. Agile — это **процесс разработки**, а не структура кода. В коде Agile не «виден» напрямую, но его принципы применяются:

- **Итеративность** — функциональность добавлялась по спринтам (каталог → выдача → обращения → чтение файлов)
- **Модульность** — компоненты, страницы и стили разделены по доменам
- **Гибкость** — структура позволяет легко добавлять новые страницы и компоненты

Проект следует итеративной разработке: каталог → аутентификация → выдача книг → обращения → чтение файлов.
