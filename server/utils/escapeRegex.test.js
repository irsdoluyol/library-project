import { describe, it, expect } from "vitest";
import { escapeRegex } from "./escapeRegex.js";

describe("escapeRegex", () => {
  it("экранирует спецсимволы . * + ? ^ $ { } ( ) | [ ] \\", () => {
    expect(escapeRegex("a.b")).toBe("a\\.b");
    expect(escapeRegex("a*b")).toBe("a\\*b");
    expect(escapeRegex("a+b")).toBe("a\\+b");
    expect(escapeRegex("a?b")).toBe("a\\?b");
    expect(escapeRegex("a[b]")).toBe("a\\[b\\]");
    expect(escapeRegex("a(b)")).toBe("a\\(b\\)");
    expect(escapeRegex("a|b")).toBe("a\\|b");
    expect(escapeRegex("a\\b")).toBe("a\\\\b");
  });

  it("возвращает пустую строку для не-строки", () => {
    expect(escapeRegex(null)).toBe("");
    expect(escapeRegex(undefined)).toBe("");
    expect(escapeRegex(123)).toBe("");
  });

  it("не меняет обычные символы", () => {
    expect(escapeRegex("Война и мир")).toBe("Война и мир");
    expect(escapeRegex("Толстой")).toBe("Толстой");
  });
});
