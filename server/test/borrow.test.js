import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Book from "../models/Book.js";
import Borrowing from "../models/Borrowing.js";
import { appPromise } from "./setup.js";

let app;
let adminAgent;
let userAgent;
let bookId;
let userEmail;

describe("Borrow / Return API", () => {
  beforeAll(async () => {
    app = await appPromise;
    await mongoose.connection.asPromise();

    const adminEmail = `admin-borrow-${Date.now()}@example.com`;
    await User.create({
      name: "Админ",
      surname: "",
      email: adminEmail,
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
    });
    adminAgent = request.agent(app);
    await adminAgent.post("/api/auth/login").send({ email: adminEmail, password: "admin123" });

    const createRes = await adminAgent.post("/api/books").send({
      title: "Книга для выдачи",
      author: "Автор",
      genre: "Роман",
    });
    bookId = createRes.body._id;

    userEmail = `user-borrow-${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({
      name: "Читатель",
      surname: "",
      email: userEmail,
      password: "pass123",
    });
    userAgent = request.agent(app);
    await userAgent.post("/api/auth/login").send({ email: userEmail, password: "pass123" });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("POST /api/books/:id/borrow выдаёт книгу", async () => {
    const res = await userAgent.post(`/api/books/${bookId}/borrow`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
    const borrowing = await Borrowing.findOne({ book: bookId, status: "active" });
    expect(borrowing).toBeDefined();
  });

  it("книга становится недоступной после выдачи", async () => {
    const book = await Book.findById(bookId);
    expect(book.available).toBe(false);
  });

  it("POST /api/books/:id/return возвращает книгу", async () => {
    const res = await userAgent.post(`/api/books/${bookId}/return`);
    expect(res.status).toBe(200);
    const book = await Book.findById(bookId);
    expect(book.available).toBe(true);
  });

  it("неавторизованный запрос borrow возвращает 401", async () => {
    const newBook = await Book.create({ title: "Новая", author: "Автор", available: true });
    const res = await request(app).post(`/api/books/${newBook._id}/borrow`);
    expect(res.status).toBe(401);
    await Book.findByIdAndDelete(newBook._id);
  });
});
