import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchBooks,
  borrowBook,
  returnBook,
  fetchMyBooks,
} from "./booksApi.js";

describe("booksApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("fetchBooks builds correct URL with params", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ books: [], total: 0, page: 1, pages: 1 }),
    });

    await fetchBooks({ search: "война", genre: "Novel", page: 2 });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/books?"),
      expect.any(Object)
    );
    const url = fetch.mock.calls[0][0];
    expect(url).toContain("search=");
    expect(decodeURIComponent(url)).toContain("война");
    expect(url).toContain("genre=Novel");
    expect(url).toContain("page=2");
  });

  it("fetchBooks returns books and pages", async () => {
    const mockData = {
      books: [{ _id: "1", title: "Война и мир", author: "Толстой" }],
      total: 1,
      page: 1,
      pages: 1,
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchBooks({});
    expect(result).toEqual(mockData);
  });

  it("borrowBook sends POST with credentials", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Книга успешно выдана" }),
    });

    await borrowBook("book123");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/books/book123/borrow"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );
  });

  it("returnBook sends POST with credentials", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Книга возвращена" }),
    });

    await returnBook("book456");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/books/book456/return"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );
  });

  it("fetchMyBooks sends GET with credentials", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchMyBooks();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/books/my"),
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      })
    );
  });

  it("throws on API error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Книга уже выдана" }),
    });

    await expect(borrowBook("book1")).rejects.toThrow("Книга уже выдана");
  });
});
