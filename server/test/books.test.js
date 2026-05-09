import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import Book from "../models/Book.js";
import Borrowing from "../models/Borrowing.js";
import User from "../models/User.js";
import { appPromise } from "./setup.js";
import { activateRegisteredUser } from "./activateRegisteredUser.js";

const __dirnameTest = path.dirname(fileURLToPath(import.meta.url));

let app;

describe("Books API", () => {
  beforeAll(async () => {
    app = await appPromise;
    await mongoose.connection.asPromise();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("GET /api/books возвращает список книг", async () => {
    const res = await request(app).get("/api/books");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("books");
    expect(res.body).toHaveProperty("page");
    expect(res.body).toHaveProperty("pages");
    expect(res.body).toHaveProperty("total");
    expect(Array.isArray(res.body.books)).toBe(true);
  });

  it("GET /api/books?search=тест экранирует поиск", async () => {
    const res = await request(app).get("/api/books").query({ search: "тест" });
    expect(res.status).toBe(200);
    expect(res.body.books).toBeDefined();
  });

  it("GET /api/books?page=1&limit=5 поддерживает пагинацию", async () => {
    const res = await request(app).get("/api/books").query({ page: 1, limit: 5 });
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.books.length).toBeLessThanOrEqual(5);
  });

  it("GET /api/books?page=2&limit=10&sort=title не возвращает 500", async () => {
    const res = await request(app)
      .get("/api/books")
      .query({ page: 2, limit: 10, sort: "title" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("books");
  });

  it("GET /api/books с опечаткой находит книгу по нечёткому совпадению", async () => {
    await Book.create({
      title: "Идиот",
      author: "Ф.М. Достоевский",
      genre: "Классика",
      available: true,
    });
    const res = await request(app).get("/api/books").query({ search: "Идгот", limit: 20 });
    expect(res.status).toBe(200);
    expect(res.body.fuzzy).toBe(true);
    expect(res.body.books.some((b) => /идиот/i.test(b.title))).toBe(true);
  });

  it("GET /api/books с частичным вводом и опечаткой (иды → Идиот)", async () => {
    const suffix = `иди-${Date.now()}`;
    await Book.create({
      title: `Идиот ${suffix}`,
      author: "Автор",
      genre: "Классика",
      available: true,
    });
    const res = await request(app).get("/api/books").query({ search: "иды", limit: 50 });
    expect(res.status).toBe(200);
    expect(res.body.fuzzy).toBe(true);
    expect(res.body.books.some((b) => b.title.includes(`Идиот ${suffix}`))).toBe(true);
  });

  it("GET /api/books с двухбуквенным запросом и опечаткой (Еф → Евгений)", async () => {
    const suffix = `евг-${Date.now()}`;
    await Book.create({
      title: `Евгений Онегин ${suffix}`,
      author: "А.С. Пушкин",
      genre: "Классика",
      available: true,
    });
    const res = await request(app).get("/api/books").query({ search: "Еф", limit: 50 });
    expect(res.status).toBe(200);
    expect(res.body.fuzzy).toBe(true);
    expect(res.body.books.some((b) => b.title.includes(`Евгений Онегин ${suffix}`))).toBe(true);
  });

  it("GET /api/books?search сначала книги с началом названия, затем с вхождением внутри", async () => {
    const suffix = `sort-${Date.now()}`;
    await Book.create({
      title: `Ааа Моя война ${suffix}`,
      author: "Автор",
      genre: "Тест",
      available: true,
    });
    await Book.create({
      title: `Война ${suffix}`,
      author: "Автор",
      genre: "Тест",
      available: true,
    });
    const res = await request(app)
      .get("/api/books")
      .query({ search: `война ${suffix}`, limit: 20, sort: "title" });
    expect(res.status).toBe(200);
    const titles = res.body.books.map((b) => b.title);
    const iPrefix = titles.findIndex((t) => t.includes(`Война ${suffix}`));
    const iInfix = titles.findIndex((t) => t.includes(`Ааа Моя война ${suffix}`));
    expect(iPrefix).toBeGreaterThanOrEqual(0);
    expect(iInfix).toBeGreaterThanOrEqual(0);
    expect(iPrefix).toBeLessThan(iInfix);
  });

  it("GET /api/books находит английское название по похожим русским буквам", async () => {
    const suffix = `en-${Date.now()}`;
    await Book.create({
      title: `Clean Code ${suffix}`,
      author: "Robert C. Martin",
      genre: "Программирование",
      available: true,
    });
    const res = await request(app).get("/api/books").query({ search: `Сlean Cоde ${suffix}`, limit: 20 });
    expect(res.status).toBe(200);
    expect(res.body.books.some((b) => String(b.title).includes(`Clean Code ${suffix}`))).toBe(true);
  });

  it("GET /api/books находит русское название по похожим английским буквам", async () => {
    const suffix = `ru-${Date.now()}`;
    await Book.create({
      title: `Преступление ${suffix}`,
      author: "Ф.М. Достоевский",
      genre: "Классика",
      available: true,
    });
    const res = await request(app).get("/api/books").query({ search: `PpecTуплeниe ${suffix}`, limit: 20 });
    expect(res.status).toBe(200);
    expect(res.body.books.some((b) => String(b.title).includes(`Преступление ${suffix}`))).toBe(true);
  });

  it("GET /api/books/:id без авторизации возвращает книгу без borrowedByMe", async () => {
    const book = await Book.create({
      title: "Публичная карточка",
      author: "Автор",
      genre: "Тест",
      available: true,
    });
    const res = await request(app).get(`/api/books/${book._id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Публичная карточка");
    expect(res.body.borrowedByMe).toBe(false);
    expect(res.body.filePath).toBeUndefined();
    expect(res.body.hasBookFile).toBe(false);
  });

  it("GET /api/books/:id с авторизацией возвращает книгу и borrowedByMe", async () => {
    const book = await Book.create({
      title: "Книга для карточки",
      author: "Автор",
      description: "Описание тест",
      genre: "Тест",
      available: true,
    });
    const userEmail = `reader-detail-${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({
      name: "Читатель",
      surname: "",
      email: userEmail,
      password: "pass123",
    });
    await activateRegisteredUser(app, userEmail);
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: userEmail, password: "pass123" });

    const res = await agent.get(`/api/books/${book._id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Книга для карточки");
    expect(res.body.description).toBe("Описание тест");
    expect(res.body.borrowedByMe).toBe(false);
  });

  it("GET /api/books/:id/read?plain=1 отдаёт text/plain при активной выдаче (TXT)", async () => {
    const uploadBooksDir = path.join(__dirnameTest, "..", "uploads", "books");
    fs.mkdirSync(uploadBooksDir, { recursive: true });

    const bookId = new mongoose.Types.ObjectId();
    const txtPath = path.join(uploadBooksDir, `${bookId}.txt`);
    fs.writeFileSync(txtPath, "Строка A.\n\nАбзац B.", "utf-8");

    await Book.create({
      _id: bookId,
      title: "Книга для plain",
      author: "Тестовый автор",
      genre: "Тест",
      available: false,
      filePath: txtPath,
      fileType: "txt",
    });

    const userEmail = `txt-plain-${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({
      name: "Читатель",
      surname: "",
      email: userEmail,
      password: "pass123",
    });
    await activateRegisteredUser(app, userEmail);
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ email: userEmail, password: "pass123" });

    const user = await User.findOne({ email: userEmail });
    await Borrowing.create({ user: user._id, book: bookId, status: "active" });

    try {
      const res = await agent.get(`/api/books/${bookId}/read`).query({ plain: "1" });
      expect(res.status).toBe(200);
      expect(String(res.headers["content-type"] || "")).toMatch(/text\/plain/);
      expect(res.text).toContain("Строка A");
    } finally {
      try {
        fs.unlinkSync(txtPath);
      } catch {}
    }
  });
});
