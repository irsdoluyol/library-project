import { describe, it, expect } from "vitest";
import {
  levenshtein,
  bestMatchDistance,
  maxEditDistanceForQueryLength,
  searchMatchTier,
} from "./levenshtein.js";

describe("levenshtein", () => {
  it("returns 0 for equal strings", () => {
    expect(levenshtein("a", "a")).toBe(0);
    expect(levenshtein("Идиот", "Идиот")).toBe(0);
  });

  it("handles one-character typo in Идиот / Идгот", () => {
    expect(levenshtein("идгот", "идиот")).toBe(1);
  });

  it("bestMatchDistance uses title", () => {
    expect(bestMatchDistance("Идгот", "Идиот", "Достоевский")).toBe(1);
  });

  it("bestMatchDistance matches partial word with typo (иды → идиот)", () => {
    expect(bestMatchDistance("иды", "Идиот", "Достоевский")).toBe(1);
  });

  it("bestMatchDistance matches 2-letter typo at word start (Еф → Евгений)", () => {
    expect(bestMatchDistance("еф", "Евгений Онегин", "Пушкин")).toBe(1);
  });

  it("maxEditDistanceForQueryLength scales with length", () => {
    expect(maxEditDistanceForQueryLength(1)).toBe(0);
    expect(maxEditDistanceForQueryLength(2)).toBe(1);
    expect(maxEditDistanceForQueryLength(3)).toBe(1);
    expect(maxEditDistanceForQueryLength(8)).toBe(2);
    expect(maxEditDistanceForQueryLength(20)).toBe(3);
  });

  it("searchMatchTier prefers title prefix over infix", () => {
    expect(searchMatchTier("война", "Война и мир", "X")).toBe(0);
    expect(searchMatchTier("война", "Моя война", "X")).toBe(1);
    expect(searchMatchTier("пуш", "X", "Пушкин")).toBe(2);
  });
});
