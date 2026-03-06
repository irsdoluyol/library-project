import fs from "fs";
import path from "path";
import Book from "../models/Book.js";
import Borrowing from "../models/Borrowing.js";
import { uploadDir } from "../config/multer.js";

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
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Книга не найдена" });
    }

    if (book.filePath && fs.existsSync(book.filePath)) {
      fs.unlinkSync(book.filePath);
    }

    await Book.findByIdAndDelete(req.params.id);

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

export const uploadBookFile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: "Файл не загружен. Выберите PDF или TXT." });
    }

    const book = await Book.findById(id);
    if (!book) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ message: "Книга не найдена" });
    }

    if (book.filePath && fs.existsSync(book.filePath)) {
      fs.unlinkSync(book.filePath);
    }

    const ext = path.extname(req.file.filename).toLowerCase().slice(1);
    book.filePath = req.file.path;
    book.fileType = ext === "pdf" ? "pdf" : "txt";
    await book.save();

    res.json({ message: "Файл загружен", book });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {}
    }
    console.error("[uploadBookFile]", error);
    const msg = error.message || "Ошибка загрузки файла";
    res.status(500).json({ message: msg });
  }
};

export const readBookFile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const borrowing = await Borrowing.findOne({
      user: userId,
      book: id,
      status: "active",
    });
    if (!borrowing) {
      return res.status(403).json({ message: "Книга не выдана вам" });
    }

    const book = await Book.findById(id);
    if (!book || !book.filePath) {
      return res.status(404).json({ message: "Файл книги не найден" });
    }

    let filePath = path.resolve(book.filePath);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(uploadDir, `${id}.${book.fileType || "pdf"}`);
    }
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Файл не найден на сервере" });
    }

    if (book.fileType === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(book.title || "book")}.pdf"`);
      const stream = fs.createReadStream(filePath);
      stream.on("error", (err) => {
        console.error("[readBookFile] stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Ошибка чтения файла" });
        }
      });
      stream.pipe(res);
    } else {
      const text = fs.readFileSync(filePath, "utf-8");
      res.json({ content: text });
    }
  } catch (error) {
    console.error("[readBookFile]", error);
    res.status(500).json({ message: error.message || "Ошибка чтения файла" });
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