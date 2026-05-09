import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Book from "../models/Book.js";
import Borrowing from "../models/Borrowing.js";
import { uploadDir, coverDir } from "../config/multer.js";
import { logCatalog, logBorrowing } from "../utils/logger.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import {
  bestMatchDistance,
  maxEditDistanceForQueryLength,
  searchMatchTier,
} from "../utils/levenshtein.js";

const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);

const FUZZY_SCAN_LIMIT = 3000;

const ALLOWED_SORT = ["createdAt", "-createdAt", "title", "-title", "author", "-author", "year", "-year"];
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 12;

const CROSS_SCRIPT_LOOKALIKE_TO_LATIN = {
  а: "a",
  А: "A",
  в: "b",
  В: "B",
  с: "c",
  С: "C",
  е: "e",
  Е: "E",
  н: "h",
  Н: "H",
  к: "k",
  К: "K",
  м: "m",
  М: "M",
  о: "o",
  О: "O",
  р: "p",
  Р: "P",
  т: "t",
  Т: "T",
  у: "y",
  У: "Y",
  х: "x",
  Х: "X",
};

function normalizeLookalikeChars(value) {
  return String(value)
    .split("")
    .map((char) => {
      const converted = CROSS_SCRIPT_LOOKALIKE_TO_LATIN[char];
      return converted || char;
    })
    .join("");
}

function searchVariantsForLayout(rawSearch) {
  const base = String(rawSearch || "").trim();
  if (!base) return [];
  const variants = new Set([base]);
  variants.add(normalizeLookalikeChars(base));
  return [...variants].filter(Boolean);
}

function normalizeSortParam(raw) {
  if (raw == null) return "title";
  const s = Array.isArray(raw) ? String(raw[0]) : String(raw);
  const trimmed = s.trim();
  if (!trimmed) return "title";
  const base = trimmed.includes(":") ? trimmed.split(":")[0].trim() : trimmed;
  return ALLOWED_SORT.includes(base) ? base : "title";
}

function mongoSortFieldsFromParam(sortParam) {
  const map = {
    createdAt: { createdAt: 1 },
    "-createdAt": { createdAt: -1 },
    title: { title: 1 },
    "-title": { title: -1 },
    author: { author: 1 },
    "-author": { author: -1 },
    year: { year: 1 },
    "-year": { year: -1 },
  };
  return map[sortParam] || { title: 1 };
}

