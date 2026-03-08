import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateEnv } from "./validateEnv.js";

describe("validateEnv", () => {
  let exitSpy;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`exit:${code}`);
    });
  });

  afterEach(() => {
    exitSpy.mockRestore();
    process.env.MONGO_URI = originalEnv.MONGO_URI;
    process.env.JWT_SECRET = originalEnv.JWT_SECRET;
  });

  it("вызывает process.exit(1) при отсутствии MONGO_URI", () => {
    process.env.MONGO_URI = "";
    process.env.JWT_SECRET = "secret";
    expect(() => validateEnv()).toThrow("exit:1");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("вызывает process.exit(1) при отсутствии JWT_SECRET", () => {
    process.env.MONGO_URI = "mongodb://localhost";
    process.env.JWT_SECRET = "";
    expect(() => validateEnv()).toThrow("exit:1");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("вызывает process.exit(1) при пустых пробелах в переменных", () => {
    process.env.MONGO_URI = "   ";
    process.env.JWT_SECRET = "x";
    expect(() => validateEnv()).toThrow("exit:1");
  });

  it("не вызывает process.exit при наличии всех переменных", () => {
    process.env.MONGO_URI = "mongodb://localhost";
    process.env.JWT_SECRET = "secret";
    expect(() => validateEnv()).not.toThrow();
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
