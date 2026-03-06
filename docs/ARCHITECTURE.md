# Архитектура проекта «Онлайн-библиотека»

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

Для отражения Agile в проекте можно вести:
- `docs/SPRINTS.md` — описание спринтов и бэклога
- `docs/BACKLOG.md` — список задач и приоритетов