export const getBooks = async (req, res) => {
  try {
    let { search, genre, page = 1, limit = DEFAULT_LIMIT, sort: sortRaw } = req.query;

    limit = Math.min(Math.max(1, Number(limit) || DEFAULT_LIMIT), MAX_LIMIT);
    page = Math.max(1, Number(page) || 1);
    const sort = normalizeSortParam(sortRaw);

    const query = {};
    let searchEscaped = "";
    let searchVariants = [];

    if (search && typeof search === "string") {
      searchVariants = searchVariantsForLayout(search);
      const escapedVariants = searchVariants
        .map((v) => escapeRegex(v))
        .filter(Boolean);
      if (escapedVariants.length) {
        searchEscaped = escapedVariants[0];
        query.$or = escapedVariants.flatMap((escaped) => {
          const searchRegex = { $regex: escaped, $options: "i" };
          return [{ title: searchRegex }, { author: searchRegex }];
        });
      }
    }

    if (genre && typeof genre === "string") {
      const g = genre.trim();
      if (g) query.genre = { $regex: `^${escapeRegex(g)}$`, $options: "i" };
    }

    const searchTrim = typeof search === "string" ? search.trim() : "";
    const useSearchRelevance = searchTrim.length > 0 && searchEscaped;

    let books;
    let total;
    let fuzzy = false;

    if (useSearchRelevance) {
      const sortStage = { _searchRank: 1, ...mongoSortFieldsFromParam(sort) };
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            _searchRank: {
              $switch: {
                branches: [
                  ...searchVariants.map((variant) => ({
                    case: {
                      $regexMatch: {
                        input: { $ifNull: ["$title", ""] },
                        regex: `^${escapeRegex(variant)}`,
                        options: "i",
                      },
                    },
                    then: 0,
                  })),
                  ...searchVariants.map((variant) => ({
                    case: {
                      $regexMatch: {
                        input: { $ifNull: ["$title", ""] },
                        regex: escapeRegex(variant),
                        options: "i",
                      },
                    },
                    then: 1,
                  })),
                  ...searchVariants.map((variant) => ({
                    case: {
                      $regexMatch: {
                        input: { $ifNull: ["$author", ""] },
                        regex: `^${escapeRegex(variant)}`,
                        options: "i",
                      },
                    },
                    then: 2,
                  })),
                  ...searchVariants.map((variant) => ({
                    case: {
                      $regexMatch: {
                        input: { $ifNull: ["$author", ""] },
                        regex: escapeRegex(variant),
                        options: "i",
                      },
                    },
                    then: 3,
                  })),
                ],
                default: 4,
              },
            },
          },
        },
        { $sort: sortStage },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $project: { _searchRank: 0 } },
      ];
      [books, total] = await Promise.all([
        Book.aggregate(pipeline),
        Book.countDocuments(query),
      ]);
    } else {
      books = await Book.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();
      total = await Book.countDocuments(query);
    }

    if (searchTrim.length >= 2 && total === 0) {
      const maxDist = maxEditDistanceForQueryLength(searchTrim.length);
      const fuzzyQueries = searchVariantsForLayout(searchTrim);
      const genreOnly = {};
      if (genre && typeof genre === "string") {
        const g = genre.trim();
        if (g) genreOnly.genre = { $regex: `^${escapeRegex(g)}$`, $options: "i" };
      }
      const candidates = await Book.find(genreOnly).sort(sort).limit(FUZZY_SCAN_LIMIT).lean();

      const scored = candidates
        .map((doc) => ({
          doc,
          d: Math.min(
            ...fuzzyQueries.map((q) => bestMatchDistance(q, doc.title, doc.author))
          ),
        }))
        .filter(({ d }) => d <= maxDist)
        .sort((a, b) => {
          const ta = Math.min(
            ...fuzzyQueries.map((q) => searchMatchTier(q, a.doc.title, a.doc.author))
          );
          const tb = Math.min(
            ...fuzzyQueries.map((q) => searchMatchTier(q, b.doc.title, b.doc.author))
          );
          if (ta !== tb) return ta - tb;
          if (a.d !== b.d) return a.d - b.d;
          return String(a.doc.title).localeCompare(String(b.doc.title), "ru");
        });

      total = scored.length;
      const pages = Math.ceil(total / limit) || 1;
      const slice = scored.slice((page - 1) * limit, page * limit);
      books = slice.map(({ doc }) => doc);
      fuzzy = total > 0;

      return res.json({
        total,
        page: Number(page),
        pages,
        books,
        fuzzy,
      });
    }

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      books,
      fuzzy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения книг" });
  }
};

export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: "Некорректный ID книги" });
    }
    const book = await Book.findById(id).lean();
    if (!book) {
      return res.status(404).json({ message: "Книга не найдена" });
    }
    const userId = req.user?.id || req.user?._id;
    let borrowedByMe = false;
    if (userId) {
      const activeBorrow = await Borrowing.findOne({
        user: userId,
        book: id,
        status: "active",
      })
        .select("_id")
        .lean();
      borrowedByMe = !!activeBorrow;
    }
    const { filePath, ...bookRest } = book;
    res.json({
      ...bookRest,
      ...(userId ? { filePath } : { hasBookFile: Boolean(filePath) }),
      borrowedByMe,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения книги" });
  }
};

const BOOK_CREATE_FIELDS = ["title", "author", "description", "year", "genre"];

export const createBook = async (req, res) => {
  try {
    const { title, author } = req.body || {};
    const t = (title ?? "").trim();
    const a = (author ?? "").trim();
    if (!t) {
      return res.status(400).json({ message: "Название книги обязательно" });
    }
    if (!a) {
      return res.status(400).json({ message: "Автор обязателен" });
    }
    const payload = { title: t, author: a };
    for (const field of BOOK_CREATE_FIELDS) {
      if (req.body[field] !== undefined && field !== "title" && field !== "author") {
        payload[field] = req.body[field];
      }
    }
    const book = await Book.create(payload);
    const adminId = req.user?.id || req.user?._id;
    logCatalog.create(adminId, book);
    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка создания книги" });
  }
};

const BOOK_UPDATE_FIELDS = ["title", "author", "description", "year", "genre", "available"];

