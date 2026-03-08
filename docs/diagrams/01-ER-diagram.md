# ER-диаграмма (Entity-Relationship)

Модель данных системы управления библиотекой. Соответствует разделам 1.3 и 1.4 ВКР.

## Диаграмма сущностей и связей

```mermaid
erDiagram
    User ||--o{ Borrowing : "оформляет"
    Book ||--o{ Borrowing : "выдаётся в"
    User ||--o{ Request : "создаёт"

    User {
        ObjectId _id PK
        string name "NOT NULL"
        string surname
        string email "UNIQUE, NOT NULL"
        string password "NOT NULL"
        string role "user|admin"
        datetime createdAt
        datetime updatedAt
    }

    Book {
        ObjectId _id PK
        string title "NOT NULL"
        string author "NOT NULL"
        string description
        int year
        string genre
        boolean available "default true"
        string filePath
        string fileType "pdf|txt"
        datetime createdAt
        datetime updatedAt
    }

    Borrowing {
        ObjectId _id PK
        ObjectId user FK
        ObjectId book FK
        datetime borrowedAt
        datetime returnedAt
        string status "active|returned"
        datetime createdAt
        datetime updatedAt
    }

    Request {
        ObjectId _id PK
        string subject "NOT NULL"
        string message "NOT NULL"
        string status "new|in_progress|closed"
        ObjectId author FK
        datetime createdAt
        datetime updatedAt
    }
```

## Описание связей

| Связь | Тип | Описание |
|-------|-----|----------|
| User → Borrowing | 1:N | Один пользователь может иметь несколько активных выдач |
| Book → Borrowing | 1:N | Одна книга может быть выдана разным пользователям в разное время |
| User → Request | 1:N | Один пользователь может создать несколько обращений |

## Кардинальность

- **User — Borrowing**: один ко многим (1:N). Пользователь может оформить множество выдач.
- **Book — Borrowing**: один ко многим (1:N). Книга участвует в множестве выдач (история).
- **User — Request**: один ко многим (1:N). Пользователь может создать множество обращений.

## Индексы (MongoDB)

- `User`: `email` (unique)
- `Book`: `{ title: "text", author: "text" }`, `{ genre: 1 }`
- `Borrowing`: составной индекс по `(user, book, status)` для быстрого поиска активных выдач
