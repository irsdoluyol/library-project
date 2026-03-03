import Book from "../models/Book.js";
import Borrowing from "../models/Borrowing.js";

export const getBooks = async (req, res) => {
  try {
    const { search, genre, page = 1, limit = 5, sort = "createdAt" } = req.query;

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
      .limit(Number(limit));

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
    const userId = req.user.id || req.user._id;
    const bookId = req.params.id;

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Книга не найдена" });
    }

    if (!book.available) {
      return res.status(400).json({ message: "Книга уже выдана" });
    }

    await Borrowing.create({
      user: userId,
      book: bookId,
    });

    book.available = false;
    await book.save();

    res.json({ message: "Книга успешно выдана" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка выдачи книги" });
  }
};

export const returnBook = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const bookId = req.params.id;

    const borrowing = await Borrowing.findOne({
      user: userId,
      book: bookId,
      status: "active",
    });

    if (!borrowing) {
      return res.status(400).json({
        message: "Активная выдача не найдена",
      });
    }

    borrowing.status = "returned";
    borrowing.returnedAt = new Date();
    await borrowing.save();

    const book = await Book.findById(bookId);
    book.available = true;
    await book.save();

    res.json({ message: "Книга возвращена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка возврата книги" });
  }
};

export const getMyBooks = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const myBorrowings = await Borrowing.find({
      user: userId,
      status: "active",
    }).populate("book");

    res.json(myBorrowings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения книг пользователя" });
  }
};