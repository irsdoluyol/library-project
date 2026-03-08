# UML: Диаграмма последовательности — сценарий бронирования

Взаимодействие участников при выдаче книги. Соответствует разделу 1.4 ВКР.

## Диаграмма последовательности

```mermaid
sequenceDiagram
    actor User as Пользователь
    participant UI as React (CatalogPage)
    participant API as booksApi.js
    participant Server as Express API
    participant DB as MongoDB

    User->>UI: Нажимает «Взять»
    UI->>API: borrowBook(token, bookId)
    API->>Server: POST /api/books/:id/borrow<br/>Authorization: Bearer {token}
    Server->>Server: Проверка JWT (middleware)
    alt Токен невалиден
        Server-->>API: 401 Unauthorized
        API-->>UI: Error
        UI-->>User: Сообщение об ошибке
    else Токен валиден
        Server->>DB: Book.findById(bookId)
        DB-->>Server: Book
        alt Книга не найдена
            Server-->>API: 404
            API-->>UI: Error
        else Книга найдена
            alt Book.available === false
                Server-->>API: 400 Книга уже выдана
                API-->>UI: Error
            else Книга доступна
                Server->>DB: Borrowing.create({ user, book })
                Server->>DB: Book.updateOne({ available: false })
                DB-->>Server: OK
                Server-->>API: 200 { message }
                API-->>UI: Success
                UI->>UI: setRefreshTrigger (обновить список)
                UI-->>User: Книга в «Мои книги»
            end
        end
    end
```

## Упрощённая диаграмма (успешный сценарий)

```mermaid
sequenceDiagram
    participant U as Пользователь
    participant C as Клиент
    participant S as Сервер
    participant DB as MongoDB

    U->>C: Взять книгу
    C->>S: POST /borrow + JWT
    S->>DB: Проверить Book
    S->>DB: Создать Borrowing
    S->>DB: Book.available = false
    S-->>C: 200 OK
    C-->>U: Обновлённый каталог
```

## Участники

| Участник | Роль |
|----------|------|
| Пользователь | Инициатор действия |
| React (UI) | Клиентское приложение, отображение и вызов API |
| booksApi.js | Клиентский слой работы с API |
| Express API | Серверная логика, валидация, доступ к БД |
| MongoDB | Хранилище данных |
