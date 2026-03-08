import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Book from "../models/Book.js";
import { appPromise } from "./setup.js";

let app;
let adminAgent;
let bookId;

describe("Admin API (books CRUD)", () => {
  beforeAll(async () => {
    app = await appPromise;
    await mongoose.connection.asPromise();

    const adminEmail = `admin-${Date.now()}@example.com`;
    await User.create({
      name: "Админ",
      surname: "",
      email: adminEmail,
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
    });
    adminAgent = request.agent(app);
    await adminAgent.post("/api/auth/login").send({ email: adminEmail, password: "admin123" });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("POST /api/books создаёт книгу (admin)", async () => {
    const res = await adminAgent.post("/api/books").send({
      title: "Тестовая книга",
      author: "Тестовый автор",
      description: "Описание",
      year: 2024,
      genre: "Роман",
    });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Тестовая книга");
    expect(res.body.author).toBe("Тестовый автор");
    expect(res.body._id).toBeDefined();
    bookId = res.body._id;
  });

  it("POST /api/books отклоняет без названия", async () => {
    const res = await adminAgent.post("/api/books").send({
      title: "",
      author: "Автор",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Название");
  });

  it("PUT /api/books/:id обновляет книгу (admin)", async () => {
    const res = await adminAgent.put(`/api/books/${bookId}`).send({
      title: "Обновлённое название",
      description: "Новое описание",
    });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Обновлённое название");
    expect(res.body.description).toBe("Новое описание");
  });

  it("DELETE /api/books/:id удаляет книгу (admin)", async () => {
    const res = await adminAgent.delete(`/api/books/${bookId}`);
    expect(res.status).toBe(200);
    const book = await Book.findById(bookId);
    expect(book).toBeNull();
  });

  it("user не может создать книгу (403)", async () => {
    const userEmail = `user-${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({
      name: "Юзер",
      surname: "",
      email: userEmail,
      password: "pass123",
    });
    const userAgent = request.agent(app);
    await userAgent.post("/api/auth/login").send({ email: userEmail, password: "pass123" });

    const res = await userAgent.post("/api/books").send({
      title: "Чужая книга",
      author: "Автор",
    });
    expect(res.status).toBe(403);
  });
});
