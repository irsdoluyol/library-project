# UML: Диаграмма классов

Структура основных сущностей системы. Соответствует разделу 1.4 ВКР.

## Диаграмма классов

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +string name
        +string surname
        +string email
        +string password
        +string role
        +datetime createdAt
        +datetime updatedAt
    }

    class Book {
        +ObjectId _id
        +string title
        +string author
        +string description
        +number year
        +string genre
        +boolean available
        +string filePath
        +string fileType
        +datetime createdAt
        +datetime updatedAt
    }

    class Borrowing {
        +ObjectId _id
        +ObjectId user
        +ObjectId book
        +datetime borrowedAt
        +datetime returnedAt
        +string status
        +datetime createdAt
        +datetime updatedAt
    }

    class Request {
        +ObjectId _id
        +string subject
        +string message
        +string status
        +ObjectId author
        +datetime createdAt
        +datetime updatedAt
    }

    User "1" --> "*" Borrowing : оформляет
    Book "1" --> "*" Borrowing : выдаётся в
    User "1" --> "*" Request : создаёт
```

## Описание классов

| Класс | Назначение |
|-------|------------|
| **User** | Пользователь системы (роли: user, admin) |
| **Book** | Книга в каталоге, метаданные и путь к файлу |
| **Borrowing** | Выдача книги пользователю (связь User–Book) |
| **Request** | Обращение пользователя в поддержку |
