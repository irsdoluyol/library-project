import request from "supertest";
import { expect } from "vitest";
import PendingRegistration from "../models/PendingRegistration.js";
import User from "../models/User.js";

export async function activateRegisteredUser(app, email) {
  const pr = await PendingRegistration.findOne({ email }).select("+token");
  if (pr?.token) {
    const res = await request(app).post("/api/auth/verify-email").send({ token: pr.token });
    expect(res.status).toBe(200);
    return;
  }
  const u = await User.findOne({ email }).select("+emailVerificationToken");
  expect(u?.emailVerificationToken).toBeDefined();
  const res = await request(app)
    .post("/api/auth/verify-email")
    .send({ token: u.emailVerificationToken });
  expect(res.status).toBe(200);
}
