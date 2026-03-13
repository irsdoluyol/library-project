import { API_URL } from "../config.js";
import { request } from "./request.js";

export async function fetchBooks({
  search = "",
  genre = "",
  page = 1,
  limit = 8,
  sort = "createdAt",
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("sort", sort);
  if (search) params.set("search", search);
  if (genre) params.set("genre", genre);

  return request(`/books?${params.toString()}`);
}

export async function fetchMyBooks() {
  return request("/books/my");
}

export async function createBook(payload) {
  return request("/books", { method: "POST", body: payload });
}

export async function updateBook(id, payload) {
  return request(`/books/${id}`, { method: "PUT", body: payload });
}

export async function deleteBook(id) {
  return request(`/books/${id}`, { method: "DELETE" });
}

export function getCoverUrl(bookId) {
  return `${API_URL}/books/${bookId}/cover`;
}

export async function uploadBookCover(bookId, file) {
  const formData = new FormData();
  formData.append("cover", file);
  const url = `${API_URL}/books/${bookId}/cover`;
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || "Ошибка загрузки обложки");
  return data;
}

export async function borrowBook(bookId) {
  return request(`/books/${bookId}/borrow`, { method: "POST" });
}

export async function returnBook(bookId) {
  return request(`/books/${bookId}/return`, { method: "POST" });
}

export async function uploadBookFile(bookId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_URL}/books/${bookId}/upload`;
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data?.message || `Ошибка ${response.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function fetchBookContent(bookId) {
  const url = `${API_URL}/books/${bookId}/read`;
  const response = await fetch(url, { credentials: "include" });
  const contentType = response.headers.get("Content-Type") || "";

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Ошибка ${response.status}`);
  }

  if (contentType.includes("application/pdf")) {
    const blob = await response.blob();
    return { type: "pdf", blob };
  }
  const data = await response.json().catch(() => ({}));
  return { type: "txt", content: data.content || "" };
}
