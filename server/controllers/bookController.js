import Book from "../models/Book.js";

export const getBooks = async (req, res) => {
  try {
    const {
      search,
      genre,
      page = 1,
      limit = 5,
      sort = "createdAt",
    } = req.query;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (genre) {
      query.genre = genre;
    }

    const books = await Book.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("borrowedBy", "name email");

    const total = await Book.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      books,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения книг" });
  }
};

export const createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка создания книги" });
  }
};

export const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Книга не найдена" });
    }

    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка обновления книги" });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Книга не найдена" });
    }

    res.json({ message: "Книга удалена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка удаления книги" });
  }
};

export const borrowBook = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Нет авторизации" });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Книга не найдена" });
    }

    if (!book.available) {
      return res.status(400).json({ message: "Книга уже выдана" });
    }

    const userId = req.user.id || req.user._id;

    book.available = false;
    book.borrowedBy = userId;
    book.borrowedAt = new Date();

    await book.save();

    res.json({ message: "Книга успешно выдана", book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка выдачи книги" });
  }
};

export const returnBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Книга не найдена" });
    }

    if (book.available) {
      return res.status(400).json({ message: "Книга уже в библиотеке" });
    }

    book.available = true;
    book.borrowedBy = null;
    book.borrowedAt = null;

    await book.save();

    res.json({ message: "Книга возвращена", book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка возврата книги" });
  }
};