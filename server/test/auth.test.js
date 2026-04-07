import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import PendingRegistration from "../models/PendingRegistration.js";
import { appPromise } from "./setup.js";
import { activateRegisteredUser } from "./activateRegisteredUser.js";

let app;

describe("Auth API", () => {
  beforeAll(async () => {
    app = await appPromise;
    await mongoose.connection.asPromise();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("POST /api/auth/register сохраняет заявку вне users до подтверждения email (без cookie)", async () => {
    const email = `test-${Date.now()}@example.com`;
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Тест",
        surname: "Тестов",
        email,
        password: "password123",
      });
    expect(res.status).toBe(201);
    expect(res.body.registrationPending).toBe(true);
    expect(res.body.email).toBe(email);
    expect(res.body.user).toBeUndefined();
    expect(res.body.token).toBeUndefined();
    const setCookie = res.headers["set-cookie"];
    expect(setCookie == null || !String(setCookie).includes("token=")).toBe(true);
    expect(await User.findOne({ email })).toBeNull();
    expect(await PendingRegistration.findOne({ email })).toBeTruthy();
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

  it("POST /api/auth/verify-email активирует аккаунт по токену", async () => {
    const email = `verify-${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({
      name: "Вериф",
      surname: "",
      email,
      password: "pass123",
    });
    await activateRegisteredUser(app, email);
    const u = await User.findOne({ email });
    expect(u.accountStatus).toBe("active");
    expect(u.emailVerificationToken).toBeUndefined();
  });

  it("POST /api/auth/login после подтверждения email возвращает user и cookie", async () => {
    const email = `login-${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({
      name: "Логин",
      surname: "",
      email,
      password: "pass123",
    });
    await activateRegisteredUser(app, email);

    const res = await request(app).post("/api/auth/login").send({ email, password: "pass123" });
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.accountStatus).toBe("active");
    expect(res.body.token).toBeUndefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("POST /api/auth/login до подтверждения email возвращает 403", async () => {
    const email = `pending-${Date.now()}@example.com`;
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Ожидание", surname: "", email, password: "pass123" });

    const res = await request(app).post("/api/auth/login").send({ email, password: "pass123" });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/подтвердите|email/i);
  });

  it("POST /api/auth/login отклоняет неверный пароль", async () => {
    const email = `wrong-${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({
      name: "Пароль",
      surname: "",
      email,
      password: "correct",
    });
    await activateRegisteredUser(app, email);

    const res = await request(app).post("/api/auth/login").send({ email, password: "wrong" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Неверный");
  });
});