export const updateBook = async (req, res) => {
  try {
    const { title, author } = req.body || {};
    if (title !== undefined) {
      const t = (title ?? "").trim();
      if (!t) return res.status(400).json({ message: "Название не может быть пустым" });
    }
    if (author !== undefined) {
      const a = (author ?? "").trim();
      if (!a) return res.status(400).json({ message: "Автор не может быть пустым" });
    }

    const updates = {};
    for (const field of BOOK_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Некорректный ID книги" });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: "after" }
    );

    if (!book) {
      return res.status(404).json({ message: "Книга не найдена" });
    }

    const adminId = req.user?.id || req.user?._id;
    logCatalog.update(adminId, book._id);
    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка обновления книги" });
  }
};

export const deleteBook = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Некорректный ID книги" });
    }
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Книга не найдена" });
    }

    const adminId = req.user?.id || req.user?._id;
    logCatalog.delete(adminId, book._id, book.title);

    if (book.filePath && fs.existsSync(book.filePath)) {
      fs.unlinkSync(book.filePath);
    }
    if (book.coverPath && fs.existsSync(book.coverPath)) {
      fs.unlinkSync(book.coverPath);
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

    if (!isValidId(bookId)) {
      return res.status(400).json({ message: "Некорректный ID книги" });
    }

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

    logBorrowing.borrow(userId, bookId);
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

    if (!isValidId(bookId)) {
      return res.status(400).json({ message: "Некорректный ID книги" });
    }

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

    logBorrowing.return(userId, bookId);
    res.json({ message: "Книга возвращена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка возврата книги" });
  }
};

export const uploadBookFile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: "Некорректный ID книги" });
    }
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
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    console.error("[uploadBookFile]", error);
    const msg = error.message || "Ошибка загрузки файла";
    res.status(500).json({ message: msg });
  }
};

export const uploadCover = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: "Некорректный ID книги" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Выберите изображение (JPG, PNG, WebP)" });
    }

    const book = await Book.findById(id);
    if (!book) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ message: "Книга не найдена" });
    }

    if (book.coverPath && fs.existsSync(book.coverPath)) {
      fs.unlinkSync(book.coverPath);
    }

    book.coverPath = req.file.path;
    await book.save();

    res.json({ message: "Обложка загружена", book });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    console.error("[uploadCover]", error);
    res.status(500).json({ message: error.message || "Ошибка загрузки обложки" });
  }
};

export const getCover = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Некорректный ID книги" });
    }
    const book = await Book.findById(req.params.id);
    if (!book?.coverPath || !fs.existsSync(book.coverPath)) {
      return res.status(404).json({ message: "Обложка не найдена" });
    }

    const ext = path.extname(book.coverPath).toLowerCase();
    const types = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
    res.setHeader("Content-Type", types[ext] || "image/jpeg");
    fs.createReadStream(book.coverPath).pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Ошибка чтения обложки" });
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
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("X-Content-Type-Options", "nosniff");
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
      const openInBrowser = req.query.plain === "1" || req.query.view === "raw";
      if (openInBrowser) {
        const safeName = encodeURIComponent(
          `${(book.title || "book").replace(/[/\\]/g, " ")}.txt`
        );
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${safeName}`);
        res.setHeader("Cache-Control", "private, no-store");
        res.setHeader("X-Content-Type-Options", "nosniff");
        return res.send(text);
      }
      res.json({ content: text });
    }
  } catch (error) {
    console.error("[readBookFile]", error);
    res.status(500).json({ message: error.message || "Ошибка чтения файла" });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await import("../models/User.js").then((m) => m.default.findById(userId).populate("favorites"));
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    const books = user.favorites || [];
    res.json({ books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения сохранённых книг" });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const bookId = req.params.id;
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Книга не найдена" });
    const favorites = user.favorites || [];
    const idx = favorites.findIndex((id) => String(id) === String(bookId));
    if (idx >= 0) {
      favorites.splice(idx, 1);
      await user.save();
      return res.json({ added: false });
    }
    favorites.push(bookId);
    await user.save();
    res.json({ added: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка обновления сохранённого" });
  }
};

export const getMyBooks = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const myBorrowings = await Borrowing.find({
      user: userId,
      status: "active",
    }).populate("book");

    myBorrowings.sort((a, b) => {
      const tA = (a.book?.title || "").toLowerCase();
      const tB = (b.book?.title || "").toLowerCase();
      return tA.localeCompare(tB);
    });

    res.json(myBorrowings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения книг пользователя" });
  }
};