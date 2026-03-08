import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { appPromise } from "./setup.js";

let app;
beforeAll(async () => {
  app = await appPromise;
});

describe("Health API", () => {
  it("GET /api/health возвращает ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, message: "API доступен" });
  });

  it("GET / возвращает приветствие", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Library API");
  });

  it("неизвестный маршрут возвращает 404", async () => {
    const res = await request(app).get("/api/unknown");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Маршрут не найден");
  });
});
