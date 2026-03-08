import { describe, it, expect } from "vitest";
import { validateRegister, REGISTER_RULES } from "./validation.js";

describe("validateRegister", () => {
  it("returns empty object for valid data", () => {
    const data = {
      name: "Мария",
      surname: "Иванова",
      email: "maria@example.com",
      password: "secret123",
    };
    expect(validateRegister(data)).toEqual({});
  });

  it("returns error when name is too short", () => {
    const data = {
      name: "М",
      surname: "",
      email: "test@test.com",
      password: "123456",
    };
    const errors = validateRegister(data);
    expect(errors.name).toContain("2");
  });

  it("returns error when name is empty", () => {
    const data = {
      name: "   ",
      surname: "",
      email: "test@test.com",
      password: "123456",
    };
    const errors = validateRegister(data);
    expect(errors.name).toBeDefined();
  });

  it("returns error when name exceeds max length", () => {
    const data = {
      name: "А".repeat(51),
      surname: "",
      email: "test@test.com",
      password: "123456",
    };
    const errors = validateRegister(data);
    expect(errors.name).toContain("50");
  });

  it("returns error for invalid email format", () => {
    const data = {
      name: "Мария",
      surname: "",
      email: "invalid-email",
      password: "123456",
    };
    const errors = validateRegister(data);
    expect(errors.email).toBeDefined();
  });

  it("returns error when email is empty", () => {
    const data = {
      name: "Мария",
      surname: "",
      email: "",
      password: "123456",
    };
    const errors = validateRegister(data);
    expect(errors.email).toBeDefined();
  });

  it("returns error when password is too short", () => {
    const data = {
      name: "Мария",
      surname: "",
      email: "test@test.com",
      password: "12345",
    };
    const errors = validateRegister(data);
    expect(errors.password).toContain("6");
  });

  it("accepts optional surname", () => {
    const data = {
      name: "Мария",
      surname: "",
      email: "test@test.com",
      password: "123456",
    };
    expect(validateRegister(data)).toEqual({});
  });

  it("validates surname max length when provided", () => {
    const data = {
      name: "Мария",
      surname: "А".repeat(51),
      email: "test@test.com",
      password: "123456",
    };
    const errors = validateRegister(data);
    expect(errors.surname).toBeDefined();
  });
});

describe("REGISTER_RULES", () => {
  it("has required fields defined", () => {
    expect(REGISTER_RULES.name).toBeDefined();
    expect(REGISTER_RULES.email).toBeDefined();
    expect(REGISTER_RULES.password).toBeDefined();
  });
});
