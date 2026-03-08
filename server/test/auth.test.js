import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { appPromise } from "./setup.js";

let app;

describe("Auth API", () => {
  beforeAll(async () => {
    app = await appPromise;
    await mongoose.connection.asPromise();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("POST /api/auth/register создаёт пользователя", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Тест",
        surname: "Тестов",
        email: `test-${Date.now()}@example.com`,
        password: "password123",
      });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toContain("@example.com");
    expect(res.body.user.name).toBe("Тест");
    expect(res.body.user.role).toBeDefined();
    expect(res.body.token).toBeUndefined();
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toContain("token=");
  });

  it("POST /api/auth/register отклоняет короткое имя", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "А",
        surname: "",
        email: "a@b.com",
        password: "password123",
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("2");
  });

  it("POST /api/auth/login возвращает user и cookie", async () => {
    const email = `login-${Date.now()}@example.com`;
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Логин", surname: "", email, password: "pass123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "pass123" });
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeUndefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("POST /api/auth/login отклоняет неверный пароль", async () => {
    const email = `wrong-${Date.now()}@example.com`;
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Пароль", surname: "", email, password: "correct" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "wrong" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Неверный");
  });
});
