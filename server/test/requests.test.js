import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { appPromise } from "./setup.js";

let app;
let userAgent;
let adminAgent;
let requestId;
let userEmail;

describe("Requests API", () => {
  beforeAll(async () => {
    app = await appPromise;
    await mongoose.connection.asPromise();

    userEmail = `user-req-${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({
      name: "Пользователь",
      surname: "",
      email: userEmail,
      password: "pass123",
    });
    userAgent = request.agent(app);
    await userAgent.post("/api/auth/login").send({ email: userEmail, password: "pass123" });

    const adminEmail = `admin-req-${Date.now()}@example.com`;
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

  it("POST /api/requests создаёт обращение", async () => {
    const res = await userAgent.post("/api/requests").send({
      subject: "Вопрос по каталогу",
      message: "Подскажите, когда появятся новые книги?",
    });
    expect(res.status).toBe(201);
    expect(res.body.subject).toBe("Вопрос по каталогу");
    expect(res.body.status).toBe("new");
    expect(res.body._id).toBeDefined();
    requestId = res.body._id;
  });

  it("POST /api/requests отклоняет короткую тему", async () => {
    const res = await userAgent.post("/api/requests").send({
      subject: "А",
      message: "Длинное сообщение для валидации",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("2");
  });

  it("GET /api/requests возвращает мои обращения", async () => {
    const res = await userAgent.get("/api/requests");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((r) => r._id === requestId)).toBe(true);
  });

  it("GET /api/requests/all возвращает все обращения (admin)", async () => {
    const res = await adminAgent.get("/api/requests/all");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("PATCH /api/requests/:id обновляет статус (admin)", async () => {
    const res = await adminAgent.patch(`/api/requests/${requestId}`).send({
      status: "in_progress",
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("in_progress");
  });

  it("user не может получить /api/requests/all (403)", async () => {
    const res = await userAgent.get("/api/requests/all");
    expect(res.status).toBe(403);
  });
});
