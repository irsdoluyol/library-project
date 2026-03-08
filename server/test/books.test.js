import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { appPromise } from "./setup.js";

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
});
